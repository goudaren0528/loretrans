import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'

// 环境变量类型检查
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing Supabase environment variables')
  } else {
    console.warn('Supabase environment variables not configured - using placeholder values for development')
  }
}

// Supabase客户端配置选项
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
    timeout: 60000
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'loretrans-frontend'
    }
  },
  realtime: {
    timeout: 30000,
    heartbeatIntervalMs: 30000
  }
}

// 单例模式的浏览器客户端 - 使用全局变量避免多实例
declare global {
  // eslint-disable-next-line no-var
  var __supabase_browser_client: ReturnType<typeof createBrowserClient> | undefined
}

// 浏览器端客户端（用于客户端组件）- 使用单例模式
export const createSupabaseBrowserClient = () => {
  if (typeof window === 'undefined') {
    // 在服务器端，每次创建新的客户端
    return createBrowserClient(supabaseUrl, supabaseAnonKey, supabaseOptions)
  }
  
  // 使用全局变量确保真正的单例
  if (!globalThis.__supabase_browser_client) {
    try {
      globalThis.__supabase_browser_client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
        ...supabaseOptions,
        auth: {
          ...supabaseOptions.auth,
          storageKey: 'loretrans-auth', // 使用唯一的存储键
        }
      })
      
      // 添加连接错误处理
      globalThis.__supabase_browser_client.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' && session === null) {
          console.log('[Supabase] User signed out')
        }
        if (event === 'TOKEN_REFRESHED') {
          console.log('[Supabase] Token refreshed successfully')
        }
      })
      
    } catch (error) {
      console.error('[Supabase] Failed to create browser client:', error)
      // 创建一个基本的客户端作为后备
      globalThis.__supabase_browser_client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true
        }
      })
    }
  }
  
  return globalThis.__supabase_browser_client
}

// 导出共享的客户端实例
export const supabaseBrowserClient = createSupabaseBrowserClient()

// 服务器端客户端（用于服务器组件和API路由）
export const createSupabaseServerClient = (cookieStore?: any) => {
  if (!cookieStore) {
    // 如果没有传入cookieStore，使用无状态的客户端
    return createClient(supabaseUrl, supabaseAnonKey, supabaseOptions)
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    ...supabaseOptions,
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // SSR环境中无法设置cookie，忽略错误
          console.warn('Failed to set cookie in SSR environment:', error)
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          // SSR环境中无法删除cookie，忽略错误
          console.warn('Failed to remove cookie in SSR environment:', error)
        }
      },
    },
  })
}

// 创建具有服务角色权限的客户端（用于管理操作）
export const createSupabaseServiceClient = () => {
  if (!supabaseServiceKey) {
    throw new Error('Service role key is required for admin operations')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// 导出配置常量
export { supabaseUrl, supabaseAnonKey }
