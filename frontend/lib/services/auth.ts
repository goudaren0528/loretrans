import { createSupabaseBrowserClient, createSupabaseServerClient } from '../supabase'
import type { Database } from '../supabase'
import { userService } from './user'
import { creditService } from './credits'

export type User = Database['public']['Tables']['users']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export interface AuthUser {
  id: string
  email: string
  name: string
  emailVerified: boolean
  credits: number
  profile?: UserProfile
}

export interface SignUpData {
  email: string
  password: string
  name?: string
}

export interface SignInData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthError {
  message: string
  code?: string
}

export interface AuthResponse<T = any> {
  data: T | null
  error: AuthError | null
}

class AuthService {
  private supabase: ReturnType<typeof createSupabaseBrowserClient>
  private isConfigured: boolean

  constructor() {
    this.supabase = createSupabaseBrowserClient()
    this.isConfigured = this.checkSupabaseConfig()
  }

  private checkSupabaseConfig(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    return !!(url && key && !url.includes('placeholder') && key !== 'placeholder-anon-key')
  }

  /**
   * 用户注册
   */
  async signUp({ email, password, name }: SignUpData): Promise<AuthResponse<AuthUser>> {
    if (!this.isConfigured) {
      return {
        data: null,
        error: {
          message: '身份验证服务暂未配置',
        },
      }
    }

    try {
      // 1. 使用 Supabase Auth 注册用户
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || null,
          },
        },
      })

      if (authError) {
        return {
          data: null,
          error: {
            message: this.getErrorMessage(authError.message),
            code: authError.message,
          },
        }
      }

      if (!authData.user) {
        return {
          data: null,
          error: {
            message: '注册失败，请重试',
          },
        }
      }

      // 2. 创建用户记录和用户资料
      await this.createUserRecord(authData.user.id, email, name)

      // 3. 获取完整用户信息
      const userData = await this.getUserData(authData.user.id)

      return {
        data: userData,
        error: null,
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return {
        data: null,
        error: {
          message: '注册过程中发生错误，请重试',
        },
      }
    }
  }

  /**
   * 用户登录
   */
  async signIn({ email, password, rememberMe }: SignInData): Promise<AuthResponse<AuthUser>> {
    if (!this.isConfigured) {
      return {
        data: null,
        error: {
          message: '身份验证服务暂未配置',
        },
      }
    }

    try {
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        return {
          data: null,
          error: {
            message: this.getErrorMessage(authError.message),
            code: authError.message,
          },
        }
      }

      if (!authData.user) {
        return {
          data: null,
          error: {
            message: '登录失败，请检查邮箱和密码',
          },
        }
      }

      // 获取完整用户信息
      const userData = await this.getUserData(authData.user.id)

      // 处理"记住我"功能（通过Session持久化）
      if (rememberMe) {
        await this.supabase.auth.updateUser({
          data: { remember_me: true },
        })
      }

      return {
        data: userData,
        error: null,
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        data: null,
        error: {
          message: '登录过程中发生错误，请重试',
        },
      }
    }
  }

  /**
   * 用户登出
   */
  async signOut(): Promise<AuthResponse<void>> {
    try {
      const { error } = await this.supabase.auth.signOut()

      if (error) {
        return {
          data: null,
          error: {
            message: '登出失败，请重试',
            code: error.message,
          },
        }
      }

      return {
        data: null,
        error: null,
      }
    } catch (error) {
      console.error('Sign out error:', error)
      return {
        data: null,
        error: {
          message: '登出过程中发生错误',
        },
      }
    }
  }

  /**
   * 获取当前用户
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    if (!this.isConfigured) {
      return null
    }

    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return null
      }

      return await this.getUserData(user.id)
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  /**
   * 获取当前会话
   */
  async getSession() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession()
      return session
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  }

  /**
   * 刷新会话
   */
  async refreshSession() {
    try {
      const { data, error } = await this.supabase.auth.refreshSession()
      
      if (error) {
        console.error('Refresh session error:', error)
        return null
      }

      return data.session
    } catch (error) {
      console.error('Refresh session error:', error)
      return null
    }
  }

  /**
   * 监听身份验证状态变化
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userData = await this.getUserData(session.user.id)
        callback(userData)
      } else {
        callback(null)
      }
    })
  }

  /**
   * 创建用户记录和资料（现在由数据库触发器自动处理）
   */
  private async createUserRecord(userId: string, email: string, name?: string) {
    try {
      // 注意：用户记录创建现在由数据库触发器自动处理
      // 这里我们只需要确认用户记录存在
      const user = await userService.getUserById(userId)
      
      if (!user) {
        console.warn('用户记录未找到，可能触发器执行失败')
        return
      }

      // 如果提供了姓名，更新用户资料
      if (name) {
        await userService.updateUserProfile(userId, { name })
      }

      console.log('用户记录创建成功:', { userId, email, credits: user.credits })
    } catch (error) {
      console.error('Create user record error:', error)
    }
  }

  /**
   * 获取完整用户数据（使用新的数据服务）
   */
  private async getUserData(userId: string): Promise<AuthUser | null> {
    try {
      const user = await userService.getUserById(userId);
      if (!user) return null;

      const profile = await userService.getUserProfile(userId);
      if (!profile) return null;

      return {
        id: user.id,
        email: user.email,
        name: profile.name || 'User',
        emailVerified: user.email_verified,
        credits: user.credits,
        profile: {
          ...profile,
          language: profile.language || 'en',
          timezone: profile.timezone || 'UTC',
        },
      };
    } catch (error) {
      console.error('Get user data error:', error);
      return null;
    }
  }

  /**
   * 获取用户友好的错误信息
   */
  private getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'User already registered': '该邮箱已被注册',
      'Invalid login credentials': '邮箱或密码错误',
      'Email not confirmed': '请先验证您的邮箱',
      'Password should be at least 6 characters': '密码至少需要6位字符',
      'Invalid email': '邮箱格式不正确',
      'Signup requires a valid password': '请输入有效密码',
      'Email rate limit exceeded': '邮件发送频率过高，请稍后重试',
    }

    return errorMessages[errorCode] || '操作失败，请重试'
  }
}

// 导出单例实例
export const authService = new AuthService()

// 服务器端验证函数
export async function verifyServerAuth(userId?: string) {
  if (!userId) {
    return null
  }

  try {
    const supabase = createSupabaseServerClient()
    
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        user_profiles (*)
      `)
      .eq('id', userId)
      .single()

    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.email_verified,
      credits: user.credits,
      profile: user.user_profiles?.[0] || undefined,
    } as AuthUser
  } catch (error) {
    console.error('Server auth verification error:', error)
    return null
  }
} 