/**
 * 智能翻译模式判断服务
 * 根据文本特征自动选择最佳处理方式，对用户透明
 */

// 处理模式类型
export type ProcessingMode = 'instant' | 'fast_queue' | 'background'

// 时间预估结果
export interface TimeEstimate {
  mode: ProcessingMode
  estimatedSeconds: number
  displayTime: string
  description: string
  canLeave: boolean
  confidence: 'high' | 'medium' | 'low'
}

// 翻译策略配置
const PROCESSING_THRESHOLDS = {
  // 字符数阈值
  INSTANT_MAX: 1000,     // 即时处理上限（提高到1000字符）
  FAST_QUEUE_MAX: 2000,  // 快速队列上限
  
  // 复杂度因子
  COMPLEXITY_FACTORS: {
    specialChars: 1.2,    // 特殊字符增加复杂度
    multiLanguage: 1.5,   // 多语言混合
    technicalTerms: 1.3,  // 技术术语
    formatting: 1.1       // 格式化文本
  },
  
  // 时间估算基数（秒）
  BASE_TIME: {
    instant: 2,      // 基础2秒
    fast_queue: 30,  // 基础30秒
    background: 180  // 基础3分钟
  }
} as const

class SmartTranslationService {
  /**
   * 智能判断处理模式
   */
  determineProcessingMode(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    userContext?: {
      isLoggedIn: boolean
      creditBalance: number
      hasActiveTasks: boolean
    }
  ): ProcessingMode {
    // 临时禁用队列模式，始终使用即时处理以确保翻译结果直接显示
    // 这样可以避免翻译结果不显示的问题
    return 'instant'
    
    // 原始逻辑（已禁用）：
    // const textLength = text.length
    // const complexity = this.calculateComplexity(text, sourceLanguage)
    // const adjustedLength = textLength * complexity

    // // 未登录用户只能使用即时模式
    // if (!userContext?.isLoggedIn) {
    //   return 'instant'
    // }

    // // 基于调整后的文本长度判断
    // if (adjustedLength <= PROCESSING_THRESHOLDS.INSTANT_MAX) {
    //   return 'instant'
    // } else if (adjustedLength <= PROCESSING_THRESHOLDS.FAST_QUEUE_MAX) {
    //   return 'fast_queue'
    // } else {
    //   return 'background'
    // }
  }

  /**
   * 计算文本复杂度
   */
  private calculateComplexity(text: string, sourceLanguage: string): number {
    let complexity = 1.0
    const { COMPLEXITY_FACTORS } = PROCESSING_THRESHOLDS

    // 特殊字符检测
    const specialCharRatio = (text.match(/[^\w\s\u4e00-\u9fff]/g) || []).length / text.length
    if (specialCharRatio > 0.1) {
      complexity *= COMPLEXITY_FACTORS.specialChars
    }

    // 多语言混合检测
    if (this.hasMultipleLanguages(text)) {
      complexity *= COMPLEXITY_FACTORS.multiLanguage
    }

    // 技术术语检测
    if (this.hasTechnicalTerms(text)) {
      complexity *= COMPLEXITY_FACTORS.technicalTerms
    }

    // 格式化文本检测
    if (this.hasFormatting(text)) {
      complexity *= COMPLEXITY_FACTORS.formatting
    }

    return Math.min(complexity, 2.0) // 最大复杂度限制为2倍
  }

  /**
   * 检测多语言混合
   */
  private hasMultipleLanguages(text: string): boolean {
    const patterns = [
      /[\u4e00-\u9fff]/, // 中文
      /[\u0600-\u06ff]/, // 阿拉伯语
      /[\u1000-\u109f]/, // 缅甸语
      /[\u0e80-\u0eff]/, // 老挝语
      /[a-zA-Z]/         // 拉丁字母
    ]

    const matchedPatterns = patterns.filter(pattern => pattern.test(text))
    return matchedPatterns.length > 1
  }

