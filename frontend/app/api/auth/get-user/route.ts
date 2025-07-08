import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // 使用服务角色客户端绕过RLS
    const supabase = createSupabaseServiceClient()

    // 获取用户基本信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, email_verified, credits, role')
      .eq('id', userId)
      .maybeSingle()

    if (userError) {
      console.error('获取用户数据失败:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch user data', details: userError },
        { status: 500 }
      )
    }

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 获取用户资料
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError) {
      console.warn('获取用户资料失败:', profileError)
    }

    // 构建完整的用户数据
    const completeUserData = {
      id: userData.id,
      email: userData.email,
      name: profileData?.name || 'User',
      emailVerified: userData.email_verified,
      credits: userData.credits,
      role: userData.role,
      profile: profileData ? {
        ...profileData,
        language: profileData.language || 'en',
        timezone: profileData.timezone || 'UTC',
      } : {
        id: '',
        user_id: userId,
        name: 'User',
        avatar_url: null,
        language: 'en',
        timezone: 'UTC',
        notification_preferences: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }

    return NextResponse.json({
      success: true,
      user: completeUserData
    })

  } catch (error) {
    console.error('Get user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
