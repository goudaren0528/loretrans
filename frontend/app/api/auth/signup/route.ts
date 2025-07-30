import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

interface SignUpRequest {
  email: string
  password: string
  name?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SignUpRequest = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // 使用 Supabase Auth 注册用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || null,
        },
      },
    })

    if (authError) {
      console.error('Signup auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      )
    }

    // 尝试创建用户记录
    try {
      // 调用创建用户记录的API
      const createUserResponse = await fetch(`${request.nextUrl.origin}/api/auth/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authData.user.id,
          email: authData.user.email || email,
          name: name || '',
        }),
      })

      if (!createUserResponse.ok) {
        console.warn('Failed to create user record, but auth was successful')
      }
    } catch (dbError) {
      console.warn('Database error during user creation:', dbError)
      // 不阻止注册流程，因为认证已经成功
    }

    // 返回成功响应
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email || email,
        name: name || 'User',
        emailVerified: authData.user.email_confirmed || false,
        credits: 500, // 默认积分
        role: 'free_user',
      },
      message: 'Account created successfully',
    })

  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
