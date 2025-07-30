/**
 * 真正的FIFO队列管理器 (JavaScript版本)
 * 确保任务严格按照提交顺序串行处理
 */

class FIFOQueue {
  constructor() {
    this.queue = []
    this.isProcessing = false
    this.currentTask = null
  }

  /**
   * 添加任务到队列末尾
   */
  enqueue(task) {
    const queueTask = {
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
  async startProcessing() {
    if (this.isProcessing) {
      console.log('[FIFO Queue] 处理器已在运行')
      return
    }

    this.isProcessing = true
    console.log('[FIFO Queue] 启动队列处理器')

    while (this.queue.length > 0) {
      const task = this.queue.shift()
      
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
      } catch (error) {
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
  async processTask(task) {
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
  async processTextTask(task) {
    try {
      console.log(`[FIFO Queue] 开始处理文本翻译任务: ${task.id}`)
      
      // 直接调用翻译逻辑，不使用HTTP请求
      const result = await this.translateText(task.data)
      
      // 更新数据库状态
      await this.updateTaskStatus(task.id, 'completed', result)
      
      console.log(`[FIFO Queue] 文本翻译任务完成: ${task.id}`)
    } catch (error) {
      console.error(`[FIFO Queue] 文本翻译任务失败: ${task.id}`, error)
      await this.updateTaskStatus(task.id, 'failed', null, error.message)
      throw error
    }
  }

  /**
   * 处理文档翻译任务
   */
  async processDocumentTask(task) {
    try {
      console.log(`[FIFO Queue] 开始处理文档翻译任务: ${task.id}`)
      
      // 调用文档翻译逻辑
      const result = await this.translateDocument(task.data)
      
      // 更新数据库状态
      await this.updateTaskStatus(task.data.dbTaskId, 'completed', result)
      
      console.log(`[FIFO Queue] 文档翻译任务完成: ${task.id}`)
    } catch (error) {
      console.error(`[FIFO Queue] 文档翻译任务失败: ${task.id}`, error)
      await this.updateTaskStatus(task.data.dbTaskId, 'failed', null, error.message)
      throw error
    }
  }

  /**
   * 文本翻译核心逻辑
   */
  async translateText(data) {
    const { text, sourceLang, targetLang } = data
    
    console.log(`[FIFO Queue] 开始文本翻译: ${text.length}字符 (${sourceLang} -> ${targetLang})`)
    
    // 🎯 统一配置：600字符分块
    const chunks = this.smartTextChunking(text, 600)
    const translatedChunks = []
    let successCount = 0

    console.log(`[FIFO Queue] 文本分为 ${chunks.length} 个块`)

    // 🎯 串行处理每个块
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      console.log(`[FIFO Queue] 处理文本块 ${i + 1}/${chunks.length}`)

      // 🔥 修复：不允许使用原文替代，必须翻译成功
      let success = false
      let result = null
      let lastError = null
      
      for (let retry = 0; retry < 10; retry++) { // 增加到10次重试
        try {
          result = await this.translateChunk(chunk, sourceLang, targetLang)
          
          // 验证翻译结果的质量
          if (this.isValidTranslation(result, chunk, sourceLang, targetLang)) {
            success = true
            successCount++
            console.log(`[FIFO Queue] 文本块 ${i + 1} 翻译成功 (尝试 ${retry + 1})`)
            break
          } else {
            console.warn(`[FIFO Queue] 文本块 ${i + 1} 翻译质量不合格，重试 (尝试 ${retry + 1})`)
          }
        } catch (error) {
          lastError = error
          console.error(`[FIFO Queue] 文本块 ${i + 1} 翻译失败 (尝试 ${retry + 1}/10):`, error.message)
          
          // 如果是AbortError，等待更长时间让NLLB恢复
          if (error.message.includes('AbortError') || error.message.includes('超时')) {
            const waitTime = Math.min(5000 + retry * 2000, 15000) // 5-15秒递增等待
            console.log(`[FIFO Queue] 检测到服务超时，等待 ${waitTime}ms 让NLLB服务恢复...`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
          } else {
            // 其他错误等待较短时间
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        }
      }
      
      if (!success) {
        // 🚨 翻译失败时抛出错误，不使用原文替代
        const errorMsg = `文本块 ${i + 1} 经过10次重试仍然翻译失败: ${lastError?.message || '未知错误'}`
        console.error(`[FIFO Queue] ${errorMsg}`)
        throw new Error(errorMsg)
      }
      
      translatedChunks.push(result)
      
      // 🎯 块间延迟2秒
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    const finalResult = translatedChunks.join(' ')
    console.log(`[FIFO Queue] 文本翻译完成: ${successCount}/${chunks.length} 块成功翻译`)
    
    return finalResult
  }

  /**
   * 文档翻译核心逻辑 - 统一使用FIFO队列处理
   */
  async translateDocument(data) {
    const { jobId, dbTaskId, filePath, sourceLang, targetLang, originalContent, chunks, userId, creditsUsed, fileName } = data
    
    console.log(`[FIFO Queue] 开始文档翻译: ${originalContent?.length || 0}字符 (${sourceLang} -> ${targetLang})`)
    console.log(`[FIFO Queue] 使用预分块: ${chunks.length} 个块`)
    
    const translatedChunks = []
    let successCount = 0

    // 🎯 串行处理每个块
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      console.log(`[FIFO Queue] 处理文档块 ${i + 1}/${chunks.length}`)

      // 🔥 修复：不允许使用原文替代，必须翻译成功
      let success = false
      let result = null
      let lastError = null
      
      for (let retry = 0; retry < 10; retry++) { // 增加到10次重试
        try {
          result = await this.translateChunk(chunk, sourceLang, targetLang)
          
          // 验证翻译结果的质量
          if (this.isValidTranslation(result, chunk, sourceLang, targetLang)) {
            success = true
            successCount++
            console.log(`[FIFO Queue] 文档块 ${i + 1} 翻译成功 (尝试 ${retry + 1})`)
            break
          } else {
            console.warn(`[FIFO Queue] 文档块 ${i + 1} 翻译质量不合格，重试 (尝试 ${retry + 1})`)
          }
        } catch (error) {
          lastError = error
          console.error(`[FIFO Queue] 文档块 ${i + 1} 翻译失败 (尝试 ${retry + 1}/10):`, error.message)
          
          // 如果是AbortError，等待更长时间让NLLB恢复
          if (error.message.includes('AbortError') || error.message.includes('超时')) {
            const waitTime = Math.min(5000 + retry * 2000, 15000) // 5-15秒递增等待
            console.log(`[FIFO Queue] 检测到服务超时，等待 ${waitTime}ms 让NLLB服务恢复...`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
          } else {
            // 其他错误等待较短时间
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        }
      }
      
      if (!success) {
        // 🚨 翻译失败时抛出错误，不使用原文替代
        const errorMsg = `文档块 ${i + 1} 经过10次重试仍然翻译失败: ${lastError?.message || '未知错误'}`
        console.error(`[FIFO Queue] ${errorMsg}`)
        
        // 🔥 文档翻译失败时退还积分
        if (userId && creditsUsed > 0) {
          await this.refundCredits(userId, creditsUsed, jobId)
        }
        
        throw new Error(errorMsg)
      }
      
      translatedChunks.push(result)
      
      // 更新进度到数据库
      const progress = Math.round(((i + 1) / chunks.length) * 100)
      await this.updateTaskProgress(dbTaskId, progress, i + 1)
      
      // 🎯 块间延迟2秒
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    const finalResult = translatedChunks.join(' ')
    console.log(`[FIFO Queue] 文档翻译完成: ${successCount}/${chunks.length} 块成功翻译`)
    
    return finalResult
  }

  /**
   * 智能文本分块 - 统一配置600字符
   */
  smartTextChunking(text, maxChunkSize = 600) {
    if (text.length <= maxChunkSize) {
      return [text]
    }

    const chunks = []
    let currentPos = 0

    while (currentPos < text.length) {
      let chunkEnd = Math.min(currentPos + maxChunkSize, text.length)
      
      // 如果不是最后一块，尝试在句子边界分割
      if (chunkEnd < text.length) {
        const sentenceEnd = text.lastIndexOf('.', chunkEnd)
        const questionEnd = text.lastIndexOf('?', chunkEnd)
        const exclamationEnd = text.lastIndexOf('!', chunkEnd)
        
        const bestEnd = Math.max(sentenceEnd, questionEnd, exclamationEnd)
        // 🎯 统一配置：70%最小分割比例
        if (bestEnd > currentPos + maxChunkSize * 0.7) {
          chunkEnd = bestEnd + 1
        }
      }

      chunks.push(text.substring(currentPos, chunkEnd).trim())
      currentPos = chunkEnd
    }

    return chunks.filter(chunk => chunk.length > 0)
  }

  /**
   * 翻译单个文本块 - 使用直接翻译API
   */
  async translateChunk(text, sourceLang, targetLang) {
    // 🎯 使用直接翻译API避免嵌套队列问题
    const internalApiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // 🎯 统一配置：30秒超时
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      console.log(`[FIFO Queue] 开始翻译块: ${text.substring(0, 50)}...`)
      
      const response = await fetch(`${internalApiUrl}/api/translate/direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          sourceLang: sourceLang,
          targetLang: targetLang,
          jobId: `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      // 🎯 处理直接翻译API的响应格式
      let translatedText = text // 默认返回原文
      
      if (result.success && result.translatedText) {
        translatedText = result.translatedText
      } else if (result.result) {
        translatedText = result.result
      } else if (result.translation) {
        translatedText = result.translation
      }
      
      console.log(`[FIFO Queue] 翻译块完成: ${translatedText.substring(0, 50)}...`)
      return translatedText

    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        throw new Error('翻译请求超时 (30秒)')
      }
      
      throw new Error(`翻译失败: ${error.message}`)
    }
  }

  /**
   * 验证翻译结果的质量
   * 确保不是简单的原文返回
   */
  isValidTranslation(translatedText, originalText, sourceLang, targetLang) {
    if (!translatedText || translatedText.trim() === '') {
      return false
    }
    
    // 如果翻译结果与原文完全相同，可能是翻译失败
    if (translatedText.trim() === originalText.trim()) {
      console.warn('[Translation Validation] 翻译结果与原文相同，可能翻译失败')
      return false
    }
    
    // 检查是否包含明显的错误标识
    const errorIndicators = ['error', 'failed', 'undefined', 'null']
    const lowerTranslated = translatedText.toLowerCase()
    
    for (const indicator of errorIndicators) {
      if (lowerTranslated.includes(indicator)) {
        console.warn(`[Translation Validation] 翻译结果包含错误标识: ${indicator}`)
        return false
      }
    }
    
    // 基本长度检查 - 翻译结果不应该太短（除非原文很短）
    if (originalText.length > 50 && translatedText.length < originalText.length * 0.3) {
      console.warn('[Translation Validation] 翻译结果过短，可能不完整')
      return false
    }
    
    // 语言特征检查
    if (sourceLang !== targetLang) {
      // 如果是从非拉丁语言翻译到英语，结果应该包含拉丁字符
      if (targetLang === 'en' && !/[a-zA-Z]/.test(translatedText)) {
        console.warn('[Translation Validation] 英语翻译结果不包含拉丁字符')
        return false
      }
      
      // 如果是从英语翻译到中文，结果应该包含中文字符
      if (targetLang === 'zh' && !/[\u4e00-\u9fff]/.test(translatedText)) {
        console.warn('[Translation Validation] 中文翻译结果不包含中文字符')
        return false
      }
    }
    
    console.log('[Translation Validation] 翻译质量验证通过')
    return true
  }

  /**
   * 更新任务进度到数据库
   */
  async updateTaskProgress(dbTaskId, progress, completedChunks = 0) {
    try {
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      
      const updateData = {
        progress_percentage: progress,
        updated_at: new Date().toISOString()
      }
      
      if (completedChunks > 0) {
        updateData.completed_chunks = completedChunks
      }
      
      const { error } = await supabase
        .from('translation_jobs')
        .update(updateData)
        .eq('id', dbTaskId)
      
      if (error) {
        console.error('[FIFO Queue] 更新任务进度失败:', error)
      } else {
        console.log(`[FIFO Queue] 任务进度已更新: ${dbTaskId} -> ${progress}%`)
      }
    } catch (error) {
      console.error('[FIFO Queue] 更新进度异常:', error)
    }
  }

  /**
   * 退还积分
   */
  async refundCredits(userId, creditsUsed, jobId) {
    try {
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      
      // 先查询用户当前积分
      const { data: userData, error: queryError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single()
      
      if (queryError) {
        console.error(`[FIFO Queue] 查询用户积分失败: ${jobId}`, queryError)
        return
      }
      
      if (userData) {
        // 计算退还后的积分
        const newCredits = userData.credits + creditsUsed
        
        // 更新用户积分
        const { error: refundError } = await supabase
          .from('users')
          .update({ credits: newCredits })
          .eq('id', userId)

        if (refundError) {
          console.error(`[FIFO Queue] 退还积分失败: ${jobId}`, refundError)
        } else {
          console.log(`[FIFO Queue] 翻译失败，已退还积分: ${creditsUsed} 积分给用户 ${userId} (${userData.credits} -> ${newCredits})`)
        }
      }
    } catch (error) {
      console.error(`[FIFO Queue] 积分退还异常: ${jobId}`, error)
    }
  }

  /**
   * 更新任务状态到数据库
   */
  async updateTaskStatus(taskId, status, result, errorMessage) {
    try {
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      const updateData = {
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'completed' && result) {
        updateData.translated_content = result
        updateData.processing_completed_at = new Date().toISOString()
        updateData.progress_percentage = 100
      }

      if (status === 'failed' && errorMessage) {
        updateData.error_message = errorMessage
        updateData.processing_completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('translation_jobs')
        .update(updateData)
        .eq('id', taskId)

      if (error) {
        console.error('[FIFO Queue] 更新任务状态失败:', error)
      } else {
        console.log(`[FIFO Queue] 任务状态已更新: ${taskId} -> ${status}`)
      }
    } catch (error) {
      console.error('[FIFO Queue] 状态更新异常:', error)
    }
  }
}

// 创建全局队列实例
if (typeof global !== 'undefined') {
  if (!global.fifoQueue) {
    global.fifoQueue = new FIFOQueue()
  }
}

// 导出函数
function addTaskToQueue(task) {
  const queue = global.fifoQueue || new FIFOQueue()
  return queue.enqueue(task)
}

function getQueueStatus() {
  const queue = global.fifoQueue || new FIFOQueue()
  return queue.getStatus()
}

module.exports = {
  FIFOQueue,
  addTaskToQueue,
  getQueueStatus
}
