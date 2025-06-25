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

/**
 * 检查密码强度
 */
export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const requirements = getPasswordRequirements(password)
  const metCount = requirements.filter(req => req.met).length
  const score = calculateScore(password, metCount)
  const strength = getStrengthLevel(score)
  
  return {
    score,
    feedback: generateFeedback(requirements, password),
    isValid: isPasswordValid(password, requirements),
    strength,
  }
}

/**
 * 获取密码要求列表
 */
export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    {
      label: '至少8个字符',
      regex: /.{8,}/,
      met: /.{8,}/.test(password),
    },
    {
      label: '包含大写字母',
      regex: /[A-Z]/,
      met: /[A-Z]/.test(password),
    },
    {
      label: '包含小写字母',
      regex: /[a-z]/,
      met: /[a-z]/.test(password),
    },
    {
      label: '包含数字',
      regex: /[0-9]/,
      met: /[0-9]/.test(password),
    },
    {
      label: '包含特殊字符',
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
function generateFeedback(requirements: PasswordRequirement[], password: string): string[] {
  const feedback: string[] = []
  
  if (password.length === 0) {
    return ['请输入密码']
  }
  
  // 未满足的要求
  const unmetRequirements = requirements.filter(req => !req.met)
  unmetRequirements.forEach(req => {
    feedback.push(`${req.label}`)
  })
  
  // 额外建议
  if (password.length >= 6 && password.length < 8) {
    feedback.push('密码太短，建议至少8个字符')
  }
  
  if (hasCommonPatterns(password)) {
    feedback.push('避免使用常见模式（如123456、qwerty等）')
  }
  
  if (hasRepeatingCharacters(password)) {
    feedback.push('避免重复字符（如aaa、111等）')
  }
  
  if (feedback.length === 0) {
    const score = calculateScore(password, requirements.filter(r => r.met).length)
    if (score >= 4) {
      feedback.push('密码强度很好！')
    } else if (score >= 3) {
      feedback.push('密码强度良好')
    }
  }
  
  return feedback
}

/**
 * 检查密码是否有效
 */
function isPasswordValid(password: string, requirements: PasswordRequirement[]): boolean {
  // 最低要求：至少8个字符，包含字母和数字
  const minRequirements = requirements.filter(req => 
    req.label === '至少8个字符' || 
    req.label === '包含小写字母' || 
    req.label === '包含数字'
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
export function getStrengthText(strength: PasswordStrengthResult['strength']): string {
  switch (strength) {
    case 'very-weak':
      return '非常弱'
    case 'weak':
      return '弱'
    case 'fair':
      return '一般'
    case 'good':
      return '良好'
    case 'strong':
      return '强'
    default:
      return '未知'
  }
} 