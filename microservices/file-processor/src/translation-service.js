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

  splitTextIntoChunks(text, maxChunkSize = null) {
    // 如果没有指定块大小，计算最优块大小
    if (!maxChunkSize) {
      maxChunkSize = this.calculateOptimalChunkSize(text.length)
    }
    
    const sentences = text.split(/[.!?。！？\n]+/).filter(s => s.trim().length > 0)
    const chunks = []
    let currentChunk = ''

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim()
      if (!trimmedSentence) continue

      if (currentChunk.length + trimmedSentence.length + 1 <= maxChunkSize) {
        currentChunk += (currentChunk ? ' ' : '') + trimmedSentence
      } else {
        if (currentChunk) {
          chunks.push(currentChunk)
        }
        currentChunk = trimmedSentence
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk)
    }

    const result = chunks.length > 0 ? chunks : [text]
    
    console.log(`Split ${text.length} chars into ${result.length} chunks`)
    console.log(`Chunk sizes: ${result.map(c => c.length).join(', ')}`)
    
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
  async translateChunk(text, sourceLanguage, targetLanguage, retryCount = 0) {
    const maxRetries = 2
    const maxRetryChunkSize = 500 // 重试时使用的最小块大小
    
    console.log('=== CHUNK TRANSLATION DEBUG ===')
    console.log('Input text length:', text.length)
    console.log('Input text preview:', text.substring(0, 100) + (text.length > 100 ? '...' : ''))
    console.log('Source language:', sourceLanguage)
    console.log('Target language:', targetLanguage)
    console.log('Retry count:', retryCount)
    
    try {
      const requestPayload = {
        text,
        sourceLanguage,
        targetLanguage
      }
      
      console.log('=== SENDING REQUEST TO MAIN API ===')
      console.log('Request payload:', JSON.stringify(requestPayload, null, 2))
      
      // 计算动态超时时间
      const dynamicTimeout = this.calculateDynamicTimeout(text)
      
      const response = await axios.post(this.translationApiUrl, requestPayload, {
        timeout: dynamicTimeout,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('=== RECEIVED RESPONSE FROM MAIN API ===')
      console.log('Response status:', response.status)
      console.log('Response data:', JSON.stringify(response.data, null, 2))

      // 处理不同的响应格式
      if (response.data) {
        let translatedText = null
        
        // 直接的翻译结果
        if (response.data.translatedText) {
          translatedText = response.data.translatedText
          console.log('Found translatedText directly')
        }
        // 包装在data中的响应
        else if (response.data.data && response.data.data.translatedText) {
          translatedText = response.data.data.translatedText
          console.log('Found translatedText in data wrapper')
        }
        // Next.js API响应格式
        else if (response.data.success && response.data.data && response.data.data.translatedText) {
          translatedText = response.data.data.translatedText
          console.log('Found translatedText in Next.js format')
        }
        
        if (translatedText) {
          console.log('=== TRANSLATION RESULT ===')
          console.log('Translated text length:', translatedText.length)
          console.log('Translated text preview:', translatedText.substring(0, 150) + (translatedText.length > 150 ? '...' : ''))
          console.log('Original vs Translated ratio:', (translatedText.length / text.length).toFixed(2))
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
        
        try {
          // 将当前块拆分成更小的块
          const smallerChunks = this.splitTextIntoChunks(text, maxRetryChunkSize)
          console.log(`Split into ${smallerChunks.length} smaller chunks`)
          
          const retryResults = []
          for (const smallChunk of smallerChunks) {
            const retryResult = await this.translateChunk(
              smallChunk, 
              sourceLanguage, 
              targetLanguage, 
              retryCount + 1
            )
            retryResults.push(retryResult)
            
            // 小延迟避免请求过于频繁
            await new Promise(resolve => setTimeout(resolve, 200))
          }
          
          const combinedResult = retryResults.join(' ')
          console.log('=== RETRY SUCCESS ===')
          console.log('Combined result length:', combinedResult.length)
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
        detectedSourceLanguage = await this.detectLanguage(text)
        console.log(`Detected language: ${detectedSourceLanguage}`)
      } catch (error) {
        console.error('Language detection failed:', error.message)
        detectedSourceLanguage = 'en' // 默认假设英语
      }
    }

    try {

      // 分割文本
      const chunks = this.splitTextIntoChunks(text)
      console.log(`Split into ${chunks.length} chunks for translation`)

      const translatedChunks = []
      let completedChunks = 0

      // 逐块翻译
      for (const chunk of chunks) {
        try {
          const translatedChunk = await this.translateChunk(
            chunk, 
            detectedSourceLanguage, 
            targetLanguage
          )
          
          translatedChunks.push(translatedChunk)
          completedChunks++

          // 报告进度
          const progress = Math.round((completedChunks / chunks.length) * 100)
          if (onProgress) {
            onProgress(progress, `Translated ${completedChunks}/${chunks.length} chunks`)
          }

          // 避免API限制，添加小延迟
          if (chunks.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }

        } catch (error) {
          console.error(`Failed to translate chunk ${completedChunks + 1}:`, error.message)
          // 保留原文
          translatedChunks.push(chunk)
          completedChunks++
        }
      }

      // 合并翻译结果
      const translatedText = translatedChunks.join(' ')

      return {
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

    } catch (error) {
      console.error('Document translation failed:', error.message)
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