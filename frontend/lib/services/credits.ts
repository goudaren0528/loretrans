import { createSupabaseBrowserClient, createSupabaseServerClient } from '../supabase'
import type { 
  CreditTransaction,
  CreditConsumptionRequest,
  CreditPurchaseRequest,
  CreditCalculation,
  TransactionType,
  User
} from '../../../shared/types'

// 积分计费配置
export const CREDIT_CONFIG = {
  FREE_CHARACTERS: 500, // 每次翻译免费字符数
  RATE_PER_CHARACTER: 0.1, // 超出免费额度后每字符积分数
  REGISTRATION_BONUS: 500, // 注册奖励积分
  REFERRAL_BONUS: 200, // 推荐奖励积分
  FIRST_PURCHASE_BONUS_RATE: 0.2 // 首次充值奖励比例（20%）
} as const

export class CreditService {
  private supabase: ReturnType<typeof createSupabaseBrowserClient>

  constructor(useServerClient = false) {
    this.supabase = useServerClient 
      ? createSupabaseServerClient() 
      : createSupabaseBrowserClient()
  }

  // ===============================
  // 积分余额查询
  // ===============================

  /**
   * 获取用户当前积分余额
   */
  async getUserCredits(userId?: string): Promise<number> {
    try {
      let targetUserId = userId
      if (!targetUserId) {
        const { data: authUser } = await this.supabase.auth.getUser()
        if (!authUser.user) return 0
        targetUserId = authUser.user.id
      }

      // 使用数据库函数获取积分
      const { data, error } = await this.supabase
        .rpc('get_user_credits', { p_user_id: targetUserId })

      if (error) {
        console.error('获取用户积分失败:', error)
        return 0
      }

      return data || 0
    } catch (error) {
      console.error('获取用户积分失败:', error)
      return 0
    }
  }

  /**
   * 检查用户积分是否充足
   */
  async hasEnoughCredits(userId: string, requiredCredits: number): Promise<boolean> {
    try {
      const currentCredits = await this.getUserCredits(userId)
      return currentCredits >= requiredCredits
    } catch (error) {
      console.error('检查积分余额失败:', error)
      return false
    }
  }

  // ===============================
  // 积分计费计算
  // ===============================

  /**
   * 计算翻译所需积分
   */
  calculateCreditsRequired(characterCount: number): CreditCalculation {
    const freeCharacters = Math.min(characterCount, CREDIT_CONFIG.FREE_CHARACTERS)
    const billableCharacters = Math.max(0, characterCount - CREDIT_CONFIG.FREE_CHARACTERS)
    const creditsRequired = billableCharacters * CREDIT_CONFIG.RATE_PER_CHARACTER

    return {
      total_characters: characterCount,
      free_characters: freeCharacters,
      billable_characters: billableCharacters,
      credits_required: Math.ceil(creditsRequired),
      cost_breakdown: {
        free_allowance: CREDIT_CONFIG.FREE_CHARACTERS,
        chargeable_portion: billableCharacters,
        rate_per_character: CREDIT_CONFIG.RATE_PER_CHARACTER
      }
    }
  }

  /**
   * 预估翻译费用
   */
  async estimateTranslationCost(text: string): Promise<CreditCalculation> {
    const characterCount = text.length
    return this.calculateCreditsRequired(characterCount)
  }

  // ===============================
  // 积分消费
  // ===============================

