/**
 * 页面存在性检查工具
 */

// 语言代码到slug的映射
const LANGUAGE_CODE_TO_SLUG: Record<string, string> = {
  'ht': 'creole',
  'lo': 'lao',
  'sw': 'swahili', 
  'my': 'burmese',
  'te': 'telugu',
  'en': 'english',
  'english': 'english'
}

// 定义实际存在的翻译页面路由
const EXISTING_TRANSLATION_PAGES = [
  'creole-to-english',
  'lao-to-english', 
  'swahili-to-english',
  'burmese-to-english',
  'telugu-to-english',
  'english-to-creole',
  'english-to-lao',
  'english-to-swahili',
  'english-to-burmese',
  'english-to-telugu'
]

/**
 * 将语言代码转换为slug
 * @param codeOrSlug 语言代码或slug
 * @returns slug
 */
function getLanguageSlug(codeOrSlug: string): string {
  return LANGUAGE_CODE_TO_SLUG[codeOrSlug] || codeOrSlug
}

/**
 * 检查翻译页面是否存在
 * @param sourceSlug 源语言slug或代码
 * @param targetSlug 目标语言slug或代码
 * @returns 页面是否存在
 */
export function translationPageExists(sourceSlug: string, targetSlug: string): boolean {
  const sourceSlugNormalized = getLanguageSlug(sourceSlug)
  const targetSlugNormalized = getLanguageSlug(targetSlug)
  const routePath = `${sourceSlugNormalized}-to-${targetSlugNormalized}`
  return EXISTING_TRANSLATION_PAGES.includes(routePath)
}

/**
 * 获取语言的翻译页面URL，如果页面不存在则返回通用翻译页面
 * @param sourceSlug 源语言slug或代码
 * @param targetSlug 目标语言slug或代码 (默认为 'english')
 * @returns 页面URL
 */
export function getTranslationPageUrl(sourceSlug: string, targetSlug: string = 'english'): string {
  const sourceSlugNormalized = getLanguageSlug(sourceSlug)
  const targetSlugNormalized = getLanguageSlug(targetSlug)
  const routePath = `${sourceSlugNormalized}-to-${targetSlugNormalized}`
  
  if (EXISTING_TRANSLATION_PAGES.includes(routePath)) {
    return `/${routePath}`
  }
  
  // 如果专门的页面不存在，返回通用翻译页面
  return '/text-translate'
}

/**
 * 检查语言是否有专门的翻译页面
 * @param languageSlug 语言slug或代码
 * @returns 是否有专门页面
 */
export function hasLanguageTranslationPage(languageSlug: string): boolean {
  const slugNormalized = getLanguageSlug(languageSlug)
  return EXISTING_TRANSLATION_PAGES.some(page => 
    page.startsWith(`${slugNormalized}-to-`) || page.endsWith(`-to-${slugNormalized}`)
  )
}

/**
 * 获取所有存在的翻译页面路由
 * @returns 存在的页面路由数组
 */
export function getExistingTranslationPages(): string[] {
  return [...EXISTING_TRANSLATION_PAGES]
}
