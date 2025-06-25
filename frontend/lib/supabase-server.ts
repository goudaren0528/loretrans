/**
 * 服务器端专用Supabase客户端工具
 * 用于服务器组件和API路由中使用
 */

import { cookies } from 'next/headers'
import { createSupabaseServerClient } from './supabase'

/**
 * 创建带cookie支持的服务器端客户端
 * 只能在服务器组件和API路由中使用
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createSupabaseServerClient(cookieStore)
}

/**
 * 获取当前用户（服务器端）
 */
export async function getCurrentUser() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}

/**
 * 获取当前会话（服务器端）
 */
export async function getCurrentSession() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Failed to get current session:', error)
    return null
  }
} 