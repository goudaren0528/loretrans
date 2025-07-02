// 简化的NLLB翻译服务 - 用于测试和开发
class SimpleNLLBTranslationService {
  constructor() {
    this.modelLoaded = false
    this.initialized = false
    
    // NLLB语言代码映射
    this.languageMap = {
      'ht': 'hat_Latn', // Haitian Creole
      'lo': 'lao_Laoo', // Lao
      'sw': 'swh_Latn', // Swahili
      'my': 'mya_Mymr', // Burmese
      'te': 'tel_Telu', // Telugu
      'si': 'sin_Sinh', // Sinhala
      'am': 'amh_Ethi', // Amharic
      'km': 'khm_Khmr', // Khmer
      'ne': 'npi_Deva', // Nepali
      'mg': 'plt_Latn', // Malagasy
      'en': 'eng_Latn', // English
      'zh': 'zho_Hans', // Chinese (Simplified)
      'fr': 'fra_Latn', // French
      'es': 'spa_Latn', // Spanish
      'pt': 'por_Latn', // Portuguese
      'ar': 'arb_Arab', // Arabic
    }

    // Mock翻译字典 - 用于测试
    this.mockTranslations = {
      'en-ht': {
        'Hello': 'Bonjou',
        'Hello world': 'Bonjou monn',
        'Good morning': 'Bonjou',
        'Thank you': 'Mèsi',
        'How are you?': 'Kijan ou ye?',
        'Goodbye': 'Orevwa'
      },
      'en-sw': {
        'Hello': 'Hujambo',
        'Hello world': 'Hujambo dunia',
        'Good morning': 'Habari za asubuhi',
        'Thank you': 'Asante',
        'How are you?': 'Habari yako?',
        'Goodbye': 'Kwaheri'
      },
      'en-my': {
        'Hello': 'မင်္ဂလာပါ',
        'Hello world': 'မင်္ဂလာပါ ကမ္ဘာ',
        'Good morning': 'မင်္ဂလာနံနက်ခင်း',
        'Thank you': 'ကျေးဇူးတင်ပါတယ်',
        'How are you?': 'နေကောင်းလား?',
        'Goodbye': 'သွားတော့မယ်'
      },
      'en-lo': {
        'Hello': 'ສະບາຍດີ',
        'Hello world': 'ສະບາຍດີ ໂລກ',
        'Good morning': 'ສະບາຍດີຕອນເຊົ້າ',
        'Thank you': 'ຂອບໃຈ',
        'How are you?': 'ເປັນແນວໃດ?',
        'Goodbye': 'ລາກ່ອນ'
      }
    }
  }

  async initialize() {
    console.log('🚀 Initializing Simple NLLB Translation Service...')
    
    // 模拟初始化过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    this.initialized = true
    this.modelLoaded = true
    
    console.log('✅ Simple NLLB Translation Service initialized successfully')
    console.log(`📊 Supported languages: ${Object.keys(this.languageMap).length}`)
    console.log('🧪 Running in TEST mode with mock translations')
    
    return true
  }

  isModelLoaded() {
    return this.modelLoaded
  }

  getSupportedLanguages() {
    return this.languageMap
  }

  // 翻译统计信息
  getTranslationStats(text, sourceLanguage, targetLanguage) {
    const charCount = text.length
    const wordCount = text.trim().split(/\s+/).length
    const estimatedCredits = Math.ceil(charCount * 0.1) // 0.1积分/字符
    
    return {
      characterCount: charCount,
      wordCount: wordCount,
      estimatedCredits: estimatedCredits,
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      supportedPair: this.isLanguagePairSupported(sourceLanguage, targetLanguage)
    }
  }

  isLanguagePairSupported(sourceLanguage, targetLanguage) {
    return this.languageMap[sourceLanguage] && this.languageMap[targetLanguage]
  }

  // 主要翻译方法
  async translateText(text, sourceLanguage, targetLanguage) {
    if (!this.initialized) {
      throw new Error('Translation service not initialized')
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty')
    }

    if (!this.isLanguagePairSupported(sourceLanguage, targetLanguage)) {
      throw new Error(`Unsupported language pair: ${sourceLanguage} -> ${targetLanguage}`)
    }

    console.log(`🔄 Translating: "${text}" from ${sourceLanguage} to ${targetLanguage}`)

    // 模拟翻译延迟
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    // 尝试从mock字典获取翻译
    const translationKey = `${sourceLanguage}-${targetLanguage}`
    const mockDict = this.mockTranslations[translationKey]
    
    if (mockDict && mockDict[text]) {
      const result = mockDict[text]
      console.log(`✅ Mock translation found: "${result}"`)
      return result
    }

    // 生成格式化的mock翻译
    const result = this.generateMockTranslation(text, sourceLanguage, targetLanguage)
    console.log(`🧪 Generated mock translation: "${result}"`)
    
    return result
  }

  // 批量翻译
  async translateBatch(texts, sourceLanguage, targetLanguage) {
    if (!Array.isArray(texts)) {
      throw new Error('Texts must be an array')
    }

    const results = []
    for (const text of texts) {
      try {
        const translation = await this.translateText(text, sourceLanguage, targetLanguage)
        results.push({
          original: text,
          translated: translation,
          success: true
        })
      } catch (error) {
        results.push({
          original: text,
          translated: null,
          success: false,
          error: error.message
        })
      }
    }

    return results
  }

  // 生成mock翻译
  generateMockTranslation(text, sourceLanguage, targetLanguage) {
    const targetLangName = this.getLanguageName(targetLanguage)
    
    // 对于短文本，返回格式化的翻译
    if (text.length <= 50) {
      return `[${targetLangName}] ${text}`
    }
    
    // 对于长文本，返回更详细的mock翻译
    const words = text.split(' ')
    const translatedWords = words.map(word => {
      if (word.length <= 3) return word // 保持短词不变
      return `${word.toLowerCase()}_${targetLanguage}`
    })
    
    return `[${targetLangName} Translation] ${translatedWords.join(' ')}`
  }

  getLanguageName(code) {
    const names = {
      'ht': 'Haitian Creole',
      'sw': 'Swahili', 
      'my': 'Burmese',
      'lo': 'Lao',
      'te': 'Telugu',
      'si': 'Sinhala',
      'am': 'Amharic',
      'km': 'Khmer',
      'ne': 'Nepali',
      'mg': 'Malagasy',
      'en': 'English',
      'zh': 'Chinese',
      'fr': 'French',
      'es': 'Spanish',
      'pt': 'Portuguese',
      'ar': 'Arabic'
    }
    return names[code] || code.toUpperCase()
  }

  // 获取服务状态
  getStatus() {
    return {
      initialized: this.initialized,
      modelLoaded: this.modelLoaded,
      supportedLanguages: Object.keys(this.languageMap).length,
      mode: 'simple-test',
      version: '1.0.0-test'
    }
  }
}

// 创建单例实例
const translationService = new SimpleNLLBTranslationService()

module.exports = translationService
