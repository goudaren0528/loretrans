/**
 * 数据库连接管理器
 * 提供连接池管理、重试机制、性能监控功能
 */

import { databaseManager, type SupabaseClientType } from './config'

/**
 * 查询选项
 */
export interface QueryOptions {
  timeout?: number
  retries?: number
  retryDelay?: number
  cache?: boolean
  cacheTTL?: number
}

/**
 * 查询结果
 */
export interface QueryResult<T = any> {
  data: T | null
  error: any | null
  count?: number | null
  status: number
  statusText: string
  executed_at: Date
  execution_time: number
  from_cache: boolean
}

/**
 * 连接统计信息
 */
export interface ConnectionStats {
  totalQueries: number
  successfulQueries: number
  failedQueries: number
  averageExecutionTime: number
  cacheHitRate: number
  connectionPoolUsage: number
}

/**
 * 查询缓存
 */
class QueryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  set(key: string, data: any, ttl = 300000): void {
    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

/**
 * 连接管理器
 */
export class ConnectionManager {
  private static instance: ConnectionManager
  private cache = new QueryCache()
  private stats: ConnectionStats = {
    totalQueries: 0,
    successfulQueries: 0,
    failedQueries: 0,
    averageExecutionTime: 0,
    cacheHitRate: 0,
    connectionPoolUsage: 0
  }

  private constructor() {}

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager()
    }
    return ConnectionManager.instance
  }

  /**
   * 执行查询（带重试和缓存）
   */
  public async executeQuery<T = any>(
    queryFunction: (client: SupabaseClientType) => Promise<any>,
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const {
      timeout = 30000,
      retries = 3,
      retryDelay = 1000,
      cache = false,
      cacheTTL = 300000
    } = options

    const startTime = Date.now()
    let client: SupabaseClientType

    // 生成缓存键
    const cacheKey = cache ? this.generateCacheKey(queryFunction.toString()) : null

    // 检查缓存
    if (cache && cacheKey) {
      const cachedResult = this.cache.get(cacheKey)
      if (cachedResult) {
        this.updateStats(true, Date.now() - startTime, true)
        return {
          ...cachedResult,
          executed_at: new Date(),
          execution_time: 0,
          from_cache: true
        }
      }
    }

    // 获取客户端连接
    try {
      client = this.getClient()
    } catch (error) {
      return this.createErrorResult(error, startTime)
    }

    // 执行查询（带重试机制）
    let lastError: any
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // 设置超时
        const queryPromise = queryFunction(client)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), timeout)
        })

        const result = await Promise.race([queryPromise, timeoutPromise])
        const executionTime = Date.now() - startTime

        // 缓存结果
        if (cache && cacheKey && !result.error) {
          this.cache.set(cacheKey, result, cacheTTL)
        }

        this.updateStats(!result.error, executionTime, false)

        return {
          ...result,
          executed_at: new Date(),
          execution_time: executionTime,
          from_cache: false
        }

      } catch (error) {
        lastError = error
        
        // 如果不是最后一次尝试，等待后重试
        if (attempt < retries) {
          await this.delay(retryDelay * (attempt + 1))
        }
      }
    }

    // 所有重试都失败了
    this.updateStats(false, Date.now() - startTime, false)
    return this.createErrorResult(lastError, startTime)
  }

  /**
   * 获取数据库客户端
   */
  private getClient(): SupabaseClientType {
    if (typeof window !== 'undefined') {
      return databaseManager.getBrowserClient()
    } else {
      return databaseManager.getServerClient()
    }
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(queryString: string): string {
    // 简单的哈希函数
    let hash = 0
    for (let i = 0; i < queryString.length; i++) {
      const char = queryString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return `query_${Math.abs(hash)}`
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 创建错误结果
   */
  private createErrorResult(error: any, startTime: number): QueryResult {
    return {
      data: null,
      error: error instanceof Error ? error.message : error,
      status: 500,
      statusText: 'Internal Server Error',
      executed_at: new Date(),
      execution_time: Date.now() - startTime,
      from_cache: false
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(success: boolean, executionTime: number, fromCache: boolean): void {
    this.stats.totalQueries++
    
    if (success) {
      this.stats.successfulQueries++
    } else {
      this.stats.failedQueries++
    }

    // 更新平均执行时间
    const totalTime = this.stats.averageExecutionTime * (this.stats.totalQueries - 1) + executionTime
    this.stats.averageExecutionTime = totalTime / this.stats.totalQueries

    // 更新缓存命中率
    const cacheHits = fromCache ? 1 : 0
    this.stats.cacheHitRate = (this.stats.cacheHitRate * (this.stats.totalQueries - 1) + cacheHits) / this.stats.totalQueries
  }

  /**
   * 获取连接统计信息
   */
  public getStats(): ConnectionStats {
    return { ...this.stats }
  }

  /**
   * 重置统计信息
   */
  public resetStats(): void {
    this.stats = {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      averageExecutionTime: 0,
      cacheHitRate: 0,
      connectionPoolUsage: 0
    }
  }

  /**
   * 清理缓存
   */
  public clearCache(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存信息
   */
  public getCacheInfo(): { size: number; maxSize: number } {
    return {
      size: this.cache.size(),
      maxSize: 100 // 从配置中获取
    }
  }
}

/**
 * 便捷的查询执行函数
 */
export async function executeQuery<T = any>(
  queryFunction: (client: SupabaseClientType) => Promise<any>,
  options?: QueryOptions
): Promise<QueryResult<T>> {
  const manager = ConnectionManager.getInstance()
  return manager.executeQuery<T>(queryFunction, options)
}

/**
 * 带缓存的查询执行
 */
export async function executeCachedQuery<T = any>(
  queryFunction: (client: SupabaseClientType) => Promise<any>,
  cacheTTL = 300000,
  options?: Omit<QueryOptions, 'cache' | 'cacheTTL'>
): Promise<QueryResult<T>> {
  return executeQuery<T>(queryFunction, {
    ...options,
    cache: true,
    cacheTTL
  })
}

// 导出单例实例
export const connectionManager = ConnectionManager.getInstance() 