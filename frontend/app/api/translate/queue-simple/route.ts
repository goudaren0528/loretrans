import { NextRequest, NextResponse } from 'next/server'

// 简单的FIFO队列实现
class SimpleQueue {
  private queue: any[] = []
  private processing = false

  add(task: any) {
    this.queue.push(task)
    console.log(`[Simple Queue] 任务已添加: ${task.id}, 队列长度: ${this.queue.length}`)
    this.processNext()
  }

  private async processNext() {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true
    const task = this.queue.shift()
    
    console.log(`[Simple Queue] 开始处理任务: ${task.id}`)
    
    try {
      // 调用原有的翻译API
      const response = await fetch('http://localhost:3000/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: task.text,
          sourceLang: task.sourceLanguage,
          targetLang: task.targetLanguage
        })
      })
      
      const result = await response.json()
      console.log(`[Simple Queue] 任务完成: ${task.id}`)
      
    } catch (error) {
      console.error(`[Simple Queue] 任务失败: ${task.id}`, error)
    }
    
    this.processing = false
    
    // 处理下一个任务
    setTimeout(() => this.processNext(), 1000)
  }
}

const simpleQueue = new SimpleQueue()

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { text, sourceLang, targetLang } = body

  const task = {
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    text,
    sourceLanguage: sourceLang,
    targetLanguage: targetLang,
    createdAt: new Date()
  }

  simpleQueue.add(task)

  return NextResponse.json({
    success: true,
    taskId: task.id,
    message: '任务已添加到队列'
  })
}
