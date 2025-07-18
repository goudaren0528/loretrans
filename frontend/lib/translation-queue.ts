/**
 * 翻译队列状态检查器
 */

export interface QueueJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: string;
  error?: string;
  totalChunks: number;
  createdAt: string;
  updatedAt: string;
}

export class TranslationQueueChecker {
  private checkInterval: number = 2000; // 2秒检查一次
  
  /**
   * 轮询检查任务状态
   */
  async pollJobStatus(jobId: string, onUpdate: (job: QueueJob) => void): Promise<QueueJob> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const response = await fetch(`/api/translate/queue?jobId=${jobId}`);
          const result = await response.json();
          
          if (!result.success) {
            reject(new Error(result.error || '查询任务状态失败'));
            return;
          }
          
          const job = result.job;
          onUpdate(job);
          
          if (job.status === 'completed') {
            resolve(job);
          } else if (job.status === 'failed') {
            reject(new Error(job.error || '翻译任务失败'));
          } else {
            // 继续轮询
            setTimeout(poll, this.checkInterval);
          }
          
        } catch (error) {
          reject(error);
        }
      };
      
      poll();
    });
  }
  
  /**
   * 一次性检查任务状态
   */
  async checkJobStatus(jobId: string): Promise<QueueJob> {
    const response = await fetch(`/api/translate/queue?jobId=${jobId}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || '查询任务状态失败');
    }
    
    return result.job;
  }
}

export const queueChecker = new TranslationQueueChecker();

export interface TranslationTask {
  id: string;
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: string;
  translatedText?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  sessionId?: string;
  queueJobId?: string;
}

class TranslationQueueManager {
  private tasks: Map<string, TranslationTask> = new Map();
  
  getUserTasks(sessionId: string): TranslationTask[] {
    console.log('[Queue] 获取用户任务，sessionId:', sessionId, '总任务数:', this.tasks.size);
    
    const userTasks: TranslationTask[] = [];
    for (const task of this.tasks.values()) {
      // 匹配 sessionId 或者如果没有 sessionId 则显示所有任务（用于调试）
      if (!sessionId || task.sessionId === sessionId || !task.sessionId) {
        userTasks.push(task);
      }
    }
    
    const sortedTasks = userTasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    console.log('[Queue] 返回任务数:', sortedTasks.length);
    
    return sortedTasks;
  }
  
  async addTask(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    options: {
      type: 'text' | 'document';
      priority: number;
      userId?: string;
      sessionId: string;
    }
  ): Promise<TranslationTask> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: TranslationTask = {
      id: taskId,
      text,
      sourceLanguage,
      targetLanguage,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      sessionId: options.sessionId,
      result: '',
      translatedText: '',
      error: ''
    };
    
    console.log('[Queue] 创建新任务:', {
      id: taskId,
      textLength: text.length,
      willUseQueue: text.length > 1000
    });
    
    this.tasks.set(taskId, task);
    
    // 立即触发初始状态更新
    this.dispatchTaskUpdate(task);
    
    // 根据文本长度决定使用哪个API
    try {
      if (text.length > 1000) {
        // 长文本使用队列API
        console.log(`[Queue] 长文本(${text.length}字符)使用队列处理`);
        
        task.status = 'processing';
        task.progress = 5; // 降低初始进度，避免过度乐观
        task.updatedAt = new Date();
        this.dispatchTaskUpdate(task);
        
        const response = await fetch('/api/translate/queue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            sourceLanguage,
            targetLanguage
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          task.status = 'processing';
          task.progress = 10; // 降低提交成功后的进度
          task.queueJobId = result.jobId;
          task.updatedAt = new Date();
          this.dispatchTaskUpdate(task);
          
          // 开始轮询队列状态
          this.pollQueueStatus(taskId, result.jobId);
        } else {
          task.status = 'failed';
          task.error = result.error || '队列处理失败';
          task.updatedAt = new Date();
          this.dispatchTaskUpdate(task);
        }
      } else {
        // 短文本直接翻译
        console.log(`[Queue] 短文本(${text.length}字符)直接翻译`);
        
        task.status = 'processing';
        task.progress = 50;
        task.updatedAt = new Date();
        this.dispatchTaskUpdate(task);
        
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            sourceLang: sourceLanguage,
            targetLang: targetLanguage
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('[Queue] API响应:', result);
        
        if (result.translatedText) {
          task.status = 'completed';
          task.progress = 100;
          task.translatedText = result.translatedText;
          task.result = result.translatedText;
          task.updatedAt = new Date();
          
          console.log('[Queue] 翻译完成:', task.translatedText);
          this.dispatchTaskUpdate(task);
        } else if (result.useQueue && result.jobId) {
          // 意外进入队列模式
          console.log('[Queue] 意外进入队列模式');
          task.queueJobId = result.jobId;
          task.progress = 30;
          this.dispatchTaskUpdate(task);
          this.pollQueueStatus(taskId, result.jobId);
        } else {
          task.status = 'failed';
          task.error = result.error || '翻译失败：未返回翻译结果';
          task.updatedAt = new Date();
          
          console.error('[Queue] 翻译失败:', task.error);
          this.dispatchTaskUpdate(task);
        }
      }
    } catch (error) {
      console.error('[Queue] API调用失败:', error);
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : '网络请求失败';
      task.updatedAt = new Date();
      
      this.dispatchTaskUpdate(task);
    }
    
    return task;
  }
  
  private async pollQueueStatus(taskId: string, queueJobId: string) {
    const task = this.tasks.get(taskId);
    if (!task) return;
    
    // 健康检查缓存
    let lastHealthCheck = 0;
    let lastHealthStatus = true;
    const healthCheckInterval = 15000; // 增加到15秒内不重复检查
    
    // 检查服务是否可用
    const checkConnection = async () => {
      const now = Date.now();
      
      // 如果最近检查过且状态良好，直接返回
      if (lastHealthStatus && (now - lastHealthCheck) < healthCheckInterval) {
        console.log('[Queue] 使用缓存的健康状态: 正常');
        return true;
      }
      
      try {
        // 增加超时时间以匹配后端健康检查的处理时间
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('[Queue] 健康检查超时，中止请求');
          controller.abort();
        }, 12000); // 12秒超时，给后端足够时间
        
        const response = await fetch('/api/health', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        lastHealthCheck = now;
        
        if (!response.ok) {
          console.log('[Queue] 健康检查HTTP状态异常:', response.status);
          lastHealthStatus = false;
          return false;
        }
        
        // 检查服务状态详情
        const healthData = await response.json();
        
        // 只有当NLLB服务完全不可用时才认为服务不可用
        // degraded状态仍然允许翻译继续进行
        if (healthData.services?.nllb_service === 'unhealthy') {
          console.log('[Queue] NLLB服务不可用:', healthData.services?.nllb_service);
          lastHealthStatus = false;
          return false;
        }
        
        // healthy 或 degraded 状态都允许继续
        console.log('[Queue] 服务状态检查通过:', healthData.status, 'NLLB:', healthData.services?.nllb_service);
        lastHealthStatus = true;
        return true;
      } catch (error) {
        console.log('[Queue] 连接检查失败:', error.message);
        lastHealthCheck = now;
        
        // 如果是超时错误，但后端可能仍在工作，给一次机会
        if (error.message.includes('timed out') || error.message.includes('aborted')) {
          console.log('[Queue] 超时错误，但可能是健康检查慢，允许继续尝试');
          lastHealthStatus = true; // 暂时标记为可用
          return true;
        }
        
        lastHealthStatus = false;
        return false;
      }
    };
    
    const poll = async () => {
      // 先检查连接
      if (!(await checkConnection())) {
        console.log('[Queue] 服务不可用，停止轮询');
        task.status = 'failed';
        task.error = '服务暂时不可用，请稍后重试';
        task.updatedAt = new Date();
        this.dispatchTaskUpdate(task);
        return;
      }
      try {
        const response = await fetch(`/api/translate/queue?jobId=${queueJobId}`);
        
        // 处理404错误 - 任务不存在或已过期
        if (response.status === 404) {
          console.log('[Queue] 任务不存在或已过期，可能服务已重启');
          task.status = 'failed';
          task.error = '任务已过期或服务重启，请重新提交翻译请求';
          task.updatedAt = new Date();
          this.dispatchTaskUpdate(task);
          return;
        }
        
        const result = await response.json();
        
        if (result.success) {
          const job = result.job;
          
          task.status = job.status as any;
          task.progress = job.progress;
          task.updatedAt = new Date();
          
          if (job.status === 'completed') {
            console.log('[Queue] 任务完成，结果长度:', job.result?.length || 0);
            
            // 确保有实际的翻译结果才标记为完成
            if (job.result && job.result.trim() && job.result.length > 0) {
              task.translatedText = job.result;
              task.result = job.result;
              task.status = 'completed';
              this.dispatchTaskUpdate(task);
            } else {
              console.log('[Queue] 任务标记为完成但结果为空，继续轮询');
              task.status = 'processing';
              setTimeout(poll, 2000);
              this.dispatchTaskUpdate(task);
            }
          } else if (job.status === 'failed') {
            console.log('[Queue] 任务失败:', job.error);
            task.error = job.error;
            task.status = 'failed';
            this.dispatchTaskUpdate(task);
          } else {
            console.log('[Queue] 任务进行中:', job.status, job.progress + '%');
            // 更新任务进度，采用更智能的策略
            const backendProgress = job.progress || 0;
            const currentProgress = task.progress || 0;
            
            // 智能进度更新策略
            if (backendProgress >= currentProgress) {
              // 后端进度大于等于当前进度，正常更新
              task.progress = backendProgress;
              if (backendProgress > currentProgress) {
                console.log('[Queue] 进度更新:', currentProgress + '% → ' + backendProgress + '%');
              }
            } else if (backendProgress === 0 && currentProgress <= 10) {
              // 如果后端返回0且当前进度很小（<=10%），可能是刚开始，允许重置
              task.progress = 0;
              console.log('[Queue] 重置进度为0% (任务刚开始)');
            } else {
              // 其他情况保持当前进度，避免大幅倒退
              console.log('[Queue] 保持当前进度:', currentProgress + '% (避免倒退到' + backendProgress + '%)');
            }
            
            task.status = 'processing';
            task.updatedAt = new Date();
            // 继续轮询
            setTimeout(poll, 2000);
            this.dispatchTaskUpdate(task);
          }
        } else {
          // API返回success: false
          console.log('[Queue] API返回失败:', result.error);
          
          if (result.code === 'JOB_NOT_FOUND') {
            task.status = 'failed';
            task.error = result.suggestion || '任务不存在，请重新提交翻译请求';
            task.updatedAt = new Date();
            this.dispatchTaskUpdate(task);
            return;
          } else {
            // 其他错误，继续重试
            setTimeout(poll, 3000);
          }
        }
      } catch (error) {
        console.error('[Queue] 轮询失败:', error);
        
        // 检查是否是连接错误
        if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
          console.log('[Queue] 检测到连接错误，停止轮询');
          task.status = 'failed';
          task.error = '服务连接失败，请刷新页面重试';
          task.updatedAt = new Date();
          this.dispatchTaskUpdate(task);
        } else {
          // 其他错误继续重试
          setTimeout(poll, 5000); // 5秒后重试
        }
      }
    };
    
    // 1秒后开始轮询
    setTimeout(poll, 1000);
  }
  
  private dispatchTaskUpdate(task: TranslationTask) {
    console.log('[Queue] 触发任务更新事件:', {
      id: task.id,
      status: task.status,
      progress: task.progress,
      hasResult: !!task.translatedText
    });
    
    // 确保任务在本地存储中更新
    this.tasks.set(task.id, { ...task, updatedAt: new Date() });
    
    // 触发自定义事件通知UI更新
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('translationTaskUpdate', { detail: task });
      window.dispatchEvent(event);
      
      // 额外触发一个通用更新事件
      const genericEvent = new CustomEvent('taskUpdate', { detail: task });
      window.dispatchEvent(genericEvent);
      
      // 触发任务历史更新事件
      const historyEvent = new CustomEvent('taskHistoryUpdate', { detail: task });
      window.dispatchEvent(historyEvent);
    }
  }
  
  updateTask(taskId: string, updates: Partial<TranslationTask>) {
    const task = this.tasks.get(taskId);
    if (task) {
      Object.assign(task, updates);
      task.updatedAt = new Date();
    }
  }
  
  getTask(taskId: string): TranslationTask | undefined {
    return this.tasks.get(taskId);
  }
  
  removeTask(taskId: string) {
    this.tasks.delete(taskId);
  }
  
  // 清理过期任务
  cleanup() {
    const now = new Date();
    for (const [taskId, task] of this.tasks.entries()) {
      const ageInHours = (now.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60);
      if (ageInHours > 24) { // 24小时后清理
        this.tasks.delete(taskId);
      }
    }
  }
}

export const translationQueue = new TranslationQueueManager();

// 定期清理过期任务
if (typeof window !== 'undefined') {
  setInterval(() => {
    translationQueue.cleanup();
  }, 60 * 60 * 1000); // 每小时清理一次
}
