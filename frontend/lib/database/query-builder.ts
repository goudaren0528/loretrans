/**
 * Supabase查询构建器
 * 提供类型安全的查询构建、事务管理和性能优化功能
 */

import { executeQuery, executeCachedQuery, type QueryOptions, type QueryResult } from './connection'
import type { SupabaseClientType } from './config'
import type { Database } from '../supabase'

/**
 * 表名类型
 */
export type TableName = keyof Database['public']['Tables']

/**
 * 事务操作类型
 */
export interface TransactionOperation {
  table: TableName
  operation: 'insert' | 'update' | 'delete' | 'upsert'
  data?: any
  filter?: Record<string, any>
}

/**
 * 查询构建器选项
 */
export interface QueryBuilderOptions {
  enableCache?: boolean
  cacheTTL?: number
  timeout?: number
  retries?: number
}

/**
 * 用户查询构建器
 */
export class UserQueryBuilder {
  private options: QueryBuilderOptions

  constructor(options: QueryBuilderOptions = {}) {
    this.options = {
      enableCache: false,
      cacheTTL: 300000,
      timeout: 30000,
      retries: 3,
      ...options
    }
  }

  /**
   * 根据ID获取用户
   */
  async getUserById(id: string): Promise<QueryResult<Database['public']['Tables']['users']['Row']>> {
    const queryFunction = async (client: SupabaseClientType) => {
      return client
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
    }

    if (this.options.enableCache) {
      return executeCachedQuery(queryFunction, this.options.cacheTTL, this.options)
    }
    
    return executeQuery(queryFunction, this.options)
  }

  /**
   * 根据邮箱获取用户
   */
  async getUserByEmail(email: string): Promise<QueryResult<Database['public']['Tables']['users']['Row']>> {
    const queryFunction = async (client: SupabaseClientType) => {
      return client
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
    }

    if (this.options.enableCache) {
      return executeCachedQuery(queryFunction, this.options.cacheTTL, this.options)
    }
    
    return executeQuery(queryFunction, this.options)
  }

  /**
   * 创建用户
   */
  async createUser(userData: Database['public']['Tables']['users']['Insert']): Promise<QueryResult<Database['public']['Tables']['users']['Row']>> {
    const queryFunction = async (client: SupabaseClientType) => {
      return client
        .from('users')
        .insert(userData)
        .select()
        .single()
    }

    return executeQuery(queryFunction, this.options)
  }

  /**
   * 更新用户信息
   */
  async updateUser(id: string, updates: Database['public']['Tables']['users']['Update']): Promise<QueryResult<Database['public']['Tables']['users']['Row']>> {
    const queryFunction = async (client: SupabaseClientType) => {
      return client
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    }

    return executeQuery(queryFunction, this.options)
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string): Promise<QueryResult<null>> {
    const queryFunction = async (client: SupabaseClientType) => {
      return client
        .from('users')
        .delete()
        .eq('id', id)
    }

    return executeQuery(queryFunction, this.options)
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(userId?: string): Promise<QueryResult<Database['public']['Views']['user_stats']['Row']>> {
    const queryFunction = async (client: SupabaseClientType) => {
      let query = client.from('user_stats').select('*')
      
      if (userId) {
        query = query.eq('id', userId)
      }
      
      return query.single()
    }

    if (this.options.enableCache) {
      return executeCachedQuery(queryFunction, this.options.cacheTTL, this.options)
    }
    
    return executeQuery(queryFunction, this.options)
  }
}

/**
 * 积分交易查询构建器
 */
export class CreditTransactionQueryBuilder {
  private options: QueryBuilderOptions

  constructor(options: QueryBuilderOptions = {}) {
    this.options = {
      enableCache: false,
      cacheTTL: 300000,
      timeout: 30000,
      retries: 3,
      ...options
    }
  }