  /**
   * 消费积分（用于翻译服务）
   */
  async consumeCredits(
    userId: string, 
    consumptionRequest: CreditConsumptionRequest
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('consume_credits', {
          p_user_id: userId,
          p_amount: consumptionRequest.amount,
          p_description: consumptionRequest.description,
          p_metadata: consumptionRequest.metadata || {}
        })

      if (error) {
        console.error('消费积分失败:', error)
        return false
      }

      return data === true
    } catch (error) {
      console.error('消费积分失败:', error)
      return false
    }
  }

  /**
   * 消费翻译积分
   */
  async consumeTranslationCredits(
    userId: string,
    characterCount: number,
    sourceLanguage: string,
    targetLanguage: string,
    translationType: 'text' | 'document' = 'text'
  ): Promise<{
    success: boolean;
    calculation: CreditCalculation;
    transaction?: CreditTransaction;
  }> {
    try {
      const calculation = this.calculateCreditsRequired(characterCount)
      
      if (calculation.credits_required <= 0) {
        return {
          success: true,
          calculation
        }
      }

      const success = await this.consumeCredits(userId, {
        amount: calculation.credits_required,
        description: `翻译服务 (${sourceLanguage} → ${targetLanguage})`,
        metadata: {
          translation_type: translationType,
          character_count: characterCount,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          rate_per_character: CREDIT_CONFIG.RATE_PER_CHARACTER
        }
      })

      return {
        success,
        calculation
      }
    } catch (error) {
      console.error('消费翻译积分失败:', error)
      return {
        success: false,
        calculation: this.calculateCreditsRequired(characterCount)
      }
    }
  }

  // ===============================
  // 积分充值
  // ===============================

  /**
   * 购买积分（支付成功后调用）
   */
  async purchaseCredits(
    userId: string,
    purchaseRequest: CreditPurchaseRequest
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('purchase_credits', {
          p_user_id: userId,
          p_amount: purchaseRequest.amount,
          p_payment_id: purchaseRequest.payment_id,
          p_description: purchaseRequest.description || '积分购买'
        })

      if (error) {
        console.error('购买积分失败:', error)
        return false
      }

      return data === true
    } catch (error) {
      console.error('购买积分失败:', error)
      return false
    }
  }

  /**
   * 奖励积分（注册、推荐等）
   */
  async rewardCredits(
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          type: 'reward' as TransactionType,
          amount: amount,
          balance: 0, // 将由触发器计算实际余额
          description,
          metadata: metadata || {}
        })
        .select()
        .single()

      if (error) {
        console.error('奖励积分失败:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('奖励积分失败:', error)
      return false
    }
  }

  // ===============================
  // 积分交易记录
  // ===============================

  /**
   * 获取用户积分交易记录
   */
  async getCreditTransactions(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      type?: TransactionType;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ): Promise<{
    transactions: CreditTransaction[];
    total: number;
  }> {
    try {
      let query = this.supabase
        .from('credit_transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // 添加过滤条件
      if (options.type) {
        query = query.eq('type', options.type)
      }
      if (options.dateFrom) {
        query = query.gte('created_at', options.dateFrom)
      }
      if (options.dateTo) {
        query = query.lte('created_at', options.dateTo)
      }
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, (options.offset || 0) + (options.limit || 50) - 1)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('获取积分交易记录失败:', error)
        return { transactions: [], total: 0 }
      }

      return {
        transactions: data || [],
        total: count || 0
      }
    } catch (error) {
      console.error('获取积分交易记录失败:', error)
      return { transactions: [], total: 0 }
    }
  }

  /**
   * 获取积分使用统计
   */
  async getCreditUsageStats(
    userId: string,
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<{
    consumed: number;
    purchased: number;
    rewarded: number;
    period: string;
  }> {
    try {
      const now = new Date()
      let dateFrom: Date

      switch (period) {
        case 'day':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'year':
          dateFrom = new Date(now.getFullYear(), 0, 1)
          break
      }

      const { transactions } = await this.getCreditTransactions(userId, {
        dateFrom: dateFrom.toISOString(),
        limit: 1000 // 获取所有记录用于统计
      })

      const stats = transactions.reduce((acc, transaction) => {
        switch (transaction.type) {
          case 'consume':
            acc.consumed += Math.abs(transaction.amount)
            break
          case 'purchase':
            acc.purchased += transaction.amount
            break
          case 'reward':
            acc.rewarded += transaction.amount
            break
        }
        return acc
      }, { consumed: 0, purchased: 0, rewarded: 0 })

      return {
        ...stats,
        period
      }
    } catch (error) {
      console.error('获取积分使用统计失败:', error)
      return { consumed: 0, purchased: 0, rewarded: 0, period }
    }
  }

  // ===============================
  // 实时订阅
  // ===============================

  /**
   * 订阅用户积分变化
   */
  subscribeToCreditsChanges(userId: string, callback: (credits: number) => void) {
    return this.supabase
      .channel(`credits-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`
      }, (payload) => {
        if (payload.new && 'credits' in payload.new) {
          callback((payload.new as User).credits)
        }
      })
      .subscribe()
  }

  /**
   * 订阅积分交易记录变化
   */
  subscribeToTransactionChanges(userId: string, callback: (transaction: CreditTransaction) => void) {
    return this.supabase
      .channel(`transactions-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'credit_transactions',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        if (payload.new) {
          callback(payload.new as CreditTransaction)
        }
      })
      .subscribe()
  }

  // ===============================
  // 便利方法
  // ===============================

  /**
   * 检查是否为首次购买
   */
  async isFirstPurchase(userId: string): Promise<boolean> {
    try {
      const { transactions } = await this.getCreditTransactions(userId, {
        type: 'purchase',
        limit: 1
      })
      return transactions.length === 0
    } catch (error) {
      console.error('检查首次购买失败:', error)
      return false
    }
  }

  /**
   * 获取积分不足提示信息
   */
  async getInsufficientCreditsMessage(
    userId: string, 
    requiredCredits: number
  ): Promise<{
    message: string;
    currentCredits: number;
    shortfall: number;
    suggestedAction: string;
  }> {
    try {
      const currentCredits = await this.getUserCredits(userId)
      const shortfall = requiredCredits - currentCredits

      return {
        message: `积分不足，需要 ${requiredCredits} 积分，当前余额 ${currentCredits} 积分`,
        currentCredits,
        shortfall,
        suggestedAction: shortfall <= 100 ? '购买基础积分包' : '购买高级积分包'
      }
    } catch (error) {
      console.error('生成积分不足提示失败:', error)
      return {
        message: '积分不足',
        currentCredits: 0,
        shortfall: requiredCredits,
        suggestedAction: '购买积分包'
      }
    }
  }
}

// 默认导出实例
export const creditService = new CreditService()

// 服务端使用的实例
export const createServerCreditService = () => new CreditService(true) 