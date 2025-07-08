import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase'

/**
 * 检查邮箱是否已被注册
 * POST /api/auth/check-email
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          available: false,
          error: 'Invalid email format',
          message: '邮箱格式不正确'
        },
        { status: 400 }
      )
    }

    // 使用服务角色客户端绕过RLS
    const supabase = createSupabaseServiceClient()

    // 检查邮箱是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (checkError) {
      console.error('检查邮箱唯一性失败:', checkError)
      return NextResponse.json(
        { error: 'Failed to check email availability', details: checkError },
        { status: 500 }
      )
    }

    // 返回检查结果
    const isAvailable = !existingUser
    
    return NextResponse.json({
      available: isAvailable,
      email: email.toLowerCase(),
      message: isAvailable 
        ? '邮箱可以使用' 
        : '该邮箱已被注册，请使用其他邮箱或尝试登录'
    })

  } catch (error) {
    console.error('Check email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * 获取邮箱建议（可选功能）
 * GET /api/auth/check-email?email=test@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // 简单的邮箱建议逻辑
    const [localPart, domain] = email.split('@')
    const suggestions = []

    // 常见域名建议
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    
    if (domain && !commonDomains.includes(domain.toLowerCase())) {
      // 如果域名不是常见的，提供建议
      const similarDomains = commonDomains.filter(d => 
        d.includes(domain.toLowerCase()) || domain.toLowerCase().includes(d.substring(0, 3))
      )
      
      if (similarDomains.length > 0) {
        suggestions.push(...similarDomains.map(d => `${localPart}@${d}`))
      }
    }

    return NextResponse.json({
      original: email,
      suggestions: suggestions.slice(0, 3) // 最多返回3个建议
    })

  } catch (error) {
    console.error('Email suggestions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
