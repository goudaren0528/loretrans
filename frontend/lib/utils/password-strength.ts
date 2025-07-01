export interface PasswordStrengthResult {
  score: number // 0-4，0最弱，4最强
  feedback: string[]
  isValid: boolean
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong'
}

export interface PasswordRequirement {
  label: string
  regex: RegExp
  met: boolean
}

// 多语言支持
interface PasswordStrengthTranslations {
  requirements: {
    minLength: string
    uppercase: string
    lowercase: string
    number: string
    special: string
  }
  strength: {
    'very-weak': string
    'weak': string
    'fair': string
    'good': string
    'strong': string
  }
  feedback: {
    enterPassword: string
    tooShort: string
    avoidCommonPatterns: string
    avoidRepeating: string
    excellent: string
    good: string
  }
}

const translations: Record<string, PasswordStrengthTranslations> = {
  en: {
    requirements: {
      minLength: 'At least 8 characters',
      uppercase: 'Contains uppercase letter',
      lowercase: 'Contains lowercase letter',
      number: 'Contains number',
      special: 'Contains special character',
    },
    strength: {
      'very-weak': 'Very Weak',
      'weak': 'Weak',
      'fair': 'Fair',
      'good': 'Good',
      'strong': 'Strong',
    },
    feedback: {
      enterPassword: 'Please enter a password',
      tooShort: 'Password is too short, recommend at least 8 characters',
      avoidCommonPatterns: 'Avoid common patterns (like 123456, qwerty, etc.)',
      avoidRepeating: 'Avoid repeating characters (like aaa, 111, etc.)',
      excellent: 'Password strength is excellent!',
      good: 'Password strength is good',
    },
  },
  zh: {
    requirements: {
      minLength: '至少8个字符',
      uppercase: '包含大写字母',
      lowercase: '包含小写字母',
      number: '包含数字',
      special: '包含特殊字符',
    },
    strength: {
      'very-weak': '非常弱',
      'weak': '弱',
      'fair': '一般',
      'good': '良好',
      'strong': '强',
    },
    feedback: {
      enterPassword: '请输入密码',
      tooShort: '密码太短，建议至少8个字符',
      avoidCommonPatterns: '避免使用常见模式（如123456、qwerty等）',
      avoidRepeating: '避免重复字符（如aaa、111等）',
      excellent: '密码强度很好！',
      good: '密码强度良好',
    },
  },
  es: {
    requirements: {
      minLength: 'Al menos 8 caracteres',
      uppercase: 'Contiene letra mayúscula',
      lowercase: 'Contiene letra minúscula',
      number: 'Contiene número',
      special: 'Contiene carácter especial',
    },
    strength: {
      'very-weak': 'Muy Débil',
      'weak': 'Débil',
      'fair': 'Regular',
      'good': 'Buena',
      'strong': 'Fuerte',
    },
    feedback: {
      enterPassword: 'Por favor ingrese una contraseña',
      tooShort: 'La contraseña es muy corta, se recomienda al menos 8 caracteres',
      avoidCommonPatterns: 'Evite patrones comunes (como 123456, qwerty, etc.)',
      avoidRepeating: 'Evite caracteres repetidos (como aaa, 111, etc.)',
      excellent: '¡La fortaleza de la contraseña es excelente!',
      good: 'La fortaleza de la contraseña es buena',
    },
  },
  fr: {
    requirements: {
      minLength: 'Au moins 8 caractères',
      uppercase: 'Contient une lettre majuscule',
      lowercase: 'Contient une lettre minuscule',
      number: 'Contient un chiffre',
      special: 'Contient un caractère spécial',
    },
    strength: {
      'very-weak': 'Très Faible',
      'weak': 'Faible',
      'fair': 'Correct',
      'good': 'Bon',
      'strong': 'Fort',
    },
    feedback: {
      enterPassword: 'Veuillez saisir un mot de passe',
      tooShort: 'Le mot de passe est trop court, recommandé au moins 8 caractères',
      avoidCommonPatterns: 'Évitez les modèles courants (comme 123456, qwerty, etc.)',
      avoidRepeating: 'Évitez les caractères répétés (comme aaa, 111, etc.)',
      excellent: 'La force du mot de passe est excellente !',
      good: 'La force du mot de passe est bonne',
    },
  },
}

/**
 * 检查密码强度
 */
export function checkPasswordStrength(password: string, locale: string = 'en'): PasswordStrengthResult {
  const requirements = getPasswordRequirements(password, locale)
  const metCount = requirements.filter(req => req.met).length
  const score = calculateScore(password, metCount)
  const strength = getStrengthLevel(score)
  
  return {
    score,
    feedback: generateFeedback(requirements, password, locale),
    isValid: isPasswordValid(password, requirements),
    strength,
  }
}

/**
 * 获取密码要求列表
 */
