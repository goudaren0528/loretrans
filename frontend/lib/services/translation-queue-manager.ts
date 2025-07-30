/**
 * 真正的FIFO队列管理器
 * 解决并发处理导致的资源竞争和任务失败问题
 */

interface QueueTask {
  id: string
  type: 'text' | 'document'
  userId?: string
  priority: number
  createdAt: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
  data: any
  retryCount: number
  maxRetries: number
}

class TranslationQueueManager {
  private queue: QueueTask[] = []
  private processing: Set<string> = new Set()
  private maxConcurrent: number = 1 // 🔥 改为1，严格串行处理
  private isProcessing: boolean = false

  constructor(maxConcurrent: number = 1) {
    this.maxConcurrent = maxConcurrent
    this.startProcessing()
  }

  /**
   * 添加任务到队列
   */
  addTask(task: Omit<QueueTask, 'createdAt' | 'status' | 'retryCount'>): QueueTask {
    const queueTask: QueueTask = {
      ...task,
      createdAt: new Date(),
      status: 'pending',
      retryCount: 0,
      maxRetries: 3
    }

    // 按优先级插入队列（高优先级在前）
    const insertIndex = this.queue.findIndex(t => t.priority < queueTask.priority)
    if (insertIndex === -1) {
      this.queue.push(queueTask)
    } else {
      this.queue.splice(insertIndex, 0, queueTask)
    }

    console.log(`[Queue Manager] 任务已添加到队列: ${task.id}, 队列长度: ${this.queue.length}`)
    this.processNext()
    
    return queueTask
  }

  /**
   * 获取队列状态
   */
  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      processingCount: this.processing.size,
      pendingTasks: this.queue.filter(t => t.status === 'pending').length,
      processingTasks: Array.from(this.processing)
    }
  }

  /**
   * 开始处理队列
   */
  private startProcessing() {
    if (this.isProcessing) return
    
    this.isProcessing = true
    this.processNext()
  }

  /**
   * 处理下一个任务
   */
  private async processNext() {
    // 检查是否达到并发限制
    if (this.processing.size >= this.maxConcurrent) {
      console.log(`[Queue Manager] 已达到最大并发数 ${this.maxConcurrent}，等待中...`)
      return
    }

    // 获取下一个待处理任务
    const nextTask = this.queue.find(t => t.status === 'pending')
    if (!nextTask) {
      console.log('[Queue Manager] 队列中没有待处理任务')
      return
    }

    // 标记任务为处理中
    nextTask.status = 'processing'
    this.processing.add(nextTask.id)

    console.log(`[Queue Manager] 开始处理任务: ${nextTask.id}, 类型: ${nextTask.type}`)

    try {
      // 根据任务类型调用相应的处理函数
      if (nextTask.type === 'text') {
        await this.processTextTask(nextTask)
      } else if (nextTask.type === 'document') {
        await this.processDocumentTask(nextTask)
      }

      nextTask.status = 'completed'
      console.log(`[Queue Manager] 任务完成: ${nextTask.id}`)

    } catch (error) {
      console.error(`[Queue Manager] 任务失败: ${nextTask.id}`, error)
      
      // 重试逻辑
      if (nextTask.retryCount < nextTask.maxRetries) {
        nextTask.retryCount++
        nextTask.status = 'pending'
        console.log(`[Queue Manager] 任务重试 ${nextTask.retryCount}/${nextTask.maxRetries}: ${nextTask.id}`)
        
        // 延迟重试
        setTimeout(() => this.processNext(), 5000)
      } else {
        nextTask.status = 'failed'
        console.log(`[Queue Manager] 任务彻底失败: ${nextTask.id}`)
      }
    } finally {
      // 从处理中移除
      this.processing.delete(nextTask.id)
      
      // 如果任务完成或失败，从队列中移除
      if (nextTask.status === 'completed' || nextTask.status === 'failed') {
        const index = this.queue.findIndex(t => t.id === nextTask.id)
        if (index !== -1) {
          this.queue.splice(index, 1)
        }
      }

      // 继续处理下一个任务
      setTimeout(() => this.processNext(), 1000)
    }
  }

  /**
   * 处理文本翻译任务
   */
  private async processTextTask(task: QueueTask): Promise<void> {
    console.log(`[Queue Manager] 处理文本翻译任务: ${task.id}`)
    
    // 调用现有的文本翻译逻辑
    const response = await fetch('/api/translate/queue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task.data)
    })

    if (!response.ok) {
      throw new Error(`文本翻译失败: ${response.statusText}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || '文本翻译失败')
    }
  }

  /**
   * 处理文档翻译任务
   */
  private async processDocumentTask(task: QueueTask): Promise<void> {
    console.log(`[Queue Manager] 处理文档翻译任务: ${task.id}`)
    
    // 调用现有的文档翻译逻辑
    const response = await fetch('/api/document/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task.data)
    })

    if (!response.ok) {
      throw new Error(`文档翻译失败: ${response.statusText}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || '文档翻译失败')
    }
  }

  /**
   * 取消任务
   */
  cancelTask(taskId: string): boolean {
    const taskIndex = this.queue.findIndex(t => t.id === taskId)
    if (taskIndex !== -1) {
      const task = this.queue[taskIndex]
      if (task.status === 'pending') {
        this.queue.splice(taskIndex, 1)
        console.log(`[Queue Manager] 任务已取消: ${taskId}`)
        return true
      }
    }
    return false
  }

  /**
   * 清理完成的任务
   */
  cleanup() {
    const before = this.queue.length
    this.queue = this.queue.filter(t => 
      t.status === 'pending' || t.status === 'processing'
    )
    const after = this.queue.length
    
    if (before !== after) {
      console.log(`[Queue Manager] 清理了 ${before - after} 个已完成的任务`)
    }
  }
}

// 全局队列管理器实例
export const globalQueueManager = new TranslationQueueManager(1) // 严格串行处理

// 定期清理
setInterval(() => {
  globalQueueManager.cleanup()
}, 60000) // 每分钟清理一次
