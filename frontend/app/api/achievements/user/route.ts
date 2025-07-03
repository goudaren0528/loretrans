import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // 创建Supabase客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 获取用户信息
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '需要登录' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '无效的认证信息' },
        { status: 401 }
      )
    }

    // 获取用户成就进度
    const { data: achievements, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: '获取成就数据失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      achievements: achievements || [],
      userId: user.id
    })

  } catch (error) {
    console.error('User achievements API error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
