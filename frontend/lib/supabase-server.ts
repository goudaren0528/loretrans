/**
 * 服务器端专用Supabase客户端工具
 * 用于服务器组件和API路由中使用
 */

import { cookies } from 'next/headers'
import { createSupabaseServerClient, createSupabaseServiceClient } from './supabase'

/**
 * 创建带cookie支持的服务器端客户端
 * 只能在服务器组件和API路由中使用
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createSupabaseServerClient(cookieStore)
}

/**
 * 为了兼容性，也导出为 createClient
 */
export const createClient = createServerSupabaseClient

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

/**
 * 创建一个具有服务角色的Supabase客户端
 * 这个客户端会绕过所有RLS策略，只能在绝对需要时在服务器端使用
 * (例如，在webhook处理器中)
 */
export function createServiceRoleClient() {
  return createSupabaseServiceClient();
} 