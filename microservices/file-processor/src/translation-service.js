const axios = require('axios')
const fs = require('fs-extra')
const path = require('path')

class TranslationService {
  constructor() {
    this.translationApiUrl = process.env.TRANSLATION_API_URL || 'http://localhost:3000/api/translate'
    this.detectApiUrl = process.env.DETECT_API_URL || 'http://localhost:3000/api/detect'
    this.chunkSize = 1000 // 每块最大字符数
  }

  /**
   * 将长文本分割成适合翻译的块
   */
  /**
   * 智能分块策略：根据文本长度动态调整块大小
   */
  calculateOptimalChunkSize(totalLength) {
    // 基础块大小
    let chunkSize = this.chunkSize // 默认1500
    
    // 如果文本很长，使用更小的块以避免超时
    if (totalLength > 5000) {
      chunkSize = Math.max(800, this.chunkSize / 2) // 较长文本使用小块
    } else if (totalLength > 2000) {
      chunkSize = Math.max(1000, this.chunkSize * 0.75) // 中等文本稍微减小
    }
    
    console.log(`=== SMART CHUNKING ===`)
    console.log(`Total text length: ${totalLength}`)
    console.log(`Optimal chunk size: ${chunkSize}`)
    
    return chunkSize
  }

  /**
   * 智能按句子边界分块，保持语义连续性
   */
  splitTextIntoChunks(text, maxChunkSize = null) {
    // 如果没有指定块大小，计算最优块大小
    if (!maxChunkSize) {
      maxChunkSize = this.calculateOptimalChunkSize(text.length)
    }
    
    console.log(`=== SMART SENTENCE CHUNKING ===`)
    console.log(`Target chunk size: ${maxChunkSize} characters`)
    
    // 更精确的句子分割：保留标点符号在句子末尾
    const sentencePattern = /([^.!?。！？]*[.!?。！？]+)/g
    const sentences = []
    let match
    
    // 提取完整句子（包含标点）
    while ((match = sentencePattern.exec(text)) !== null) {
      const sentence = match[0].trim()
      if (sentence) {
        sentences.push(sentence)
      }
    }
    
    // 处理可能没有标点的剩余文本
    const lastIndex = sentencePattern.lastIndex
    if (lastIndex < text.length) {
      const remaining = text.substring(lastIndex).trim()
      if (remaining) {
        sentences.push(remaining)
      }
    }
    
    console.log(`Found ${sentences.length} sentences`)
    
    const chunks = []
    let currentChunk = ''
    let sentencesInChunk = 0

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i]
      const potentialChunkLength = currentChunk.length + (currentChunk ? 1 : 0) + sentence.length
      
