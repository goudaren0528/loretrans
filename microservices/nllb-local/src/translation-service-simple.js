const fs = require('fs')
const path = require('path')

/**
 * 简化的NLLB翻译服务 - 用于测试真实流程但不依赖模型文件
 * 提供真实的翻译逻辑和积分计算，但使用预定义的翻译结果
 */
class SimpleNLLBTranslationService {
  constructor() {
    this.modelLoaded = true // 简化版本直接标记为已加载
    this.batchSize = parseInt(process.env.BATCH_SIZE || '4')
    
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

    // 真实的翻译示例 - 基于NLLB模型的实际输出
    this.realTranslations = {
      'en-ht': {
        'Hello': 'Bonjou',
        'Hello world': 'Bonjou monn nan',
        'Hello, how are you today?': 'Bonjou, kijan ou ye jodi a?',
        'Good morning': 'Bonjou',
        'Good morning! Welcome to our translation service.': 'Bonjou! Byenveni nan sèvis tradiksyon nou an.',
        'Thank you': 'Mèsi',
        'How are you?': 'Kijan ou ye?',
        'Goodbye': 'Orevwa',
        'This is a test': 'Sa a se yon tès',
        'Welcome to our service': 'Byenveni nan sèvis nou an'
      },
      'en-sw': {
        'Hello': 'Hujambo',
        'Hello world': 'Hujambo dunia',
        'Hello, how are you today?': 'Hujambo, habari yako leo?',
        'Good morning': 'Habari za asubuhi',
        'Good morning! Welcome to our translation service.': 'Habari za asubuhi! Karibu kwenye huduma yetu ya utafsiri.',
        'Thank you': 'Asante',
        'How are you?': 'Habari yako?',
        'Goodbye': 'Kwaheri',
        'This is a test': 'Hii ni jaribio',
        'Welcome to our service': 'Karibu kwenye huduma yetu'
      },
      'en-lo': {
        'Hello': 'ສະບາຍດີ',
        'Hello world': 'ສະບາຍດີໂລກ',
        'Hello, how are you today?': 'ສະບາຍດີ, ເຈົ້າເປັນແນວໃດໃນມື້ນີ້?',
        'Good morning': 'ສະບາຍດີຕອນເຊົ້າ',
        'Good morning! Welcome to our translation service.': 'ສະບາຍດີຕອນເຊົ້າ! ຍິນດີຕ້ອນຮັບສູ່ບໍລິການແປພາສາຂອງພວກເຮົາ.',
        'Thank you': 'ຂອບໃຈ',
        'How are you?': 'ສະບາຍດີບໍ?',
        'Goodbye': 'ລາກ່ອນ',
        'This is a test': 'ນີ້ແມ່ນການທົດສອບ',
        'Welcome to our service': 'ຍິນດີຕ້ອນຮັບສູ່ບໍລິການຂອງພວກເຮົາ'
      },
      'en-my': {
        'Hello': 'မင်္ဂလာပါ',
        'Hello world': 'မင်္ဂလာပါ ကမ္ဘာ',
        'Hello, how are you today?': 'မင်္ဂလာပါ၊ ဒီနေ့ ဘယ်လိုနေလဲ?',
        'Good morning': 'မင်္ဂလာပါ',
        'Good morning! Welcome to our translation service.': 'မင်္ဂလာပါ! ကျွန်ုပ်တို့၏ ဘာသာပြန်ဝန်ဆောင်မှုသို့ ကြိုဆိုပါတယ်။',
        'Thank you': 'ကျေးဇူးတင်ပါတယ်',
        'How are you?': 'နေကောင်းလား?',
        'Goodbye': 'သွားတော့မယ်',
        'This is a test': 'ဒါက စမ်းသပ်မှုတစ်ခုပါ',
        'Welcome to our service': 'ကျွန်ုပ်တို့၏ ဝန်ဆောင်မှုသို့ ကြိုဆိုပါတယ်'
      }
    }
  }

  /**
   * 初始化服务
   */
  async initialize() {
    console.log('Initializing Simple NLLB Translation Service...')
    console.log('✅ Simple NLLB Translation Service initialized successfully!')
    console.log('📝 Using predefined translations for testing real flow')
    console.log(`🌍 Supported languages: ${Object.keys(this.languageMap).join(', ')}`)
  }

  /**
   * 获取NLLB语言代码
   */
  getNLLBLanguageCode(language) {
    const nllbCode = this.languageMap[language]
    if (!nllbCode) {
      throw new Error(`Unsupported language: ${language}`)
    }
    return nllbCode
  }

  /**
   * 计算翻译所需积分
   * 基于文本长度和复杂度的真实积分计算逻辑
   */
  calculateCreditsRequired(text, sourceLanguage, targetLanguage) {
    // 基础积分计算
    const baseCredits = 1
    const lengthMultiplier = Math.ceil(text.length / 50) // 每50个字符1积分
    const complexityBonus = text.split(/[.!?]/).length - 1 // 句子数量影响复杂度
    
    // 语言难度系数
    const difficultyMap = {
      'ht': 1.2, // 海地克里奥尔语
      'lo': 1.5, // 老挝语
      'sw': 1.1, // 斯瓦希里语
      'my': 1.8, // 缅甸语
      'te': 1.6, // 泰卢固语
      'en': 1.0  // 英语基准
    }
    
    const sourceDifficulty = difficultyMap[sourceLanguage] || 1.0
    const targetDifficulty = difficultyMap[targetLanguage] || 1.0
    
    const totalCredits = Math.ceil(
      (baseCredits + lengthMultiplier + complexityBonus) * 
      (sourceDifficulty + targetDifficulty) / 2
    )
    
    return Math.max(1, totalCredits) // 最少1积分
  }

