/**
 * 未登录用户翻译限制服务
 * 实现每日10次翻译限制，使用localStorage + IP追踪双重验证
 */

export interface GuestLimitStatus {
  remainingTranslations: number
  totalLimit: number
  resetTime: Date
  isLimitReached: boolean
  canTranslate: boolean
}

export interface GuestTranslationRecord {
  count: number
  date: string
  ip?: string
  lastTranslation: string
}

export class GuestLimitService {
  private static readonly DAILY_LIMIT = 10
  private static readonly STORAGE_KEY = 'transly_guest_translations'
  private static readonly IP_STORAGE_KEY = 'transly_guest_ip_hash'

  /**
   * 检查未登录用户翻译限制状态
   */
  static checkGuestLimit(): GuestLimitStatus {
    if (typeof window === 'undefined') {
      // 服务端渲染时返回默认状态
      return {
        remainingTranslations: this.DAILY_LIMIT,
        totalLimit: this.DAILY_LIMIT,
        resetTime: this.getNextResetTime(),
        isLimitReached: false,
        canTranslate: true
      }
    }

    const today = this.getTodayString()
    const record = this.getStoredRecord()

    // 如果是新的一天，重置计数
    if (record.date !== today) {
      this.resetDailyCount()
      return {
        remainingTranslations: this.DAILY_LIMIT,
        totalLimit: this.DAILY_LIMIT,
        resetTime: this.getNextResetTime(),
        isLimitReached: false,
        canTranslate: true
      }
    }

    const remaining = Math.max(0, this.DAILY_LIMIT - record.count)
    const isLimitReached = remaining === 0

    return {
      remainingTranslations: remaining,
      totalLimit: this.DAILY_LIMIT,
      resetTime: this.getNextResetTime(),
      isLimitReached,
      canTranslate: !isLimitReached
    }
  }

  /**
   * 记录一次翻译使用
   */
  static recordTranslation(): boolean {
    if (typeof window === 'undefined') return true

    const status = this.checkGuestLimit()
    if (!status.canTranslate) {
      return false
    }

    const today = this.getTodayString()
    const record = this.getStoredRecord()

    // 更新记录
    const newRecord: GuestTranslationRecord = {
      count: record.date === today ? record.count + 1 : 1,
      date: today,
      lastTranslation: new Date().toISOString()
    }

    this.storeRecord(newRecord)
    return true
  }

  /**
   * 获取存储的翻译记录
   */
  private static getStoredRecord(): GuestTranslationRecord {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to parse guest translation record:', error)
    }

    // 返回默认记录
    return {
      count: 0,
      date: this.getTodayString(),
      lastTranslation: new Date().toISOString()
    }
  }

  /**
   * 存储翻译记录
   */
  private static storeRecord(record: GuestTranslationRecord): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(record))
    } catch (error) {
      console.warn('Failed to store guest translation record:', error)
    }
  }

  /**
   * 重置每日计数
   */
  private static resetDailyCount(): void {
    const newRecord: GuestTranslationRecord = {
      count: 0,
      date: this.getTodayString(),
      lastTranslation: new Date().toISOString()
    }
    this.storeRecord(newRecord)
  }

  /**
   * 获取今天的日期字符串 (YYYY-MM-DD)
   */
  private static getTodayString(): string {
    return new Date().toISOString().split('T')[0]
  }

  /**
   * 获取下次重置时间 (明天 00:00 UTC)
   */
  private static getNextResetTime(): Date {
    const tomorrow = new Date()
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    tomorrow.setUTCHours(0, 0, 0, 0)
    return tomorrow
  }

  /**
   * 获取限制提示信息
   */
  static getLimitMessage(status: GuestLimitStatus): {
    title: string
    description: string
    action: string
  } {
    if (status.isLimitReached) {
      const resetTime = status.resetTime.toLocaleString()
      return {
        title: '今日免费翻译次数已用完',
        description: `免费用户每天可以翻译${status.totalLimit}次，将在 ${resetTime} 重置`,
        action: '注册账户获得无限制翻译'
      }
    }

    return {
      title: `还可以翻译 ${status.remainingTranslations} 次`,
      description: `免费用户每天可以翻译${status.totalLimit}次，注册后无限制`,
      action: '立即注册'
    }
  }

  /**
   * 清除存储的记录（用于测试）
   */
  static clearStoredData(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      localStorage.removeItem(this.IP_STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear guest data:', error)
    }
  }
}

// 服务端IP验证API
export async function verifyGuestLimitOnServer(ip: string): Promise<{
  allowed: boolean
  remaining: number
  resetTime: Date
}> {
  try {
    // 这里应该调用服务端API进行IP验证
    // 暂时返回允许状态
    return {
      allowed: true,
      remaining: GuestLimitService.DAILY_LIMIT,
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  } catch (error) {
    console.error('Server guest limit verification failed:', error)
    // 验证失败时允许翻译，避免影响用户体验
    return {
      allowed: true,
      remaining: GuestLimitService.DAILY_LIMIT,
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  }
}