      // 检查是否可以添加到当前块
      if (potentialChunkLength <= maxChunkSize) {
        // 可以添加
        currentChunk += (currentChunk ? ' ' : '') + sentence
        sentencesInChunk++
      } else {
        // 当前句子太长，需要开始新块
        if (currentChunk) {
          chunks.push(currentChunk.trim())
          console.log(`Chunk ${chunks.length}: ${currentChunk.length} chars, ${sentencesInChunk} sentences`)
          currentChunk = ''
          sentencesInChunk = 0
        }
        
        // 检查单个句子是否超过块大小
        if (sentence.length > maxChunkSize) {
          console.log(`⚠️ Long sentence (${sentence.length} chars) exceeds chunk size, will be split`)
          // 对于超长句子，按逗号分割
          const subSentences = sentence.split(/[,，;；:：]/g)
          let tempChunk = ''
          
          for (const subSentence of subSentences) {
            const trimmedSub = subSentence.trim()
            if (!trimmedSub) continue
            
            if (tempChunk.length + trimmedSub.length + 2 <= maxChunkSize) {
              tempChunk += (tempChunk ? ', ' : '') + trimmedSub
            } else {
              if (tempChunk) {
                chunks.push(tempChunk.trim())
                console.log(`Sub-chunk ${chunks.length}: ${tempChunk.length} chars`)
              }
              tempChunk = trimmedSub
            }
          }
          
          if (tempChunk) {
            currentChunk = tempChunk
            sentencesInChunk = 1
          }
        } else {
          // 正常长度的句子
          currentChunk = sentence
          sentencesInChunk = 1
        }
      }
    }

    // 添加最后一个块
    if (currentChunk) {
      chunks.push(currentChunk.trim())
      console.log(`Final chunk ${chunks.length}: ${currentChunk.length} chars, ${sentencesInChunk} sentences`)
    }

    const result = chunks.length > 0 ? chunks : [text]
    
    console.log(`=== CHUNKING SUMMARY ===`)
    console.log(`Original text: ${text.length} characters`)
    console.log(`Split into: ${result.length} chunks`)
    console.log(`Chunk sizes: ${result.map(c => c.length).join(', ')} characters`)
    console.log(`Semantic continuity: Preserved by sentence boundaries`)
    
    return result
  }

  /**
   * 检测文本语言
   */
  async detectLanguage(text) {
    try {
      const response = await axios.post(this.detectApiUrl, {
        text: text.substring(0, 2000), // 取前2000字符进行检测
        multiple: false
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data) {
        // 处理单一检测结果
        if (response.data.language) {
          return response.data.language
        }
        // 处理多重检测结果
        if (response.data.primary && response.data.primary.language) {
          return response.data.primary.language
        }
        // 处理包装在data中的响应
        if (response.data.data && response.data.data.language) {
          return response.data.data.language
        }
      }
      
      throw new Error('Language detection failed')
    } catch (error) {
      console.error('Language detection error:', error.message)
      // 如果检测失败，返回auto让翻译API自动处理
      return 'auto'
    }
  }

  /**
   * 计算基于文本长度的动态超时时间（翻倍以适应NLLB处理时间）
   */
  calculateDynamicTimeout(text) {
    const baseTimeout = 60000 // 基础60秒（翻倍）
    const charCount = text.length
    
    // 每100个字符增加4秒（翻倍）
    const additionalTimeout = Math.ceil(charCount / 100) * 4000
    
    // 最小120秒，最大600秒（10分钟）（翻倍）
    const dynamicTimeout = Math.min(Math.max(baseTimeout + additionalTimeout, 120000), 600000)
    
    console.log(`=== DYNAMIC TIMEOUT CALCULATION ===`)
    console.log(`Text length: ${charCount} characters`)
    console.log(`Base timeout: ${baseTimeout}ms`)
    console.log(`Additional timeout: ${additionalTimeout}ms`)
    console.log(`Final timeout: ${dynamicTimeout}ms (${Math.round(dynamicTimeout/1000)}s)`)
    
    return dynamicTimeout
  }

  /**
   * 翻译单个文本块（带重试和自动拆分）
   */
  async translateChunk(text, sourceLanguage, targetLanguage, retryCount = 0, chunkProgressCallback) {
    const maxRetries = 2
    const maxRetryChunkSize = 500 // 重试时使用的最小块大小

    console.log(`=== TRANSLATE CHUNK (${retryCount}/${maxRetries}) ===`)
    console.log('Text length:', text.length)
    console.log('From:', sourceLanguage, 'To:', targetLanguage)
    
    // 报告开始进度
    if (chunkProgressCallback) {
      chunkProgressCallback(0)
    }

    try {
      // 计算超时时间
      const timeout = this.calculateDynamicTimeout(text)
      console.log('Calculated timeout:', timeout, 'ms')

      // 报告发送请求进度
      if (chunkProgressCallback) {
        chunkProgressCallback(10)
      }

      const startTime = Date.now()
      console.log('=== SENDING REQUEST ===')
      console.log('Target URL: http://localhost:3000/api/translate')

      const response = await axios.post('http://localhost:3000/api/translate', {
        text,
        sourceLanguage,
        targetLanguage,
        method: 'nllb-local'
      }, {
        timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      // 报告请求完成进度
      if (chunkProgressCallback) {
        chunkProgressCallback(50)
      }

      console.log('=== RESPONSE RECEIVED ===')
      console.log('Status:', response.status)
      console.log('Duration:', duration, 'ms')
      console.log('Headers:', JSON.stringify(response.headers, null, 2))
      console.log('Response data keys:', Object.keys(response.data || {}))

      // 报告解析响应进度
      if (chunkProgressCallback) {
        chunkProgressCallback(70)
      }

      let translatedText = null

      // 尝试从多种响应格式中提取翻译文本
      if (response.data) {
        console.log('=== PARSING RESPONSE ===')
        console.log('Response data type:', typeof response.data)
        
        // 格式1: 直接的 translatedText
        if (response.data.translatedText) {
          console.log('Found translatedText directly')
          translatedText = response.data.translatedText
        }
        // 格式2: 嵌套在 data 中
        else if (response.data.data && response.data.data.translatedText) {
          console.log('Found translatedText in data.data')
          translatedText = response.data.data.translatedText
        }
        // 格式3: Next.js API 包装
        else if (response.data.success && response.data.data && response.data.data.translatedText) {
          console.log('Found translatedText in Next.js API format')
          translatedText = response.data.data.translatedText
        }
        // 格式4: 数组格式
        else if (Array.isArray(response.data) && response.data.length > 0 && response.data[0].translatedText) {
          console.log('Found translatedText in array format')
          translatedText = response.data[0].translatedText
        }
        // 格式5: 直接字符串
        else if (typeof response.data === 'string') {
          console.log('Response data is direct string')
          translatedText = response.data
        }
        
        // 报告解析完成进度
        if (chunkProgressCallback) {
          chunkProgressCallback(90)
        }

        if (translatedText) {
          console.log('=== TRANSLATION SUCCESS ===')
          console.log('Translation successful, length:', translatedText.length)
          console.log('Translated text preview:', translatedText.substring(0, 150) + (translatedText.length > 150 ? '...' : ''))
          console.log('Original vs Translated ratio:', (translatedText.length / text.length).toFixed(2))
          
          // 报告完成进度
          if (chunkProgressCallback) {
            chunkProgressCallback(100)
          }
          return translatedText
        }
      }
      
      throw new Error('Translation API failed - no translatedText in response')
    } catch (error) {
      console.error('=== TRANSLATION ERROR ===')
      console.error('Error message:', error.message)
      console.error('Error type:', error.code || 'unknown')
      
      // 如果是超时错误且文本较长，尝试拆分重试
      const isTimeoutError = error.message.includes('timeout') || error.code === 'ECONNABORTED'
      const canRetry = retryCount < maxRetries && text.length > maxRetryChunkSize && isTimeoutError
      
      if (canRetry) {
        console.log(`=== RETRY WITH SMALLER CHUNKS (${retryCount + 1}/${maxRetries}) ===`)
        console.log('Splitting large chunk into smaller pieces...')
        
        // 报告重试进度
        if (chunkProgressCallback) {
          chunkProgressCallback(30)
        }
        
        try {
          // 将当前块拆分成更小的块
          const smallerChunks = this.splitTextIntoChunks(text, maxRetryChunkSize)
          console.log(`Split into ${smallerChunks.length} smaller chunks`)
          
          const retryResults = []
          for (let i = 0; i < smallerChunks.length; i++) {
            const smallChunk = smallerChunks[i]
            
            // 报告子块进度
            if (chunkProgressCallback) {
              const subProgress = 30 + (i / smallerChunks.length) * 60
              chunkProgressCallback(Math.round(subProgress))
            }
            
            const retryResult = await this.translateChunk(
              smallChunk, 
              sourceLanguage, 
              targetLanguage, 
              retryCount + 1,
              null // 不为子块报告进度，避免嵌套
            )
            retryResults.push(retryResult)
            
            // 小延迟避免请求过于频繁
            await new Promise(resolve => setTimeout(resolve, 200))
          }
          
          const combinedResult = retryResults.join(' ')
          console.log('=== RETRY SUCCESS ===')
          console.log('Combined result length:', combinedResult.length)
          
          // 报告重试完成
          if (chunkProgressCallback) {
            chunkProgressCallback(100)
          }
          return combinedResult
          
        } catch (retryError) {
          console.error('Retry failed:', retryError.message)
          // 重试失败，抛出原始错误
        }
      }
      
      if (error.response) {
        console.error('Response status:', error.response.status)
        console.error('Response data:', JSON.stringify(error.response.data, null, 2))
      }
      throw error
    }
  }

  /**
   * 翻译完整文档
   */
  async translateDocument(fileId, text, sourceLanguage = 'auto', targetLanguage = 'en', onProgress) {
    // 如果是自动检测，先检测语言
    let detectedSourceLanguage = sourceLanguage
    if (sourceLanguage === 'auto') {
      try {
        // 报告语言检测进度
        if (onProgress) {
          onProgress(5, 'Detecting source language...')
        }
        
        detectedSourceLanguage = await this.detectLanguage(text)
        console.log(`Detected language: ${detectedSourceLanguage}`)
        
        if (onProgress) {
          onProgress(10, `Detected language: ${detectedSourceLanguage}`)
        }
      } catch (error) {
        console.error('Language detection failed:', error.message)
        detectedSourceLanguage = 'en' // 默认假设英语
        
        if (onProgress) {
          onProgress(10, 'Language detection failed, using default')
        }
      }
    } else {
      if (onProgress) {
        onProgress(10, `Using source language: ${detectedSourceLanguage}`)
      }
    }

    try {
      // 报告文本分割进度
      if (onProgress) {
        onProgress(15, 'Splitting text into chunks...')
      }

      // 分割文本
      const chunks = this.splitTextIntoChunks(text)
      console.log(`Split into ${chunks.length} chunks for translation`)

      if (onProgress) {
        onProgress(20, `Split into ${chunks.length} chunks, starting translation...`)
      }

      const translatedChunks = []
      let completedChunks = 0

      // 逐块翻译
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const chunkNumber = i + 1
        
        try {
          // 报告开始翻译当前块
          if (onProgress) {
            const baseProgress = 20 + (completedChunks / chunks.length) * 70
            onProgress(Math.round(baseProgress), `Translating chunk ${chunkNumber}/${chunks.length}...`)
          }

          const translatedChunk = await this.translateChunk(
            chunk, 
            detectedSourceLanguage, 
            targetLanguage,
            0, // retryCount
            (chunkProgress) => {
              // 单个块的进度回调
              if (onProgress) {
                const baseProgress = 20 + (completedChunks / chunks.length) * 70
                const chunkContribution = (70 / chunks.length) * (chunkProgress / 100)
                const totalProgress = Math.round(baseProgress + chunkContribution)
                onProgress(totalProgress, `Translating chunk ${chunkNumber}/${chunks.length} (${chunkProgress}%)`)
              }
            }
          )
          
          translatedChunks.push(translatedChunk)
          completedChunks++

          // 报告块完成进度
          const progress = Math.round(20 + (completedChunks / chunks.length) * 70)
          if (onProgress) {
            onProgress(progress, `Completed chunk ${chunkNumber}/${chunks.length}`)
          }

          // 避免API限制，添加小延迟
          if (chunks.length > 1 && i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }

        } catch (error) {
          console.error(`Failed to translate chunk ${chunkNumber}:`, error.message)
          
          // 报告块失败，但继续处理
          if (onProgress) {
            const progress = Math.round(20 + (completedChunks / chunks.length) * 70)
            onProgress(progress, `Chunk ${chunkNumber} failed, using original text`)
          }
          
          // 保留原文
          translatedChunks.push(chunk)
          completedChunks++
        }
      }

      // 报告合并结果
      if (onProgress) {
        onProgress(92, 'Combining translation results...')
      }

      // 合并翻译结果
      const translatedText = translatedChunks.join(' ')

      // 报告完成
      if (onProgress) {
        onProgress(95, 'Translation completed, preparing results...')
      }

      const result = {
        success: true,
        originalText: text,
        translatedText,
        sourceLanguage: detectedSourceLanguage,
        targetLanguage,
        chunkCount: chunks.length,
        wordCount: text.split(/\s+/).length,
        translatedWordCount: translatedText.split(/\s+/).length,
        statistics: {
          originalLength: text.length,
          translatedLength: translatedText.length,
          chunksProcessed: completedChunks,
          chunksTotal: chunks.length
        }
      }

      if (onProgress) {
        onProgress(100, 'Translation completed successfully!')
      }

      return result

    } catch (error) {
      console.error('Document translation failed:', error.message)
      
      if (onProgress) {
        onProgress(0, `Translation failed: ${error.message}`)
      }
      
      return {
        success: false,
        error: error.message,
        originalText: text,
        sourceLanguage: detectedSourceLanguage || sourceLanguage,
        targetLanguage
      }
    }
  }

  /**
   * 保存翻译结果到文件
   */
  async saveTranslationResult(fileId, originalFileName, translationResult) {
    try {
      const resultsDir = path.join(__dirname, '../results')
      await fs.ensureDir(resultsDir)

      const resultFileName = `translated_${fileId}_${Date.now()}.txt`
      const resultFilePath = path.join(resultsDir, resultFileName)

      // 准备结果内容
      const resultContent = [
        '# Translation Result',
        `Original File: ${originalFileName}`,
        `Source Language: ${translationResult.sourceLanguage}`,
        `Target Language: ${translationResult.targetLanguage}`,
        `Translation Date: ${new Date().toISOString()}`,
        `Word Count: ${translationResult.wordCount} → ${translationResult.translatedWordCount}`,
        '',
        '## Original Text',
        translationResult.originalText,
        '',
        '## Translated Text',
        translationResult.translatedText,
        '',
        '## Statistics',
        `Chunks Processed: ${translationResult.statistics?.chunksProcessed || 0}/${translationResult.statistics?.chunksTotal || 0}`,
        `Original Length: ${translationResult.statistics?.originalLength || 0} characters`,
        `Translated Length: ${translationResult.statistics?.translatedLength || 0} characters`
      ].join('\n')

      await fs.writeFile(resultFilePath, resultContent, 'utf8')

      return {
        success: true,
        resultFileName,
        resultFilePath,
        fileSize: (await fs.stat(resultFilePath)).size
      }

    } catch (error) {
      console.error('Failed to save translation result:', error.message)
      throw error
    }
  }

  /**
   * 生成下载链接
   */
  generateDownloadUrl(resultFileName) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3010'
    return `${baseUrl}/download/${resultFileName}`
  }
}

module.exports = { TranslationService } 