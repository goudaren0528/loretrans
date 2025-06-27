import { APP_CONFIG } from '../../config/app.config'
import type { Language } from '../../shared/types'

/**
 * 获取所有可用的语言（不包括英语）
 */
export function getAvailableLanguages(): Language[] {
  return APP_CONFIG.languages.supported.filter(lang => lang.available)
}

/**
 * 获取支持双向翻译的语言
 */
export function getBidirectionalLanguages(): Language[] {
  return APP_CONFIG.languages.supported.filter(lang => lang.available && lang.bidirectional)
}

/**
 * 检查语言是否可用
 */
export function isLanguageAvailable(languageCode: string): boolean {
  const language = APP_CONFIG.languages.supported.find(lang => lang.code === languageCode)
  return language?.available ?? false
}

/**
 * 检查语言是否支持双向翻译
 */
export function isBidirectionalSupported(languageCode: string): boolean {
  const language = APP_CONFIG.languages.supported.find(lang => lang.code === languageCode)
  return language?.available && language?.bidirectional || false
}

/**
 * 根据语言代码获取语言信息
 */
export function getLanguageByCode(code: string): Language | undefined {
  if (code === 'en') {
    return APP_CONFIG.languages.target
  }
  return APP_CONFIG.languages.supported.find(lang => lang.code === code)
}

/**
 * 根据slug获取语言信息
 */
export function getLanguageBySlug(slug: string): Language | undefined {
  return APP_CONFIG.languages.supported.find(lang => lang.slug === slug)
}

/**
 * 获取目标语言选项（用于下拉选择）
 */
export function getTargetLanguageOptions(sourceLanguage: string): Language[] {
  if (sourceLanguage === 'en') {
    // 英文到小语种 - 只显示可用的语言
    return getAvailableLanguages()
  } else {
    // 小语种到英文和其他小语种（支持双向翻译） - 只显示可用的语言
    return [
      APP_CONFIG.languages.target, 
      ...getAvailableLanguages().filter(lang => lang.code !== sourceLanguage)
    ]
  }
}

/**
 * 检查语言对是否支持翻译
 */
export function isLanguagePairSupported(sourceLang: string, targetLang: string): boolean {
  // 如果是英文和小语种之间，检查小语种是否可用
  if (sourceLang === 'en') {
    return isLanguageAvailable(targetLang)
  }
  if (targetLang === 'en') {
    return isLanguageAvailable(sourceLang)
  }
  // 小语种之间需要双向支持
  return isBidirectionalSupported(sourceLang) && isBidirectionalSupported(targetLang)
}

/**
 * 生成语言对的URL路径
 */
export function generateLanguagePairPath(sourceLang: string, targetLang: string): string {
  const sourceLanguage = getLanguageByCode(sourceLang)
  const targetLanguage = getLanguageByCode(targetLang)
  
  if (!sourceLanguage || !targetLanguage) {
    throw new Error('Invalid language pair')
  }
  
  if (sourceLang === 'en') {
    return `/english-to-${sourceLanguage.slug}`
  } else if (targetLang === 'en') {
    return `/${sourceLanguage.slug}-to-english`
  } else {
    return `/${sourceLanguage.slug}-to-${targetLanguage.slug}`
  }
}

/**
 * 获取即将支持的语言（用于显示Coming Soon）
 */
export function getComingSoonLanguages(): Language[] {
  return APP_CONFIG.languages.supported.filter(lang => !lang.available)
} 