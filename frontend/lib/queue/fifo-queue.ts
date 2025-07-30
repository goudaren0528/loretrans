/**
 * 真正的FIFO队列管理器
 * 确保任务严格按照提交顺序串行处理
 */

interface QueueTask {
  id: string
  type: 'text' | 'document'
  data: any
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  error?: string
  retryCount: number
}

class FIFOQueue {
  private queue: QueueTask[] = []
  private isProcessing = false
  private currentTask: QueueTask | null = null

  /**
   * 添加任务到队列末尾
   */
  enqueue(task: Omit<QueueTask, 'status' | 'createdAt' | 'retryCount'>): QueueTask {
    const queueTask: QueueTask = {
      ...task,
      status: 'pending',
      createdAt: new Date(),
      retryCount: 0
    }

    this.queue.push(queueTask)
    console.log(`[FIFO Queue] 任务入队: ${task.id}, 队列长度: ${this.queue.length}`)
    
    // 如果队列处理器未运行，启动它
    if (!this.isProcessing) {
      this.startProcessing()
    }

    return queueTask
  }

  /**
   * 获取队列状态
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      currentTask: this.currentTask?.id || null,
      pendingTasks: this.queue.filter(t => t.status === 'pending').length
    }
  }

  /**
   * 启动队列处理器
   */
  private async startProcessing() {
    if (this.isProcessing) {
      console.log('[FIFO Queue] 处理器已在运行')
      return
    }

    this.isProcessing = true
    console.log('[FIFO Queue] 启动队列处理器')

    while (this.queue.length > 0) {
      const task = this.queue.shift()!
      
      if (task.status !== 'pending') {
        continue
      }

      this.currentTask = task
      task.status = 'processing'
      task.startedAt = new Date()

      console.log(`[FIFO Queue] 开始处理任务: ${task.id} (类型: ${task.type})`)

      try {
        await this.processTask(task)
        task.status = 'completed'
        task.completedAt = new Date()
        console.log(`[FIFO Queue] 任务完成: ${task.id}`)
      } catch (error: any) {
        console.error(`[FIFO Queue] 任务失败: ${task.id}`, error)
        
        if (task.retryCount < 2) {
          // 重试逻辑
          task.retryCount++
          task.status = 'pending'
          this.queue.unshift(task) // 重新放到队列前面
          console.log(`[FIFO Queue] 任务重试 ${task.retryCount}/2: ${task.id}`)
        } else {
          task.status = 'failed'
          task.error = error.message
          task.completedAt = new Date()
          console.log(`[FIFO Queue] 任务彻底失败: ${task.id}`)
        }
      }

      this.currentTask = null
      
      // 任务间延迟，避免过快处理
      if (this.queue.length > 0) {
        console.log('[FIFO Queue] 任务间延迟 2秒...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    this.isProcessing = false
    console.log('[FIFO Queue] 队列处理器结束')
  }

  /**
   * 处理单个任务
   */
  private async processTask(task: QueueTask): Promise<void> {
    if (task.type === 'text') {
      return this.processTextTask(task)
    } else if (task.type === 'document') {
      return this.processDocumentTask(task)
    } else {
      throw new Error(`未知任务类型: ${task.type}`)
    }
  }

  /**
   * 处理文本翻译任务
   */
  private async processTextTask(task: QueueTask): Promise<void> {
    const response = await fetch('/api/translate/direct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task.data)
    })

    if (!response.ok) {
      throw new Error(`文本翻译失败: ${response.status} ${response.statusText}`)
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
    const response = await fetch('/api/document/translate/direct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task.data)
    })

    if (!response.ok) {
      throw new Error(`文档翻译失败: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || '文档翻译失败')
    }
  }
}

// 全局FIFO队列实例
export const globalFIFOQueue = new FIFOQueue()

// 导出队列状态查询函数
export function getQueueStatus() {
  return globalFIFOQueue.getStatus()
}

// 导出任务添加函数
export function addTaskToQueue(task: Omit<QueueTask, 'status' | 'createdAt' | 'retryCount'>) {
  return globalFIFOQueue.enqueue(task)
}
