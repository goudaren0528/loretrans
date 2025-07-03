import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

// 临时的模拟注册端点，绕过Supabase Auth
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 }
      )
    }

    console.log('🧪 模拟注册用户:', { email, name })

    // 生成模拟用户ID
    const userId = uuidv4()
    
    // 使用服务角色客户端直接创建用户记录
    const supabase = createSupabaseServiceClient()

    // 1. 创建用户记录
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        email_verified: false,
        credits: 500,
        role: 'free_user'
      })
      .select()
      .single()

    if (userError) {
      console.error('创建用户记录失败:', userError)
      return NextResponse.json(
        { error: 'Failed to create user record', details: userError },
        { status: 500 }
      )
    }

    // 2. 创建用户资料
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        name: name || 'User',
        language: 'en',
        timezone: 'UTC'
      })

    if (profileError) {
      console.warn('创建用户资料失败:', profileError)
    }

    // 3. 创建初始积分记录
    const { error: creditError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        type: 'reward',
        amount: 500,
        balance: 500,
        description: 'Welcome bonus'
      })

    if (creditError) {
      console.warn('创建积分记录失败:', creditError)
    }

    console.log('✅ 模拟用户创建成功:', { userId, email })

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: email,
        name: name || 'User',
        emailVerified: false,
        credits: 500,
        role: 'free_user'
      },
      message: 'Mock user created successfully'
    })

  } catch (error) {
    console.error('Mock signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
