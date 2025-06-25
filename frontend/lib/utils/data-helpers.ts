import type { 
  User, 
  UserProfile, 
  CreditTransaction, 
  Payment,
  TransactionType,
  PaymentStatus,
  NotificationPreferences
} from '../../../shared/types'

// ===============================
// 数据格式化工具
// ===============================

/**
 * 格式化积分数量显示
 */
export function formatCredits(credits: number): string {
  if (credits < 0) return '0'
  if (credits >= 1000000) {
    return `${(credits / 1000000).toFixed(1)}M`
  }
  if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1)}K`
  }
  return credits.toString()
}

/**
 * 格式化货币金额显示
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * 格式化日期显示
 */
export function formatDate(dateString: string, locale = 'zh-CN'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(dateString: string, locale = 'zh-CN'): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  
  return formatDate(dateString, locale)
}

// ===============================
// 交易类型工具
// ===============================

/**
 * 获取交易类型显示名称
 */
export function getTransactionTypeName(type: TransactionType): string {
  const typeNames: Record<TransactionType, string> = {
    purchase: '购买',
    consume: '消费',
    reward: '奖励',
    refund: '退款'
  }
  return typeNames[type] || type
}

/**
 * 获取交易类型颜色
 */
export function getTransactionTypeColor(type: TransactionType): string {
  const typeColors: Record<TransactionType, string> = {
    purchase: 'text-green-600',
    consume: 'text-red-600',
    reward: 'text-blue-600',
    refund: 'text-yellow-600'
  }
  return typeColors[type] || 'text-gray-600'
}

/**
 * 获取交易金额显示（带符号）
 */
export function getTransactionAmountDisplay(transaction: CreditTransaction): {
  amount: string;
  sign: '+' | '-';
  color: string;
} {
  const isPositive = transaction.type !== 'consume'
  const amount = Math.abs(transaction.amount).toString()
  const sign = isPositive ? '+' : '-'
  const color = isPositive ? 'text-green-600' : 'text-red-600'

  return { amount, sign, color }
}

// ===============================
// 支付状态工具
// ===============================

/**
 * 获取支付状态显示名称
 */
export function getPaymentStatusName(status: PaymentStatus): string {
  const statusNames: Record<PaymentStatus, string> = {
    pending: '待支付',
    completed: '已完成',
    failed: '支付失败',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return statusNames[status] || status
}

/**
 * 获取支付状态颜色
 */
export function getPaymentStatusColor(status: PaymentStatus): string {
  const statusColors: Record<PaymentStatus, string> = {
    pending: 'text-yellow-600 bg-yellow-100',
    completed: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100',
    cancelled: 'text-gray-600 bg-gray-100',
    refunded: 'text-blue-600 bg-blue-100'
  }
  return statusColors[status] || 'text-gray-600 bg-gray-100'
}

// ===============================
// 用户数据工具
// ===============================

/**
 * 获取用户显示名称
 */
export function getUserDisplayName(user: User, profile?: UserProfile): string {
  if (profile?.name) {
    return profile.name
  }
  return user.email.split('@')[0] || '用户'
}

/**
 * 获取用户头像URL
 */
export function getUserAvatarUrl(profile?: UserProfile): string {
  if (profile?.avatar_url) {
    return profile.avatar_url
  }
  // 默认头像URL
  return '/images/default-avatar.png'
}

/**
 * 检查用户是否已完成资料
 */
export function isProfileComplete(profile?: UserProfile): boolean {
  if (!profile) return false
  return !!(profile.name && profile.language && profile.timezone)
}

/**
 * 获取用户语言显示名称
 */
export function getLanguageDisplayName(languageCode: string): string {
  const languageNames: Record<string, string> = {
    'en': 'English',
    'zh': '中文',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'ja': '日本語',
    'ko': '한국어',
    'pt': 'Português',
    'ru': 'Русский',
    'ar': 'العربية'
  }
  return languageNames[languageCode] || languageCode
}

// ===============================
// 积分计算工具
// ===============================

/**
 * 计算积分包优惠率
 */
export function calculateDiscountRate(basePrice: number, discountedPrice: number): number {
  if (basePrice <= 0) return 0
  return Math.round(((basePrice - discountedPrice) / basePrice) * 100)
}

/**
 * 计算每积分成本
 */
export function calculateCostPerCredit(price: number, credits: number): number {
  if (credits <= 0) return 0
  return price / credits
}

/**
 * 格式化每积分成本显示
 */
export function formatCostPerCredit(price: number, credits: number): string {
  const cost = calculateCostPerCredit(price, credits)
  return `$${cost.toFixed(4)}/积分`
}

// ===============================
// 通知偏好工具
// ===============================

/**
 * 获取默认通知偏好
 */
export function getDefaultNotificationPreferences(): NotificationPreferences {
  return {
    email: true,
    push: true,
    translation_complete: true,
    credit_low: true,
    promotional: false
  }
}

/**
 * 合并通知偏好
 */
export function mergeNotificationPreferences(
  current: Partial<NotificationPreferences>,
  updates: Partial<NotificationPreferences>
): NotificationPreferences {
  return {
    ...getDefaultNotificationPreferences(),
    ...current,
    ...updates
  }
}

// ===============================
// 数据验证工具
// ===============================

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证积分数量
 */
export function isValidCreditAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount > 0 && amount <= 1000000
}

/**
 * 验证支付金额
 */
export function isValidPaymentAmount(amount: number): boolean {
  return !isNaN(amount) && amount > 0 && amount <= 10000
}

// ===============================
// 数据排序工具
// ===============================

/**
 * 按日期排序交易记录
 */
export function sortTransactionsByDate(
  transactions: CreditTransaction[], 
  order: 'asc' | 'desc' = 'desc'
): CreditTransaction[] {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return order === 'desc' ? dateB - dateA : dateA - dateB
  })
}

/**
 * 按金额排序交易记录
 */
export function sortTransactionsByAmount(
  transactions: CreditTransaction[], 
  order: 'asc' | 'desc' = 'desc'
): CreditTransaction[] {
  return [...transactions].sort((a, b) => {
    const amountA = Math.abs(a.amount)
    const amountB = Math.abs(b.amount)
    return order === 'desc' ? amountB - amountA : amountA - amountB
  })
}

// ===============================
// 数据过滤工具
// ===============================

/**
 * 按类型过滤交易记录
 */
export function filterTransactionsByType(
  transactions: CreditTransaction[], 
  types: TransactionType[]
): CreditTransaction[] {
  return transactions.filter(transaction => types.includes(transaction.type))
}

/**
 * 按日期范围过滤交易记录
 */
export function filterTransactionsByDateRange(
  transactions: CreditTransaction[], 
  startDate: Date, 
  endDate: Date
): CreditTransaction[] {
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.created_at)
    return transactionDate >= startDate && transactionDate <= endDate
  })
}

/**
 * 按金额范围过滤交易记录
 */
export function filterTransactionsByAmountRange(
  transactions: CreditTransaction[], 
  minAmount: number, 
  maxAmount: number
): CreditTransaction[] {
  return transactions.filter(transaction => {
    const amount = Math.abs(transaction.amount)
    return amount >= minAmount && amount <= maxAmount
  })
} 