export function getPasswordRequirements(password: string, locale: string = 'en'): PasswordRequirement[] {
  const t = translations[locale] || translations.en
  
  return [
    {
      label: t.requirements.minLength,
      regex: /.{8,}/,
      met: /.{8,}/.test(password),
    },
    {
      label: t.requirements.uppercase,
      regex: /[A-Z]/,
      met: /[A-Z]/.test(password),
    },
    {
      label: t.requirements.lowercase,
      regex: /[a-z]/,
      met: /[a-z]/.test(password),
    },
    {
      label: t.requirements.number,
      regex: /[0-9]/,
      met: /[0-9]/.test(password),
    },
    {
      label: t.requirements.special,
      regex: /[^A-Za-z0-9]/,
      met: /[^A-Za-z0-9]/.test(password),
    },
  ]
}

/**
 * 计算密码强度分数
 */
function calculateScore(password: string, metRequirements: number): number {
  if (password.length === 0) return 0
  
  let score = 0
  
  // 基础分数（基于满足的要求数量）
  score += metRequirements
  
  // 长度加分
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  
  // 复杂度加分
  if (/[A-Z].*[A-Z]/.test(password)) score += 0.5 // 多个大写字母
  if (/[0-9].*[0-9]/.test(password)) score += 0.5 // 多个数字
  if (/[^A-Za-z0-9].*[^A-Za-z0-9]/.test(password)) score += 0.5 // 多个特殊字符
  
  // 模式检测减分
  if (hasCommonPatterns(password)) score -= 1
  if (hasRepeatingCharacters(password)) score -= 0.5
  
  return Math.min(Math.max(Math.round(score), 0), 4)
}

/**
 * 获取强度等级
 */
function getStrengthLevel(score: number): PasswordStrengthResult['strength'] {
  switch (score) {
    case 0:
    case 1:
      return 'very-weak'
    case 2:
      return 'weak'
    case 3:
      return 'fair'
    case 4:
      return 'good'
    default:
      return 'strong'
  }
}

/**
 * 生成反馈信息
 */
function generateFeedback(requirements: PasswordRequirement[], password: string, locale: string = 'en'): string[] {
  const feedback: string[] = []
  const t = translations[locale] || translations.en
  
  if (password.length === 0) {
    return [t.feedback.enterPassword]
  }
  
  // 未满足的要求
  const unmetRequirements = requirements.filter(req => !req.met)
  unmetRequirements.forEach(req => {
    feedback.push(`${req.label}`)
  })
  
  // 额外建议
  if (password.length >= 6 && password.length < 8) {
    feedback.push(t.feedback.tooShort)
  }
  
  if (hasCommonPatterns(password)) {
    feedback.push(t.feedback.avoidCommonPatterns)
  }
  
  if (hasRepeatingCharacters(password)) {
    feedback.push(t.feedback.avoidRepeating)
  }
  
  if (feedback.length === 0) {
    const score = calculateScore(password, requirements.filter(r => r.met).length)
    if (score >= 4) {
      feedback.push(t.feedback.excellent)
    } else if (score >= 3) {
      feedback.push(t.feedback.good)
    }
  }
  
  return feedback
}

/**
 * 检查密码是否有效
 */
function isPasswordValid(password: string, requirements: PasswordRequirement[]): boolean {
  // 最低要求：至少8个字符，包含字母和数字
  const minRequirements = requirements.filter((req, index) => 
    index === 0 || // 至少8个字符
    index === 2 || // 包含小写字母
    index === 3    // 包含数字
  )
  
  return minRequirements.every(req => req.met)
}

/**
 * 检查常见模式
 */
function hasCommonPatterns(password: string): boolean {
  const commonPatterns = [
    /123456/,
    /654321/,
    /qwerty/i,
    /asdfgh/i,
    /password/i,
    /admin/i,
    /letmein/i,
    /welcome/i,
    /monkey/i,
    /dragon/i,
  ]
  
  return commonPatterns.some(pattern => pattern.test(password))
}

/**
 * 检查重复字符
 */
function hasRepeatingCharacters(password: string): boolean {
  // 检查连续3个或以上相同字符
  return /(.)\1{2,}/.test(password)
}

/**
 * 获取强度颜色
 */
export function getStrengthColor(strength: PasswordStrengthResult['strength']): string {
  switch (strength) {
    case 'very-weak':
      return 'text-red-600'
    case 'weak':
      return 'text-orange-600'
    case 'fair':
      return 'text-yellow-600'
    case 'good':
      return 'text-blue-600'
    case 'strong':
      return 'text-green-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * 获取强度进度条颜色
 */
export function getStrengthProgressColor(strength: PasswordStrengthResult['strength']): string {
  switch (strength) {
    case 'very-weak':
      return 'bg-red-500'
    case 'weak':
      return 'bg-orange-500'
    case 'fair':
      return 'bg-yellow-500'
    case 'good':
      return 'bg-blue-500'
    case 'strong':
      return 'bg-green-500'
    default:
      return 'bg-gray-300'
  }
}

/**
 * 获取强度文本
 */
export function getStrengthText(strength: PasswordStrengthResult['strength'], locale: string = 'en'): string {
  const t = translations[locale] || translations.en
  return t.strength[strength] || t.strength['very-weak']
}
