/**
 * 服务器端认证工具函数
 */
import { createClient } from '@supabase/supabase-js'

// 这是一个简化的服务角色客户端创建器
// 注意：这不应该在客户端代码中导入
const createServiceRoleClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase service role key is not configured.')
  }

  // 我们在这里不使用 createServerClient，因为它依赖于 cookie store
  // 对于服务角色，我们直接创建客户端
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * 在服务器端（如中间件或API路由）获取用户的角色
 * @param userId 用户的UUID
 * @returns 用户的角色或null
 */
export const getUserRole = async (userId: string): Promise<string | null> => {
  try {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      console.error(`Error fetching user role for ${userId}:`, error.message)
      return null
    }

    return data?.role || null
  } catch (error) {
    console.error('An unexpected error occurred in getUserRole:', error)
    return null
  }
} 