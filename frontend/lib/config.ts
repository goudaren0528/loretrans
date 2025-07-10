import { APP_CONFIG } from '../../config/app.config'

/**
 * 获取翻译相关配置
 */
export const getTranslationConfig = () => {
  return APP_CONFIG.translation
}

/**
 * 获取免费字符限制
 */
export const getFreeCharacterLimit = () => {
  return APP_CONFIG.translation.freeCharacterLimit
}

/**
 * 获取文本输入上限
 */
export const getMaxTextInputLimit = () => {
  return APP_CONFIG.translation.maxTextInputLimit
}

/**
 * 获取队列模式阈值
 */
export const getQueueThreshold = () => {
  return APP_CONFIG.translation.queueThreshold
}

/**
 * 获取队列配置
 */
export const getQueueConfig = () => {
  return APP_CONFIG.translation.queue
}

/**
 * 获取积分费率
 */
export const getCreditRatePerCharacter = () => {
  return APP_CONFIG.translation.creditRatePerCharacter
}

/**
 * 获取注册奖励积分
 */
export const getRegistrationBonus = () => {
  return APP_CONFIG.translation.registrationBonus
}

/**
 * 计算翻译费用
 */
export const calculateTranslationCost = (characterCount: number) => {
  const freeLimit = getFreeCharacterLimit()
  const rate = getCreditRatePerCharacter()
  
  const freeCharacters = Math.min(characterCount, freeLimit)
  const billableCharacters = Math.max(0, characterCount - freeLimit)
  const creditsRequired = billableCharacters * rate
  
  return {
    totalCharacters: characterCount,
    freeCharacters,
    billableCharacters,
    creditsRequired: Math.ceil(creditsRequired)
  }
}

/**
 * 判断是否需要队列模式
 */
export const shouldUseQueue = (characterCount: number) => {
  return characterCount > getQueueThreshold()
}
