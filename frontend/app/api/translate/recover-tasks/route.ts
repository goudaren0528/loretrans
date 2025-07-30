import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { fixStuckTasks, checkTaskHealth } from '@/lib/services/translation-recovery'

export const dynamic = 'force-dynamic'

/**
 * 修复卡住的翻译任务
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Recover Tasks API] 开始任务恢复')
    
    const cookieStore = cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    
    // 获取用户信息（可选）
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // 如果用户已登录，只修复该用户的任务；否则修复所有任务（管理员功能）
    const userId = user?.id
    
    const result = await fixStuckTasks(userId)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: {
          recoveredTasks: result.recoveredTasks,
          failedTasks: result.failedTasks,
          details: result.details
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('[Recover Tasks API] 异常:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * 检查任务健康状态
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[Task Health API] 检查任务健康状态')
    
    const cookieStore = cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    
    // 获取用户信息（可选）
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    const userId = user?.id
    const healthStatus = await checkTaskHealth(userId)
    
    return NextResponse.json({
      success: true,
      data: {
        ...healthStatus,
        userId: userId || null,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('[Task Health API] 异常:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