  /**
   * 检测技术术语
   */
  private hasTechnicalTerms(text: string): boolean {
    const technicalKeywords = [
      'API', 'JSON', 'HTTP', 'URL', 'SQL', 'HTML', 'CSS', 'JavaScript',
      'algorithm', 'database', 'server', 'client', 'framework', 'library',
      'function', 'variable', 'parameter', 'configuration', 'deployment'
    ]

    const lowerText = text.toLowerCase()
    return technicalKeywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    )
  }

  /**
   * 检测格式化文本
   */
  private hasFormatting(text: string): boolean {
    const formattingPatterns = [
      /\n\s*[-*+]\s+/,     // 列表项
      /#{1,6}\s+/,         // Markdown标题
      /\*\*.*?\*\*/,       // 粗体
      /`.*?`/,             // 代码
      /\[.*?\]\(.*?\)/,    // 链接
      /\|\s*.*?\s*\|/      // 表格
    ]

    return formattingPatterns.some(pattern => pattern.test(text))
  }

  /**
   * 估算处理时间
   */
  estimateProcessingTime(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    userContext?: {
      isLoggedIn: boolean
      creditBalance: number
      hasActiveTasks: boolean
    }
  ): TimeEstimate {
    const mode = this.determineProcessingMode(text, sourceLanguage, targetLanguage, userContext)
    const textLength = text.length
    const complexity = this.calculateComplexity(text, sourceLanguage)
    
    let estimatedSeconds: number
    let confidence: 'high' | 'medium' | 'low' = 'high'

    switch (mode) {
      case 'instant':
        estimatedSeconds = Math.max(
          PROCESSING_THRESHOLDS.BASE_TIME.instant,
          Math.ceil(textLength / 100) * complexity
        )
        break

      case 'fast_queue':
        estimatedSeconds = Math.max(
          PROCESSING_THRESHOLDS.BASE_TIME.fast_queue,
          Math.ceil(textLength / 50) * complexity
        )
        confidence = 'medium'
        break

      case 'background':
        estimatedSeconds = Math.max(
          PROCESSING_THRESHOLDS.BASE_TIME.background,
          Math.ceil(textLength / 20) * complexity
        )
        confidence = 'low'
        break
    }

    // 考虑系统负载（如果用户有活跃任务）
    if (userContext?.hasActiveTasks) {
      estimatedSeconds *= 1.3
      confidence = confidence === 'high' ? 'medium' : 'low'
    }

    return {
      mode,
      estimatedSeconds,
      displayTime: this.formatTime(estimatedSeconds),
      description: this.getTimeDescription(mode, estimatedSeconds),
      canLeave: mode === 'background',
      confidence
    }
  }

  /**
   * 格式化时间显示
   */
  private formatTime(seconds: number): string {
    if (seconds < 10) {
      return '< 10秒'
    } else if (seconds < 60) {
      return `约 ${Math.ceil(seconds / 10) * 10}秒`
    } else if (seconds < 300) {
      return `约 ${Math.ceil(seconds / 60)}分钟`
    } else {
      return `约 ${Math.ceil(seconds / 300) * 5}分钟`
    }
  }

  /**
   * 获取时间描述
   */
  private getTimeDescription(mode: ProcessingMode, seconds: number): string {
    switch (mode) {
      case 'instant':
        return '即时处理，请稍候'
      case 'fast_queue':
        return '快速处理中，请保持页面打开'
      case 'background':
        return '后台处理中，您可以离开此页面'
      default:
        return '正在处理中'
    }
  }

  /**
   * 获取处理模式的用户友好描述
   */
  getModeDescription(mode: ProcessingMode): {
    title: string
    description: string
    icon: string
    color: string
  } {
    switch (mode) {
      case 'instant':
        return {
          title: '即时翻译',
          description: '快速处理短文本',
          icon: '⚡',
          color: 'text-green-600'
        }
      case 'fast_queue':
        return {
          title: '快速处理',
          description: '中等文本，稍等片刻',
          icon: '🚀',
          color: 'text-blue-600'
        }
      case 'background':
        return {
          title: '后台处理',
          description: '长文本后台处理，可离开页面',
          icon: '🔄',
          color: 'text-orange-600'
        }
    }
  }

  /**
   * 获取建议的用户操作
   */
  getRecommendedAction(estimate: TimeEstimate): {
    action: string
    description: string
    icon: string
  } {
    if (estimate.mode === 'instant') {
      return {
        action: '立即翻译',
        description: '结果将立即显示',
        icon: '⚡'
      }
    } else if (estimate.mode === 'fast_queue') {
      return {
        action: '开始翻译',
        description: '请保持页面打开',
        icon: '🚀'
      }
    } else {
      return {
        action: '提交翻译',
        description: '可在"我的任务"中查看进度',
        icon: '📋'
      }
    }
  }
}

// 单例实例
let smartTranslationService: SmartTranslationService | null = null

export function getSmartTranslationService(): SmartTranslationService {
  if (!smartTranslationService) {
    smartTranslationService = new SmartTranslationService()
  }
  return smartTranslationService
}

// 便捷函数
export function determineProcessingMode(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  userContext?: {
    isLoggedIn: boolean
    creditBalance: number
    hasActiveTasks: boolean
  }
): ProcessingMode {
  const service = getSmartTranslationService()
  return service.determineProcessingMode(text, sourceLanguage, targetLanguage, userContext)
}

export function estimateProcessingTime(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  userContext?: {
    isLoggedIn: boolean
    creditBalance: number
    hasActiveTasks: boolean
  }
): TimeEstimate {
  const service = getSmartTranslationService()
  return service.estimateProcessingTime(text, sourceLanguage, targetLanguage, userContext)
}
