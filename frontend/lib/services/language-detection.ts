/**
 * 语言检测服务
 * 基于字符集、脚本系统和常见词汇模式进行检测
 */

interface DetectionResult {
  language: string
  confidence: number
  languageName: string
}

interface LanguagePattern {
  code: string
  name: string
  unicode: RegExp[]
  keywords: string[]
  weight: number
}

/**
 * 语言检测模式定义
 */
const LANGUAGE_PATTERNS: LanguagePattern[] = [
  {
    code: 'en',
    name: 'English',
    unicode: [/[a-zA-Z]/],
    keywords: ['the', 'and', 'is', 'are', 'in', 'of', 'to', 'for', 'with', 'this'],
    weight: 1.0,
  },
  {
    code: 'ht',
    name: 'Haitian Creole',
    unicode: [/[a-zA-Z]/],
    keywords: ['nan', 'ak', 'yo', 'li', 'pou', 'ou', 'mwen', 'nou', 'gen', 'konnen'],
    weight: 2.0,
  },
  {
    code: 'sw',
    name: 'Swahili',
    unicode: [/[a-zA-Z]/],
    keywords: ['na', 'ya', 'wa', 'ni', 'kwa', 'za', 'katika', 'hii', 'ile', 'kila'],
    weight: 2.0,
  },
  {
    code: 'my',
    name: 'Burmese',
    unicode: [/[\u1000-\u109F]/], // Myanmar Unicode block
    keywords: ['၎င်း', 'သည်', 'များ', 'တစ်', 'လို့', 'နှင့်', 'ကို', 'မှ', 'ဖြစ်', 'ရှိ'],
    weight: 3.0,
  },
  {
    code: 'lo',
    name: 'Lao',
    unicode: [/[\u0E80-\u0EFF]/], // Lao Unicode block
    keywords: ['ແລະ', 'ຂອງ', 'ໃນ', 'ກັບ', 'ເປັນ', 'ມີ', 'ຈາກ', 'ດ້ວຍ', 'ເພື່ອ', 'ຫຼື'],
    weight: 3.0,
  },
  {
    code: 'km',
    name: 'Khmer',
    unicode: [/[\u1780-\u17FF]/], // Khmer Unicode block
    keywords: ['និង', 'នេះ', 'ជា', 'នៃ', 'ទាំង', 'ក្នុង', 'ពី', 'ដោយ', 'មាន', 'គឺ'],
    weight: 3.0,
  },
  {
    code: 'te',
    name: 'Telugu',
    unicode: [/[\u0C00-\u0C7F]/], // Telugu Unicode block
    keywords: ['మరియు', 'ఈ', 'అని', 'కూడా', 'లో', 'తో', 'నుండి', 'ఉంది', 'చేసిన', 'ఉన్న'],
    weight: 3.0,
  },
  {
    code: 'si',
    name: 'Sinhala',
    unicode: [/[\u0D80-\u0DFF]/], // Sinhala Unicode block
    keywords: ['සහ', 'මේ', 'ඇති', 'කරන', 'වන', 'ගත', 'දී', 'එම', 'නම්', 'තුළ'],
    weight: 3.0,
  },
  {
    code: 'am',
    name: 'Amharic',
    unicode: [/[\u1200-\u137F]/], // Ethiopic Unicode block
    keywords: ['እና', 'ነው', 'ይህ', 'በ', 'ላይ', 'ስለ', 'ወደ', 'ከ', 'አለ', 'ነበር'],
    weight: 3.0,
  },
  {
    code: 'ne',
    name: 'Nepali',
    unicode: [/[\u0900-\u097F]/], // Devanagari Unicode block
    keywords: ['र', 'छ', 'मा', 'का', 'को', 'हो', 'गर्न', 'भन्न', 'यो', 'हुन'],
    weight: 3.0,
  },
  {
    code: 'mg',
    name: 'Malagasy',
    unicode: [/[a-zA-Z]/],
    keywords: ['sy', 'ny', 'amin\'ny', 'izany', 'fa', 'ary', 'dia', 'hoe', 'toa', 'raha'],
    weight: 2.0,
  },
]

/**
 * 基于Unicode字符范围检测脚本系统
 */
function detectScript(text: string): { script: string; confidence: number }[] {
  const results: { script: string; confidence: number }[] = []
  
  for (const pattern of LANGUAGE_PATTERNS) {
    let matches = 0
    let totalChars = 0
    
    for (const char of text) {
      totalChars++
      for (const unicode of pattern.unicode) {
        if (unicode.test(char)) {
          matches++
          break
        }
      }
    }
    
    if (totalChars > 0) {
      const confidence = (matches / totalChars) * pattern.weight
      if (confidence > 0.1) { // 只保留有意义的匹配
        results.push({
          script: pattern.code,
          confidence,
        })
      }
    }
  }
  
  return results.sort((a, b) => b.confidence - a.confidence)
}

