import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, email, name } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 使用服务角色客户端绕过RLS
    const supabase = createSupabaseServiceClient()

    // 1. 首先检查用户是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, credits, role')
      .eq('id', userId)
      .maybeSingle()

    if (checkError) {
      console.error('检查用户存在性失败:', checkError)
      return NextResponse.json(
        { error: 'Failed to check user existence', details: checkError },
        { status: 500 }
      )
    }

    // 如果用户已存在，返回现有用户信息
    if (existingUser) {
      console.log('用户已存在，返回现有信息:', { userId, email })
      return NextResponse.json({
        success: true,
        user: existingUser,
        message: 'User already exists, returning existing data'
      })
    }

    // 2. 创建用户记录
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        email_verified: false,
        credits: 3000,
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

    // 3. 创建用户资料
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        name: name || '',
        language: 'en',
        timezone: 'UTC'
      })

    if (profileError) {
      console.error('创建用户资料失败:', profileError)
      // 不返回错误，因为用户记录已经创建成功
    }

    // 4. 创建初始积分记录
    const { error: creditError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        type: 'reward',
        amount: 3000,
        balance: 3000,
        description: 'Welcome bonus'
      })

    if (creditError) {
      console.error('创建积分记录失败:', creditError)
      // 不返回错误，因为用户记录已经创建成功
    }

    return NextResponse.json({
      success: true,
      user: userData,
      message: 'User record created successfully'
    })

  } catch (error) {
    console.error('Create user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
