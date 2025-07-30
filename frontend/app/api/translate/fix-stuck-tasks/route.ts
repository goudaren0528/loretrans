import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('[Fix Stuck Tasks] 开始修复卡住的processing任务')
    
    const cookieStore = cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    
    // 获取用户信息
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 })
    }
    
    // 查找超过30分钟仍在processing状态的任务
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    
    const { data: stuckTasks, error: queryError } = await supabase
      .from('translation_jobs')
      .select('id, created_at, status, job_type, metadata')
      .eq('user_id', user.id)
      .eq('status', 'processing')
      .lt('created_at', thirtyMinutesAgo)
    
    if (queryError) {
      console.error('[Fix Stuck Tasks] 查询失败:', queryError)
      return NextResponse.json({ 
        success: false, 
        error: 'Query failed' 
      }, { status: 500 })
    }
    
    if (!stuckTasks || stuckTasks.length === 0) {
      console.log('[Fix Stuck Tasks] 没有找到卡住的任务')
      return NextResponse.json({ 
        success: true, 
        message: 'No stuck tasks found',
        fixed: 0
      })
    }
    
    console.log(`[Fix Stuck Tasks] 找到 ${stuckTasks.length} 个卡住的任务`)
    
    // 将这些任务标记为失败
    const { error: updateError } = await supabase
      .from('translation_jobs')
      .update({
        status: 'failed',
        error_message: 'Task timed out - automatically marked as failed',
        processing_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .in('id', stuckTasks.map(task => task.id))
    
    if (updateError) {
      console.error('[Fix Stuck Tasks] 更新失败:', updateError)
      return NextResponse.json({ 
        success: false, 
        error: 'Update failed' 
      }, { status: 500 })
    }
    
    console.log(`[Fix Stuck Tasks] 成功修复 ${stuckTasks.length} 个卡住的任务`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Fixed ${stuckTasks.length} stuck tasks`,
      fixed: stuckTasks.length,
      tasks: stuckTasks.map(task => ({
        id: task.id,
        created_at: task.created_at,
        job_type: task.job_type
      }))
    })
    
  } catch (error) {
    console.error('[Fix Stuck Tasks] 异常:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
