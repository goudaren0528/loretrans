import { v4 as uuidv4 } from 'uuid'
import { getQueueConfig } from './config'

export interface TranslationTask {
  id: string
  type: 'text' | 'document'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  priority: number
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  
  // 输入数据
  sourceText: string
  sourceLanguage: string
  targetLanguage: string
  characterCount: number
  
  // 输出数据
  translatedText?: string
  error?: string
  
  // 元数据
  userId?: string
  sessionId: string
  estimatedTime?: number
  actualTime?: number
  retryCount: number
  maxRetries: number
}

export interface QueueStats {
  totalTasks: number
  pendingTasks: number
  processingTasks: number
  completedTasks: number
  failedTasks: number
  averageProcessingTime: number
}

class TranslationQueue {
  private tasks: Map<string, TranslationTask> = new Map()
  private processingTasks: Set<string> = new Set()
  private listeners: Map<string, (task: TranslationTask) => void> = new Map()
  private queueConfig = getQueueConfig()

  /**
   * 添加翻译任务
   */
  addTask(
    sourceText: string,
    sourceLanguage: string,
    targetLanguage: string,
    options: {
      type?: 'text' | 'document'
      priority?: number
      userId?: string
      sessionId?: string
    } = {}
  ): TranslationTask {
    const task: TranslationTask = {
      id: uuidv4(),
      type: options.type || 'text',
      status: 'pending',
      priority: options.priority || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      sourceText,
      sourceLanguage,
      targetLanguage,
      characterCount: sourceText.length,
      
      userId: options.userId,
      sessionId: options.sessionId || uuidv4(),
      retryCount: 0,
      maxRetries: this.queueConfig.retryAttempts,
    }

    this.tasks.set(task.id, task)
    this.processQueue()
    
    return task
  }

  /**
   * 获取任务
   */
  getTask(taskId: string): TranslationTask | undefined {
    return this.tasks.get(taskId)
  }

  /**
   * 获取用户任务列表
   */
  getUserTasks(sessionId: string): TranslationTask[] {
    return Array.from(this.tasks.values())
      .filter(task => task.sessionId === sessionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * 监听任务状态变化
   */
  onTaskUpdate(taskId: string, callback: (task: TranslationTask) => void) {
    this.listeners.set(taskId, callback)
  }

  /**
   * 移除任务监听
   */
  removeTaskListener(taskId: string) {
    this.listeners.delete(taskId)
  }

  /**
   * 更新任务状态
   */
  private updateTask(taskId: string, updates: Partial<TranslationTask>) {
    const task = this.tasks.get(taskId)
    if (!task) return

    Object.assign(task, updates, { updatedAt: new Date() })
    
    // 通知监听器
    const listener = this.listeners.get(taskId)
    if (listener) {
      listener(task)
    }

    // 广播更新（用于UI刷新）
    this.broadcastUpdate(task)
  }

  /**
   * 处理队列
   */
  private async processQueue() {
    const maxConcurrent = this.queueConfig.maxConcurrentTasks
    
    if (this.processingTasks.size >= maxConcurrent) {
      return
    }

    // 获取待处理任务（按优先级和创建时间排序）
    const pendingTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'pending')
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority // 高优先级优先
        }
        return a.createdAt.getTime() - b.createdAt.getTime() // 早创建的优先
      })

    for (const task of pendingTasks) {
      if (this.processingTasks.size >= maxConcurrent) {
        break
      }

      this.processTask(task)
    }
  }

  /**
   * 处理单个任务
   */
  private async processTask(task: TranslationTask) {
    this.processingTasks.add(task.id)
    this.updateTask(task.id, { 
      status: 'processing',
      estimatedTime: this.estimateProcessingTime(task.characterCount)
    })

    const startTime = Date.now()

    try {
      // 调用翻译API
      const translatedText = await this.callTranslationAPI(
        task.sourceText,
        task.sourceLanguage,
        task.targetLanguage
      )

      const actualTime = Date.now() - startTime

      this.updateTask(task.id, {
        status: 'completed',
        translatedText,
        completedAt: new Date(),
        actualTime
      })

    } catch (error) {
      console.error(`Translation task ${task.id} failed:`, error)
      
      // 重试逻辑
      if (task.retryCount < task.maxRetries) {
        this.updateTask(task.id, {
          status: 'pending',
          retryCount: task.retryCount + 1
        })
        
        // 延迟重试
        setTimeout(() => {
          this.processQueue()
        }, this.queueConfig.retryDelay)
      } else {
        this.updateTask(task.id, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Translation failed'
        })
      }
    } finally {
      this.processingTasks.delete(task.id)
      this.processQueue() // 处理下一个任务
    }
  }

  /**
   * 调用翻译API
   */
  private async callTranslationAPI(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    const response = await fetch('/api/translate-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLang: sourceLanguage,
        targetLang: targetLanguage,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Translation API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.translated_text
  }

  /**
   * 估算处理时间
   */
  private estimateProcessingTime(characterCount: number): number {
    // 基于字符数估算处理时间（毫秒）
    const baseTime = 2000 // 基础时间 2秒
    const timePerChar = 0.5 // 每字符 0.5毫秒
    return baseTime + (characterCount * timePerChar)
  }

  /**
   * 广播任务更新
   */
  private broadcastUpdate(task: TranslationTask) {
    // 使用 CustomEvent 广播更新
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('translationTaskUpdate', {
        detail: task
      }))
    }
  }

  /**
   * 获取队列统计信息
   */
  getQueueStats(): QueueStats {
    const tasks = Array.from(this.tasks.values())
    const completedTasks = tasks.filter(t => t.status === 'completed')
    
    const averageProcessingTime = completedTasks.length > 0
      ? completedTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0) / completedTasks.length
      : 0

    return {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      processingTasks: tasks.filter(t => t.status === 'processing').length,
      completedTasks: completedTasks.length,
      failedTasks: tasks.filter(t => t.status === 'failed').length,
      averageProcessingTime
    }
  }

  /**
   * 清理旧任务
   */
  cleanupOldTasks(maxAge: number = 24 * 60 * 60 * 1000) { // 默认24小时
    const now = Date.now()
    const tasksToDelete: string[] = []

    for (const [taskId, task] of this.tasks) {
      if (now - task.createdAt.getTime() > maxAge) {
        tasksToDelete.push(taskId)
      }
    }

    tasksToDelete.forEach(taskId => {
      this.tasks.delete(taskId)
      this.listeners.delete(taskId)
    })
  }
}

// 单例模式
export const translationQueue = new TranslationQueue()

// 定期清理旧任务
if (typeof window !== 'undefined') {
  setInterval(() => {
    translationQueue.cleanupOldTasks()
  }, 60 * 60 * 1000) // 每小时清理一次
}
