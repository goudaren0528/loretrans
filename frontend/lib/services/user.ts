import { createSupabaseBrowserClient, createSupabaseServerClient } from '../supabase'
import type { 
  User, 
  UserProfile, 
  CreateUserData, 
  UpdateUserProfileData,
  NotificationPreferences,
  UserStats 
} from '../../../shared/types'
import type { SupabaseClient } from '@supabase/supabase-js'

const ENCRYPTION_KEY_ID = process.env.NEXT_PUBLIC_SUPABASE_ENCRYPTION_KEY_ID

export class UserService {
  private supabase: ReturnType<typeof createSupabaseBrowserClient>

  constructor(useServerClient = false) {
    this.supabase = useServerClient 
      ? createSupabaseServerClient() 
      : createSupabaseBrowserClient()
  }

  // ===============================
  // 用户基本信息操作
  // ===============================

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: authUser } = await this.supabase.auth.getUser()
      if (!authUser.user) return null

      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', authUser.user.id)
        .single()

      if (error) {
        console.error('获取用户信息失败:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('获取当前用户失败:', error)
      return null
    }
  }

  /**
   * 根据ID获取用户信息
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('获取用户信息失败:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('获取用户失败:', error)
      return null
    }
  }

  /**
   * 更新用户基本信息
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('更新用户信息失败:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('更新用户失败:', error)
      return null
    }
  }

  // ===============================
  // 用户资料操作
  // ===============================

  /**
   * 获取用户资料
   */
  async getUserProfile(userId?: string): Promise<UserProfile | null> {
    try {
      let targetUserId = userId
      if (!targetUserId) {
        const { data: authUser } = await this.supabase.auth.getUser()
        if (!authUser.user) return null
        targetUserId = authUser.user.id
      }

      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single()

      if (error) {
        console.error('获取用户资料失败:', error)
        return null
      }

      // 如果存在加密数据，则进行解密
      if (data?.encrypted_metadata && ENCRYPTION_KEY_ID) {
        const { data: decrypted, error: decryptError } = await this.supabase
          .rpc('decrypt_secret', { 
            p_encrypted_secret: data.encrypted_metadata,
            p_key_id: ENCRYPTION_KEY_ID 
          })
        
        if (decryptError) {
          console.error('解密用户敏感数据失败:', decryptError)
        } else {
          data.sensitive_metadata = JSON.parse(decrypted || '{}')
        }
      }

      return data
    } catch (error) {
      console.error('获取用户资料失败:', error)
      return null
    }
  }

  /**
   * 更新用户资料
   */
  async updateUserProfile(userId: string, profileData: UpdateUserProfileData): Promise<UserProfile | null> {
    try {
      if (profileData.sensitive_metadata && !ENCRYPTION_KEY_ID) {
        throw new Error('加密密钥未配置，无法更新敏感数据')
      }

      let encryptedData = null
      // 如果有敏感数据，则加密
      if (profileData.sensitive_metadata && ENCRYPTION_KEY_ID) {
        const { data: encrypted, error: encryptError } = await this.supabase
          .rpc('encrypt_secret', { 
            p_secret: JSON.stringify(profileData.sensitive_metadata),
            p_key_id: ENCRYPTION_KEY_ID
          })
        
        if (encryptError) {
          console.error('加密用户敏感数据失败:', encryptError)
          throw new Error('加密敏感数据失败')
        }
        encryptedData = encrypted
      }

      // 从更新数据中移除敏感数据，因为它已单独处理
      const { sensitive_metadata, ...restProfileData } = profileData
      
      const updatePayload: Partial<UserProfile> = {
        ...restProfileData,
        updated_at: new Date().toISOString(),
      }

      if (encryptedData) {
        updatePayload.encrypted_metadata = encryptedData
      }

      const { data, error } = await this.supabase
        .from('user_profiles')
        .update(updatePayload as any)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error(`更新用户资料失败:`, error)
        throw new Error('更新用户资料失败，请稍后重试')
      }

      return data
    } catch (error) {
      console.error(`更新用户资料时发生意外错误:`, error)
      return null
    }
  }

  /**
   * 创建或更新用户资料
   */
  async upsertUserProfile(userId: string, profileData: UpdateUserProfileData): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('创建或更新用户资料失败:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('创建或更新用户资料失败:', error)
      return null
    }
  }

  // ===============================
  // 通知偏好设置
  // ===============================

  /**
   * 更新通知偏好
   */
  async updateNotificationPreferences(
    userId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<UserProfile | null> {
    try {
      // 先获取当前的通知偏好
      const currentProfile = await this.getUserProfile(userId)
      if (!currentProfile) return null

      const updatedPreferences = {
        ...currentProfile.notification_preferences,
        ...preferences
      }

      return this.updateUserProfile(userId, {
        notification_preferences: updatedPreferences
      })
    } catch (error) {
      console.error('更新通知偏好失败:', error)
      return null
    }
  }

  // ===============================
  // 用户统计数据
  // ===============================

  /**
   * 获取用户统计数据
   */
  async getUserStats(userId?: string): Promise<UserStats | null> {
    try {
      let targetUserId = userId
      if (!targetUserId) {
        const { data: authUser } = await this.supabase.auth.getUser()
        if (!authUser.user) return null
        targetUserId = authUser.user.id
      }

      const { data, error } = await this.supabase
        .from('user_stats')
        .select('*')
        .eq('id', targetUserId)
        .single()

      if (error) {
        console.error('获取用户统计失败:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('获取用户统计失败:', error)
      return null
    }
  }

  // ===============================
  // 用户完整信息
  // ===============================

  /**
   * 获取用户完整信息（包括资料）
   */
  async getUserWithProfile(userId?: string): Promise<{
    user: User;
    profile: UserProfile;
  } | null> {
    try {
      let targetUserId = userId
      if (!targetUserId) {
        const { data: authUser } = await this.supabase.auth.getUser()
        if (!authUser.user) return null
        targetUserId = authUser.user.id
      }

      // 并行获取用户信息和资料
      const [user, profile] = await Promise.all([
        this.getUserById(targetUserId),
        this.getUserProfile(targetUserId)
      ])

      if (!user || !profile) return null

      return { user, profile }
    } catch (error) {
      console.error('获取用户完整信息失败:', error)
      return null
    }
  }

  // ===============================
  // 用户验证状态
  // ===============================

  /**
   * 更新邮箱验证状态
   */
  async updateEmailVerificationStatus(userId: string, verified: boolean): Promise<User | null> {
    try {
      return this.updateUser(userId, { email_verified: verified })
    } catch (error) {
      console.error('更新邮箱验证状态失败:', error)
      return null
    }
  }

  /**
   * 检查邮箱是否已验证
   */
  async isEmailVerified(userId?: string): Promise<boolean> {
    try {
      const user = userId ? await this.getUserById(userId) : await this.getCurrentUser()
      return user?.email_verified ?? false
    } catch (error) {
      console.error('检查邮箱验证状态失败:', error)
      return false
    }
  }

  // ===============================
  // 实时订阅
  // ===============================

  /**
   * 订阅用户数据变化
   */
  subscribeToUserChanges(userId: string, callback: (user: User) => void) {
    return this.supabase
      .channel(`user-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`
      }, (payload) => {
        if (payload.new) {
          callback(payload.new as User)
        }
      })
      .subscribe()
  }

  /**
   * 订阅用户资料变化
   */
  subscribeToProfileChanges(userId: string, callback: (profile: UserProfile) => void) {
    return this.supabase
      .channel(`profile-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_profiles',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        if (payload.new) {
          callback(payload.new as UserProfile)
        }
      })
      .subscribe()
  }
}

// 默认导出实例
export const userService = new UserService()

// 服务端使用的实例
export const createServerUserService = () => new UserService(true) 