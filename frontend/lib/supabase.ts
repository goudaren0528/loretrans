import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 环境变量类型检查
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 浏览器端客户端（用于客户端组件）
export const createSupabaseBrowserClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// 服务器端客户端（用于服务器组件和API路由）
export const createSupabaseServerClient = () => {
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // SSR环境中无法设置cookie，忽略错误
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          // SSR环境中无法删除cookie，忽略错误
        }
      },
    },
  })
}

// 通用客户端（用于非React环境）
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          email_verified: boolean
          credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          email_verified?: boolean
          credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          email_verified?: boolean
          credits?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          avatar_url: string | null
          language: string
          timezone: string
          notification_preferences: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          avatar_url?: string | null
          language?: string
          timezone?: string
          notification_preferences?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          avatar_url?: string | null
          language?: string
          timezone?: string
          notification_preferences?: any
          created_at?: string
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          type: 'purchase' | 'consume' | 'reward' | 'refund'
          amount: number
          balance: number
          description: string
          metadata: any | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'purchase' | 'consume' | 'reward' | 'refund'
          amount: number
          balance: number
          description: string
          metadata?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'purchase' | 'consume' | 'reward' | 'refund'
          amount?: number
          balance?: number
          description?: string
          metadata?: any | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          creem_payment_id: string
          creem_session_id: string | null
          amount: number
          credits: number
          status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
          payment_method: string | null
          metadata: any | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          creem_payment_id: string
          creem_session_id?: string | null
          amount: number
          credits: number
          status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
          payment_method?: string | null
          metadata?: any | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          creem_payment_id?: string
          creem_session_id?: string | null
          amount?: number
          credits?: number
          status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
          payment_method?: string | null
          metadata?: any | null
          created_at?: string
          completed_at?: string | null
        }
      }
      user_stats: {
        Row: {
          id: string
          email: string
          credits: number
          created_at: string
          name: string | null
          language: string
          total_consumed: number
          total_purchased: number
          total_payments: number
          total_spent: number
        }
      }
    }
    Views: {
      user_stats: {
        Row: {
          id: string
          email: string
          credits: number
          created_at: string
          name: string | null
          language: string
          total_consumed: number
          total_purchased: number
          total_payments: number
          total_spent: number
        }
      }
    }
    Functions: {
      consume_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_description: string
          p_metadata?: any
        }
        Returns: boolean
      }
      purchase_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_payment_id: string
          p_description?: string
        }
        Returns: boolean
      }
      get_user_credits: {
        Args: {
          p_user_id?: string
        }
        Returns: number
      }
    }
    Enums: {
      transaction_type: 'purchase' | 'consume' | 'reward' | 'refund'
      payment_status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
    }
  }
} 