/**
 * 基于关键词检测语言
 */
function detectByKeywords(text: string): { language: string; confidence: number }[] {
  const lowercaseText = text.toLowerCase()
  const words = lowercaseText.split(/\s+/)
  const results: { language: string; confidence: number }[] = []
  
  for (const pattern of LANGUAGE_PATTERNS) {
    let keywordMatches = 0
    
    for (const keyword of pattern.keywords) {
      if (words.includes(keyword.toLowerCase()) || lowercaseText.includes(keyword.toLowerCase())) {
        keywordMatches++
      }
    }
    
    if (keywordMatches > 0) {
      const confidence = (keywordMatches / pattern.keywords.length) * pattern.weight
      results.push({
        language: pattern.code,
        confidence,
      })
    }
  }
  
  return results.sort((a, b) => b.confidence - a.confidence)
}

/**
 * 主要语言检测函数
 */
export function detectLanguage(text: string): DetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      language: 'unknown',
      confidence: 0,
      languageName: 'Unknown',
    }
  }
  
  const cleanText = text.trim()
  
  // 如果文本很短，降低置信度
  const lengthFactor = Math.min(cleanText.length / 50, 1.0)
  
  // 基于脚本系统检测
  const scriptResults = detectScript(cleanText)
  
  // 基于关键词检测
  const keywordResults = detectByKeywords(cleanText)
  
  // 合并结果
  const combinedResults = new Map<string, number>()
  
  // 添加脚本检测结果
  for (const result of scriptResults) {
    combinedResults.set(result.script, (combinedResults.get(result.script) || 0) + result.confidence * 0.6)
  }
  
  // 添加关键词检测结果
  for (const result of keywordResults) {
    combinedResults.set(result.language, (combinedResults.get(result.language) || 0) + result.confidence * 0.4)
  }
  
  // 找到最高分的语言
  let bestLanguage = 'unknown'
  let bestConfidence = 0
  
  for (const [language, confidence] of combinedResults) {
    const adjustedConfidence = confidence * lengthFactor
    if (adjustedConfidence > bestConfidence) {
      bestLanguage = language
      bestConfidence = adjustedConfidence
    }
  }
  
  // 如果置信度太低，返回unknown
  if (bestConfidence < 0.3) {
    bestLanguage = 'unknown'
    bestConfidence = 0
  }
  
  // 获取语言名称
  const languagePattern = LANGUAGE_PATTERNS.find(p => p.code === bestLanguage)
  const languageName = languagePattern ? languagePattern.name : 'Unknown'
  
  return {
    language: bestLanguage,
    confidence: Math.min(bestConfidence, 1.0),
    languageName,
  }
}

/**
 * 获取所有支持检测的语言
 */
export function getSupportedDetectionLanguages(): { code: string; name: string }[] {
  return LANGUAGE_PATTERNS.map(pattern => ({
    code: pattern.code,
    name: pattern.name,
  }))
}

/**
 * 检测多个候选语言（返回前N个可能的语言）
 */
export function detectLanguageMultiple(text: string, topN: number = 3): DetectionResult[] {
  if (!text || text.trim().length === 0) {
    return []
  }
  
  const cleanText = text.trim()
  const lengthFactor = Math.min(cleanText.length / 50, 1.0)
  
  const scriptResults = detectScript(cleanText)
  const keywordResults = detectByKeywords(cleanText)
  
  const combinedResults = new Map<string, number>()
  
  for (const result of scriptResults) {
    combinedResults.set(result.script, (combinedResults.get(result.script) || 0) + result.confidence * 0.6)
  }
  
  for (const result of keywordResults) {
    combinedResults.set(result.language, (combinedResults.get(result.language) || 0) + result.confidence * 0.4)
  }
  
  const results: DetectionResult[] = []
  
  for (const [language, confidence] of combinedResults) {
    const adjustedConfidence = confidence * lengthFactor
    if (adjustedConfidence >= 0.1) {
      const languagePattern = LANGUAGE_PATTERNS.find(p => p.code === language)
      results.push({
        language,
        confidence: Math.min(adjustedConfidence, 1.0),
        languageName: languagePattern ? languagePattern.name : 'Unknown',
      })
    }
  }
  
  return results
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, topN)
} 