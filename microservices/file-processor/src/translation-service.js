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
  splitTextIntoChunks(text, maxChunkSize = this.chunkSize) {
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

    return chunks.length > 0 ? chunks : [text]
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

      if (response.data && (response.data.language || response.data.primary?.language)) {
        return response.data.language || response.data.primary?.language || 'unknown'
      }
      
      throw new Error('Language detection failed')
    } catch (error) {
      console.error('Language detection error:', error.message)
      // 如果检测失败，返回auto让翻译API自动处理
      return 'auto'
    }
  }

  /**
   * 翻译单个文本块
   */
  async translateChunk(text, sourceLanguage, targetLanguage) {
    try {
      const response = await axios.post(this.translationApiUrl, {
        text,
        sourceLanguage,
        targetLanguage
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data && response.data.translatedText) {
        return response.data.translatedText
      }
      
      throw new Error('Translation API failed')
    } catch (error) {
      console.error('Translation error for chunk:', error.message)
      throw error
    }
  }

  /**
   * 翻译完整文档
   */
  async translateDocument(fileId, text, sourceLanguage = 'auto', targetLanguage = 'en', onProgress) {
    try {
      // 如果是自动检测，先检测语言
      let detectedSourceLanguage = sourceLanguage
      if (sourceLanguage === 'auto') {
        detectedSourceLanguage = await this.detectLanguage(text)
        console.log(`Detected language: ${detectedSourceLanguage}`)
      }

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
        sourceLanguage,
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