  /**
   * 获取用户积分交易记录
   */
  async getUserTransactions(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<QueryResult<Database['public']['Tables']['credit_transactions']['Row'][]>> {
    const queryFunction = async (client: SupabaseClientType) => {
      return client
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
    }

    if (this.options.enableCache) {
      return executeCachedQuery(queryFunction, this.options.cacheTTL, this.options)
    }
    
    return executeQuery(queryFunction, this.options)
  }

  /**
   * 创建积分交易记录
   */
  async createTransaction(transactionData: Database['public']['Tables']['credit_transactions']['Insert']): Promise<QueryResult<Database['public']['Tables']['credit_transactions']['Row']>> {
    const queryFunction = async (client: SupabaseClientType) => {
      return client
        .from('credit_transactions')
        .insert(transactionData)
        .select()
        .single()
    }

    return executeQuery(queryFunction, this.options)
  }

  /**
   * 获取积分消费统计
   */
  async getConsumptionStats(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<QueryResult<{ total_consumed: number; transaction_count: number }>> {
    const queryFunction = async (client: SupabaseClientType) => {
      let query = client
        .from('credit_transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'consume')

      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }

      const { data, error } = await query

      if (error) {
        return { data: null, error }
      }

      const total_consumed = data?.reduce((sum: number, transaction: Database['public']['Tables']['credit_transactions']['Row']) => sum + Math.abs(transaction.amount), 0) || 0
      const transaction_count = data?.length || 0

      return {
        data: { total_consumed, transaction_count },
        error: null
      }
    }

    if (this.options.enableCache) {
      return executeCachedQuery(queryFunction, this.options.cacheTTL, this.options)
    }
    
    return executeQuery(queryFunction, this.options)
  }
}

/**
 * 支付查询构建器
 */
export class PaymentQueryBuilder {
  private options: QueryBuilderOptions

  constructor(options: QueryBuilderOptions = {}) {
    this.options = {
      enableCache: false,
      cacheTTL: 300000,
      timeout: 30000,
      retries: 3,
      ...options
    }
  }

  /**
   * 获取用户支付记录
   */
  async getUserPayments(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<QueryResult<Database['public']['Tables']['payments']['Row'][]>> {
    const queryFunction = async (client: SupabaseClientType) => {
      return client
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
    }

    if (this.options.enableCache) {
      return executeCachedQuery(queryFunction, this.options.cacheTTL, this.options)
    }
    
    return executeQuery(queryFunction, this.options)
  }

  /**
   * 根据Creem支付ID获取支付记录
   */
  async getPaymentByCreemId(creemPaymentId: string): Promise<QueryResult<Database['public']['Tables']['payments']['Row']>> {
    const queryFunction = async (client: SupabaseClientType) => {
      return client
        .from('payments')
        .select('*')
        .eq('creem_payment_id', creemPaymentId)
        .single()
    }

    return executeQuery(queryFunction, this.options)
  }

  /**
   * 创建支付记录
   */
  async createPayment(paymentData: Database['public']['Tables']['payments']['Insert']): Promise<QueryResult<Database['public']['Tables']['payments']['Row']>> {
    const queryFunction = async (client: SupabaseClientType) => {
      return client
        .from('payments')
        .insert(paymentData)
        .select()
        .single()
    }

    return executeQuery(queryFunction, this.options)
  }

  /**
   * 更新支付状态
   */
  async updatePaymentStatus(
    id: string,
    status: Database['public']['Tables']['payments']['Row']['status'],
    completedAt?: string
  ): Promise<QueryResult<Database['public']['Tables']['payments']['Row']>> {
    const queryFunction = async (client: SupabaseClientType) => {
      const updates: Database['public']['Tables']['payments']['Update'] = { status }
      if (completedAt) {
        updates.completed_at = completedAt
      }

      return client
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    }

    return executeQuery(queryFunction, this.options)
  }
}

/**
 * 事务管理器
 */
export class TransactionManager {
  private operations: TransactionOperation[] = []

  /**
   * 添加操作到事务
   */
  addOperation(operation: TransactionOperation): this {
    this.operations.push(operation)
    return this
  }

  /**
   * 执行事务
   */
  async execute(options: QueryOptions = {}): Promise<QueryResult<any[]>> {
    const queryFunction = async (client: SupabaseClientType) => {
      const results: any[] = []

      // 注意：Supabase不支持传统的事务，这里模拟事务行为
      // 如果任何操作失败，需要手动回滚之前的操作
      const completedOperations: { operation: TransactionOperation; result: any }[] = []

      try {
        for (const operation of this.operations) {
          let result

          switch (operation.operation) {
            case 'insert':
              result = await client
                .from(operation.table)
                .insert(operation.data)
                .select()
              break

            case 'update':
              let updateQuery = client
                .from(operation.table)
                .update(operation.data)

              if (operation.filter) {
                Object.entries(operation.filter).forEach(([key, value]) => {
                  updateQuery = updateQuery.eq(key, value)
                })
              }

              result = await updateQuery.select()
              break

            case 'delete':
              let deleteQuery = client.from(operation.table).delete()

              if (operation.filter) {
                Object.entries(operation.filter).forEach(([key, value]) => {
                  deleteQuery = deleteQuery.eq(key, value)
                })
              }

              result = await deleteQuery
              break

            case 'upsert':
              result = await client
                .from(operation.table)
                .upsert(operation.data)
                .select()
              break

            default:
              throw new Error(`Unsupported operation: ${operation.operation}`)
          }

          if (result.error) {
            throw result.error
          }

          completedOperations.push({ operation, result })
          results.push(result.data)
        }

        return { data: results, error: null }

      } catch (error) {
        // 模拟回滚：尝试撤销已完成的操作
        console.error('Transaction failed, attempting rollback:', error)
        
        for (const { operation } of completedOperations.reverse()) {
          try {
            // 这里可以实现回滚逻辑
            console.warn('Rollback not implemented for operation:', operation)
          } catch (rollbackError) {
            console.error('Rollback failed:', rollbackError)
          }
        }

        return { data: null, error }
      }
    }

    const result = await executeQuery(queryFunction, options)
    
    // 清空操作列表
    this.operations = []
    
    return result
  }

  /**
   * 清空操作列表
   */
  clear(): this {
    this.operations = []
    return this
  }

  /**
   * 获取当前操作数量
   */
  getOperationCount(): number {
    return this.operations.length
  }
}

/**
 * 数据库函数调用器
 */
export class DatabaseFunctionCaller {
  private options: QueryOptions

  constructor(options: QueryOptions = {}) {
    this.options = {
      timeout: 30000,
      retries: 3,
      ...options
    }
  }

  /**
   * 消费积分
   */
  async consumeCredits(
    userId: string,
    amount: number,
    description: string,
    metadata?: any
  ): Promise<QueryResult<boolean>> {
    const queryFunction = async (client: SupabaseClientType) => {
      return client.rpc('consume_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_description: description,
        p_metadata: metadata
      })
    }

    return executeQuery(queryFunction, this.options)
  }

  /**
   * 购买积分
   */
  async purchaseCredits(
    userId: string,
    amount: number,
    paymentId: string,
    description?: string
  ): Promise<QueryResult<boolean>> {
    const queryFunction = async (client: SupabaseClientType) => {
      return client.rpc('purchase_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_payment_id: paymentId,
        p_description: description
      })
    }

    return executeQuery(queryFunction, this.options)
  }

  /**
   * 获取用户积分余额
   */
  async getUserCredits(userId?: string): Promise<QueryResult<number>> {
    const queryFunction = async (client: SupabaseClientType) => {
      return client.rpc('get_user_credits', {
        p_user_id: userId
      })
    }

    return executeQuery(queryFunction, this.options)
  }
}

// 导出查询构建器实例
export const userQuery = new UserQueryBuilder({ enableCache: true })
export const creditTransactionQuery = new CreditTransactionQueryBuilder({ enableCache: true })
export const paymentQuery = new PaymentQueryBuilder()
export const transactionManager = new TransactionManager()
export const dbFunctions = new DatabaseFunctionCaller() 