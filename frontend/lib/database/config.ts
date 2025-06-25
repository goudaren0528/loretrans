/**
 * Supabase数据库配置管理
 * 提供数据库连接配置、环境管理和健康检查功能
 */

import { createSupabaseBrowserClient, createSupabaseServerClient, createSupabaseServiceClient } from '../supabase'

export type SupabaseClientType = ReturnType<typeof createSupabaseBrowserClient>

/**
 * 数据库配置选项
 */
export interface DatabaseConfig {
  maxRetries: number
  retryDelay: number
  timeout: number
  connectionPool: {
    max: number
    min: number
    idleTimeoutMillis: number
  }
  cache: {
    enabled: boolean
    ttl: number
    maxSize: number
  }
  monitoring: {
    enabled: boolean
    logSlowQueries: boolean
    slowQueryThreshold: number
  }
}

/**
 * 默认数据库配置
 */
export const defaultConfig: DatabaseConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  connectionPool: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000
  },
  cache: {
    enabled: true,
    ttl: 300000, // 5分钟
    maxSize: 100
  },
  monitoring: {
    enabled: process.env.NODE_ENV === 'development',
    logSlowQueries: true,
    slowQueryThreshold: 1000 // 1秒
  }
}

/**
 * 数据库客户端管理器
 */
export class DatabaseManager {
  private static instance: DatabaseManager
  private config: DatabaseConfig
  private clients: Map<string, SupabaseClientType> = new Map()
  private healthCheckInterval: NodeJS.Timeout | null = null

  private constructor(config: DatabaseConfig = defaultConfig) {
    this.config = config
    this.initializeHealthCheck()
  }

  /**
   * 获取单例实例
   */
  public static getInstance(config?: DatabaseConfig): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager(config)
    }
    return DatabaseManager.instance
  }

  /**
   * 获取浏览器客户端
   */
  public getBrowserClient(): SupabaseClientType {
    const key = 'browser'
    if (!this.clients.has(key)) {
      this.clients.set(key, createSupabaseBrowserClient())
    }
    return this.clients.get(key)!
  }

  /**
   * 获取服务器客户端
   */
  public getServerClient(): SupabaseClientType {
    const key = 'server'
    if (!this.clients.has(key)) {
      this.clients.set(key, createSupabaseServerClient())
    }
    return this.clients.get(key)!
  }

  /**
   * 获取服务角色客户端
   */
  public getServiceClient(): SupabaseClientType {
    const key = 'service'
    if (!this.clients.has(key)) {
      this.clients.set(key, createSupabaseServiceClient())
    }
    return this.clients.get(key)!
  }

  /**
   * 数据库健康检查
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    latency: number
    timestamp: Date
    error?: string
  }> {
    const startTime = Date.now()
    
    try {
      const client = this.getBrowserClient()
      const { error } = await client.from('users').select('id').limit(1)
      
      const latency = Date.now() - startTime
      
      if (error) {
        return {
          status: 'unhealthy',
          latency,
          timestamp: new Date(),
          error: error.message
        }
      }

      return {
        status: 'healthy',
        latency,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 初始化健康检查
   */
  private initializeHealthCheck(): void {
    if (this.config.monitoring.enabled && typeof window !== 'undefined') {
      this.healthCheckInterval = setInterval(() => {
        this.healthCheck().then(result => {
          if (result.status === 'unhealthy') {
            console.warn('Database health check failed:', result)
          }
        })
      }, 60000) // 每分钟检查一次
    }
  }

  /**
   * 停止健康检查
   */
  public stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<DatabaseConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * 获取当前配置
   */
  public getConfig(): DatabaseConfig {
    return { ...this.config }
  }

  /**
   * 清理客户端连接
   */
  public cleanup(): void {
    this.clients.clear()
    this.stopHealthCheck()
  }
}

/**
 * 数据库环境检查
 */
export function validateDatabaseEnvironment(): {
  isValid: boolean
  missingVars: string[]
  recommendations: string[]
} {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
  
  const optionalVars = [
    'SUPABASE_SERVICE_ROLE_KEY'
  ]

  const missingVars: string[] = []
  const recommendations: string[] = []

  // 检查必需变量
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  })

  // 检查可选变量
  optionalVars.forEach(varName => {
    if (!process.env[varName]) {
      recommendations.push(`Consider setting ${varName} for enhanced functionality`)
    }
  })

  // 检查URL格式
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    recommendations.push('Supabase URL should use HTTPS in production')
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    recommendations
  }
}

/**
 * 获取数据库连接信息
 */
export function getDatabaseInfo(): {
  url: string
  project: string
  region: string
  environment: 'development' | 'staging' | 'production'
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const urlParts = url.replace('https://', '').split('.')
  const project = urlParts[0] || 'unknown'
  const region = urlParts[1] || 'unknown'
  
  // 根据项目名称推测环境
  let environment: 'development' | 'staging' | 'production' = 'development'
  if (project.includes('prod')) {
    environment = 'production'
  } else if (project.includes('staging') || project.includes('stage')) {
    environment = 'staging'
  }

  return {
    url,
    project,
    region,
    environment
  }
}

// 导出单例实例
export const databaseManager = DatabaseManager.getInstance() 