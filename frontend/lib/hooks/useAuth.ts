import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { authService, type AuthUser, type SignUpData, type SignInData } from '../services/auth'

// 检查是否在浏览器环境
const isBrowser = typeof window !== 'undefined'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>
  signIn: (data: SignInData) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

// 创建上下文
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 身份验证状态管理Hook
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// 身份验证Hook实现
export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // 用户注册
  const signUp = useCallback(async (data: SignUpData) => {
    if (!isBrowser) return { success: false, error: 'Not in browser environment' }
    
    setLoading(true)
    try {
      const response = await authService.signUp(data)
      
      if (response.error) {
        return {
          success: false,
          error: response.error.message,
        }
      }

      if (response.data) {
        setUser(response.data)
      }

      return { success: true }
    } catch (error) {
      console.error('Sign up hook error:', error)
      return {
        success: false,
        error: '注册失败，请重试',
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // 用户登录
  const signIn = useCallback(async (data: SignInData) => {
    if (!isBrowser) return { success: false, error: 'Not in browser environment' }
    
    setLoading(true)
    try {
      const response = await authService.signIn(data)
      
      if (response.error) {
        return {
          success: false,
          error: response.error.message,
        }
      }

      if (response.data) {
        setUser(response.data)
      }

      return { success: true }
    } catch (error) {
      console.error('Sign in hook error:', error)
      return {
        success: false,
        error: '登录失败，请重试',
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // 用户登出
  const signOut = useCallback(async () => {
    if (!isBrowser) return
    
    setLoading(true)
    try {
      await authService.signOut()
      setUser(null)
    } catch (error) {
      console.error('Sign out hook error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 刷新用户信息
  const refreshUser = useCallback(async () => {
    if (!isBrowser) return
    
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Refresh user hook error:', error)
      setUser(null)
    }
  }, [])

  // 初始化和监听身份验证状态变化
  useEffect(() => {
    if (!isBrowser) {
      setLoading(false)
      return
    }

    let mounted = true

    // 获取初始用户状态
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        if (mounted) {
          setUser(currentUser)
          setLoading(false)
        }
      } catch (error) {
        console.error('Initialize auth error:', error)
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    // 监听身份验证状态变化
    const { data: { subscription } } = authService.onAuthStateChange((authUser) => {
      if (mounted) {
        setUser(authUser)
        setLoading(false)
      }
    })

    initializeAuth()

    // 清理函数
    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser,
    isAuthenticated: !!user,
  }
}

// 用户权限检查Hook
export function useRequireAuth() {
  const { user, loading } = useAuth()
  
  return {
    user,
    loading,
    isAuthenticated: !!user,
    isGuest: !user && !loading,
  }
}

// 用户角色检查Hook
export function useUserRole() {
  const { user } = useAuth()
  
  const isGuest = !user
  const isRegistered = !!user
  const isPaidUser = user && user.credits > 0
  
  return {
    isGuest,
    isRegistered,
    isPaidUser,
    userType: isGuest ? 'guest' : isPaidUser ? 'paid' : 'free',
  }
}

// 积分相关Hook
// 添加全局调试变量
if (typeof window !== 'undefined') {
  window.__CREDITS_DEBUG__ = {
    credits: 0,
    isLoading: false,
    lastUpdate: null
  }
}

export function useCredits() {
  const { user, refreshUser } = useAuth()
  const [credits, setCredits] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  // 直接从数据库获取积分
  const fetchCredits = useCallback(async () => {
    if (!user?.id) {
      setCredits(0)
      return 0
    }
    
    setIsLoading(true)
    try {
      const { createSupabaseBrowserClient } = await import('@/lib/supabase')
      const supabase = createSupabaseBrowserClient()
      
      console.log('[useCredits] Fetching credits for user:', { userId: user.id, email: user.email })
      
      // 查询users表的credits字段
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single()
      
      if (userError) {
        console.error('查询用户积分失败:', userError)
        // 如果查询失败，记录错误但不创建记录
        console.error('[useCredits] 用户积分记录不存在，请确保用户已正确注册')
        setCredits(0)
        return 0
      } else if (userData) {
        setCredits(userData.credits)
        // 更新调试信息
        if (typeof window !== 'undefined') {
          window.__CREDITS_DEBUG__ = {
            credits: userData.credits,
            isLoading: false,
            lastUpdate: new Date().toISOString()
          }
        }
        console.log('[useCredits] 查询到用户积分:', userData.credits)
        return userData.credits
      } else {
        setCredits(0)
        return 0
      }
    } catch (error) {
      console.error('[useCredits] 积分查询异常:', error)
      setCredits(0)
      return 0
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])
  
  // 用户变化时重新获取积分
  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])
  
  const hasCredits = credits > 0
  
  // 检查是否有足够积分
  const hasEnoughCredits = useCallback((required: number) => {
    return credits >= required
  }, [credits])
  
  // 预估积分消耗 - 更新为1000字符免费
  const estimateCredits = useCallback((textLength: number) => {
    const freeLimit = 1000 // 1000字符免费
    if (textLength <= freeLimit) {
      return 0
    }
    return Math.ceil((textLength - freeLimit) * 0.1) // 超出部分0.1积分/字符
  }, [])
  
  // 直接更新积分状态（用于立即反馈）
  const updateCredits = useCallback((newCredits: number) => {
    console.log('[useCredits] 准备更新积分状态:', { to: newCredits });
    setCredits(prevCredits => {
      console.log('[useCredits] 积分状态更新:', { from: prevCredits, to: newCredits });
      return newCredits;
    });
    
    // 更新调试信息
    if (typeof window !== 'undefined') {
      window.__CREDITS_DEBUG__ = {
        credits: newCredits,
        isLoading: false,
        lastUpdate: new Date().toISOString(),
        updateType: 'direct'
      }
    }
    
    console.log('[useCredits] 积分状态更新完成:', newCredits);
  }, []); // 移除 credits 依赖，避免闭包问题
  
  return {
    credits,
    hasCredits,
    hasEnoughCredits,
    estimateCredits,
    isLoading,
    refreshCredits: fetchCredits, // 使用新的获取函数
    updateCredits, // 直接更新积分状态
  }
} 