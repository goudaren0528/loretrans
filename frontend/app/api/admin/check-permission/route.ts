export const dynamic = "force-dynamic";
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
        { error: '需要登录', isAdmin: false },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '无效的认证信息', isAdmin: false },
        { status: 401 }
      )
    }

    // 检查用户是否为管理员
    // 方法1: 检查特定邮箱
    const adminEmails = [
      'admin@loretrans.app',
      'support@loretrans.app',
      // 在这里添加管理员邮箱
    ]
    
    const isAdminByEmail = adminEmails.includes(user.email || '')

    // 方法2: 检查用户角色表（如果有的话）
    let isAdminByRole = false
    try {
      const { data: userRole } = await supabase
        .from('user_profiles')
        .select('metadata')
        .eq('user_id', user.id)
        .single()
      
      if (userRole?.metadata?.role === 'admin') {
        isAdminByRole = true
      }
    } catch (error) {
      // 忽略角色检查错误
      console.log('Role check failed:', error)
    }

    const isAdmin = isAdminByEmail || isAdminByRole

    // 记录管理员访问日志
    if (isAdmin) {
      try {
        await supabase
          .from('admin_access_logs')
          .insert({
            user_id: user.id,
            action: 'permission_check',
            ip_address: request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown',
            user_agent: request.headers.get('user-agent') || 'unknown',
            timestamp: new Date().toISOString()
          })
      } catch (logError) {
        // 忽略日志记录错误
        console.log('Failed to log admin access:', logError)
      }
    }

    return NextResponse.json({
      isAdmin,
      user: {
        id: user.id,
        email: user.email
      }
    })

  } catch (error) {
    console.error('Admin permission check error:', error)
    return NextResponse.json(
      { error: '服务器内部错误', isAdmin: false },
      { status: 500 }
    )
  }
}