  /**
   * 生成真实的翻译结果
   * 优先使用预定义翻译，否则生成基于规则的翻译
   */
  generateTranslation(text, sourceLanguage, targetLanguage) {
    const translationKey = `${sourceLanguage}-${targetLanguage}`
    const translations = this.realTranslations[translationKey]
    
    // 检查是否有预定义翻译
    if (translations && translations[text]) {
      return translations[text]
    }
    
    // 检查是否有部分匹配
    if (translations) {
      for (const [key, value] of Object.entries(translations)) {
        if (text.toLowerCase().includes(key.toLowerCase())) {
          // 如果包含已知短语，进行部分替换
          return text.replace(new RegExp(key, 'gi'), value)
        }
      }
    }
    
    // 生成基于规则的翻译
    return this.generateRuleBasedTranslation(text, sourceLanguage, targetLanguage)
  }

  /**
   * 基于规则生成翻译
   */
  generateRuleBasedTranslation(text, sourceLanguage, targetLanguage) {
    // 语言特定的前缀/后缀
    const languagePrefixes = {
      'ht': '[HT] ',
      'sw': '[SW] ',
      'lo': '[LO] ',
      'my': '[MY] '
    }
    
    const prefix = languagePrefixes[targetLanguage] || `[${targetLanguage.toUpperCase()}] `
    
    // 模拟真实翻译的变化
    let translatedText = text
    
    // 添加语言特定的修饰
    if (targetLanguage === 'ht') {
      // 海地克里奥尔语特点
      translatedText = translatedText
        .replace(/\bthe\b/gi, 'la')
        .replace(/\band\b/gi, 'ak')
        .replace(/\bis\b/gi, 'se')
    } else if (targetLanguage === 'sw') {
      // 斯瓦希里语特点
      translatedText = translatedText
        .replace(/\bthe\b/gi, '')
        .replace(/\band\b/gi, 'na')
        .replace(/\bis\b/gi, 'ni')
    }
    
    return `${prefix}${translatedText}`
  }

  /**
   * 翻译单个文本 - 模拟真实的处理时间和逻辑
   */
  async translateText(text, sourceLanguage, targetLanguage) {
    if (!this.modelLoaded) {
      throw new Error('Model not loaded')
    }

    try {
      const sourceCode = this.getNLLBLanguageCode(sourceLanguage)
      const targetCode = this.getNLLBLanguageCode(targetLanguage)

      console.log('=== SIMPLE NLLB TRANSLATION SERVICE ===')
      console.log(`Input text length: ${text.length}`)
      console.log(`Input text: "${text}"`)
      console.log(`Language mapping: ${sourceLanguage} (${sourceCode}) -> ${targetLanguage} (${targetCode})`)

      // 计算所需积分
      const creditsRequired = this.calculateCreditsRequired(text, sourceLanguage, targetLanguage)
      console.log(`Credits required: ${creditsRequired}`)

      // 模拟真实的处理时间
      const processingTime = Math.random() * 2000 + 500 // 500-2500ms
      await new Promise(resolve => setTimeout(resolve, processingTime))

      // 生成翻译结果
      const translatedText = this.generateTranslation(text, sourceLanguage, targetLanguage)

      console.log(`=== TRANSLATION SUCCESS ===`)
      console.log(`Translated text length: ${translatedText.length}`)
      console.log(`Translated text: "${translatedText}"`)
      console.log(`Processing time: ${processingTime.toFixed(0)}ms`)

      return translatedText

    } catch (error) {
      console.error('Translation error:', error)
      throw new Error(`Translation failed: ${error.message}`)
    }
  }

  /**
   * 批量翻译
   */
  async translateBatch(texts, sourceLanguage, targetLanguage) {
    if (!this.modelLoaded) {
      throw new Error('Model not loaded')
    }

    try {
      console.log(`Batch translating ${texts.length} texts: ${sourceLanguage} -> ${targetLanguage}`)

      const results = []
      
      // 分批处理以避免过载
      for (let i = 0; i < texts.length; i += this.batchSize) {
        const batch = texts.slice(i, i + this.batchSize)
        
        const batchResults = await Promise.all(
          batch.map(async (text) => {
            try {
              const translatedText = await this.translateText(text, sourceLanguage, targetLanguage)
              return {
                translatedText,
                sourceLanguage,
                targetLanguage,
                success: true
              }
            } catch (error) {
              console.error(`Failed to translate text: "${text.substring(0, 50)}..."`, error)
              return {
                translatedText: text, // 失败时返回原文
                sourceLanguage,
                targetLanguage,
                success: false,
                error: error.message
              }
            }
          })
        )
        
        results.push(...batchResults)
      }

      return results

    } catch (error) {
      console.error('Batch translation error:', error)
      throw new Error(`Batch translation failed: ${error.message}`)
    }
  }

  /**
   * 检查模型是否已加载
   */
  isModelLoaded() {
    return this.modelLoaded
  }

  /**
   * 获取支持的语言
   */
  getSupportedLanguages() {
    return this.languageMap
  }

  /**
   * 检查语言是否支持
   */
  isLanguageSupported(language) {
    return language in this.languageMap
  }

  /**
   * 获取翻译统计信息
   */
  getTranslationStats(text, sourceLanguage, targetLanguage) {
    return {
      inputLength: text.length,
      creditsRequired: this.calculateCreditsRequired(text, sourceLanguage, targetLanguage),
      estimatedTime: Math.ceil(text.length / 10) * 100, // 估算处理时间(ms)
      complexity: text.split(/[.!?]/).length,
      sourceLanguage,
      targetLanguage
    }
  }
}

module.exports = new SimpleNLLBTranslationService()
