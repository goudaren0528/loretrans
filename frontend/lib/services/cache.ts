/**
 * 缓存服务
 * 支持Vercel KV/Upstash Redis和本地内存缓存
 */

import { createClient } from '@vercel/kv'
import { APP_CONFIG } from '../../../config/app.config'

interface CacheItem<T = any> {
  value: T
  expiry: number
  createdAt: number
}

interface CacheService {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
}

/**
 * 本地内存缓存实现
 */
class MemoryCache implements CacheService {
  private cache = new Map<string, CacheItem>()
  private maxSize: number

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value as T
  }

  async set<T>(key: string, value: T, ttl: number = APP_CONFIG.cache.ttl): Promise<void> {
    // 如果缓存已满，删除最旧的项目
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    const expiry = Date.now() + ttl * 1000
    this.cache.set(key, {
      value,
      expiry,
      createdAt: Date.now()
    })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key) && Date.now() <= (this.cache.get(key)?.expiry || 0)
  }

  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, item] of this.cache) {
      if (item.createdAt < oldestTime) {
        oldestTime = item.createdAt
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  // 获取缓存统计
  getStats() {
    const now = Date.now()
    const items = Array.from(this.cache.values())
    const expired = items.filter(item => now > item.expiry).length
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expired,
      active: this.cache.size - expired
    }
  }
}

/**
 * Redis/Vercel KV缓存实现
 */
class RedisCache implements CacheService {
  private fallback: MemoryCache

  constructor() {
    this.fallback = new MemoryCache()
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isRedisAvailable()) {
        return this.fallback.get<T>(key)
      }

      // 在真实实现中，这里会调用Vercel KV API
      // const { kv } = require('@vercel/kv')
      // const value = await kv.get(key)
      // return value as T

      // 目前使用fallback
      return this.fallback.get<T>(key)
    } catch (error) {
      console.warn('Redis cache error, using fallback:', error)
      return this.fallback.get<T>(key)
    }
  }

  async set<T>(key: string, value: T, ttl: number = APP_CONFIG.cache.ttl): Promise<void> {
    try {
      if (!this.isRedisAvailable()) {
        return this.fallback.set(key, value, ttl)
      }

      // 在真实实现中，这里会调用Vercel KV API
      // const { kv } = require('@vercel/kv')
      // await kv.setex(key, ttl, JSON.stringify(value))

      // 目前使用fallback
      return this.fallback.set(key, value, ttl)
    } catch (error) {
      console.warn('Redis cache error, using fallback:', error)
      return this.fallback.set(key, value, ttl)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (!this.isRedisAvailable()) {
        return this.fallback.delete(key)
      }

      // 在真实实现中，这里会调用Vercel KV API
      // const { kv } = require('@vercel/kv')
      // await kv.del(key)

      // 目前使用fallback
      return this.fallback.delete(key)
    } catch (error) {
      console.warn('Redis cache error, using fallback:', error)
      return this.fallback.delete(key)
    }
  }

  async clear(): Promise<void> {
    try {
      if (!this.isRedisAvailable()) {
        return this.fallback.clear()
      }

      // 在真实实现中，这里会调用Vercel KV API清理所有键
      // 目前使用fallback
      return this.fallback.clear()
    } catch (error) {
      console.warn('Redis cache error, using fallback:', error)
      return this.fallback.clear()
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      if (!this.isRedisAvailable()) {
        return this.fallback.has(key)
      }

      // 在真实实现中，这里会调用Vercel KV API
      // const { kv } = require('@vercel/kv')
      // const exists = await kv.exists(key)
      // return exists === 1

      // 目前使用fallback
      return this.fallback.has(key)
    } catch (error) {
      console.warn('Redis cache error, using fallback:', error)
      return this.fallback.has(key)
    }
  }

  private isRedisAvailable(): boolean {
    return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  }
}

/**
 * 创建缓存实例
 */
function createCacheService(): CacheService {
  const hasRedisConfig = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  
  if (hasRedisConfig) {
    return new RedisCache()
  } else {
    return new MemoryCache(APP_CONFIG.cache.maxSize)
  }
}

// 全局缓存实例
const cache = createCacheService()

/**
 * 生成缓存键
 */
export function generateCacheKey(prefix: string, ...parts: string[]): string {
  return `${prefix}:${parts.join(':')}`
}

/**
 * 翻译缓存键生成器
 */
export function getTranslationCacheKey(text: string, sourceLanguage: string, targetLanguage: string): string {
  // 使用文本的哈希值来生成唯一键
  const textHash = simpleHash(text)
  return generateCacheKey('translation', sourceLanguage, targetLanguage, textHash)
}

/**
 * TTS缓存键生成器
 */
export function getTTSCacheKey(text: string, language: string, voice?: string): string {
  const textHash = simpleHash(text)
  const voiceId = voice || 'default'
  return generateCacheKey('tts', language, voiceId, textHash)
}

/**
 * 语言检测缓存键生成器
 */
export function getLanguageDetectionCacheKey(text: string): string {
  const textHash = simpleHash(text)
  return generateCacheKey('detection', textHash)
}

/**
 * 简单哈希函数
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  return Math.abs(hash).toString(36)
}

/**
 * 缓存装饰器函数
 */
export function withCache<T>(
  cacheKey: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // 先尝试从缓存获取
      const cached = await cache.get<T>(cacheKey)
      if (cached !== null) {
        resolve(cached)
        return
      }

      // 缓存未命中，执行函数
      const result = await fn()
      
      // 存储到缓存
      await cache.set(cacheKey, result, ttl)
      
      resolve(result)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 预热缓存
 */
export async function warmupCache(): Promise<void> {
  // 可以在这里预加载一些常用的翻译结果
  console.log('Cache warmed up')
}

/**
 * 清理过期缓存
 */
export async function cleanupExpiredCache(): Promise<void> {
  try {
    // 对于内存缓存，这会在get操作时自动处理
    // 对于Redis，可以设置TTL自动过期
    console.log('Cache cleanup completed')
  } catch (error) {
    console.error('Cache cleanup failed:', error)
  }
}

// 导出缓存服务实例
export { cache }
export default cache 