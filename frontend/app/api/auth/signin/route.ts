import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

interface SignInRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: SignInRequest = await request.json()
    const { email, password, rememberMe } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // 使用 Supabase Auth 登录
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('Signin auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // 处理"记住我"功能
    if (rememberMe) {
      try {
        await supabase.auth.updateUser({
          data: { remember_me: true },
        })
      } catch (updateError) {
        console.warn('Failed to update remember me setting:', updateError)
      }
    }

    // 尝试获取完整用户信息
    let userData = {
      id: authData.user.id,
      email: authData.user.email || email,
      name: authData.user.user_metadata?.name || 'User',
      emailVerified: authData.user.email_confirmed || false,
      credits: 500, // 默认积分
      role: 'free_user' as const,
    }

    try {
      // 尝试从数据库获取用户信息
      const getUserResponse = await fetch(`${request.nextUrl.origin}/api/auth/get-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: authData.user.id }),
      })

      if (getUserResponse.ok) {
        const getUserData = await getUserResponse.json()
        if (getUserData.success && getUserData.user) {
          userData = getUserData.user
        }
      }
    } catch (dbError) {
      console.warn('Failed to fetch user data from database:', dbError)
      // 使用默认用户数据
    }

    // 返回成功响应
    return NextResponse.json({
      success: true,
      user: userData,
      message: 'Signed in successfully',
    })

  } catch (error) {
    console.error('Signin API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
