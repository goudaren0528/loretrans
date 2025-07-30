/**
 * 翻译任务恢复服务
 * 
 * 解决长文本翻译任务在后台处理时失败的问题
 */

import { createClient } from '@supabase/supabase-js'

// 创建 Supabase 管理客户端
const createSupabaseAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export interface TaskRecoveryResult {
  success: boolean
  message: string
  recoveredTasks: number
  failedTasks: number
  details?: any[]
}

/**
 * 修复卡住的翻译任务
 */
export async function fixStuckTasks(userId?: string): Promise<TaskRecoveryResult> {
  try {
    console.log('[Task Recovery] 开始修复卡住的任务')
    
    const supabase = createSupabaseAdminClient()
    
    // 查找超过30分钟仍在processing状态的任务
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    
    let query = supabase
      .from('translation_jobs')
      .select('id, user_id, created_at, status, job_type, metadata, original_content')
      .eq('status', 'processing')
      .lt('created_at', thirtyMinutesAgo)
    
    // 如果指定了用户ID，只修复该用户的任务
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    const { data: stuckTasks, error: queryError } = await query
    
    if (queryError) {
      console.error('[Task Recovery] 查询失败:', queryError)
      return {
        success: false,
        message: 'Failed to query stuck tasks',
        recoveredTasks: 0,
        failedTasks: 0
      }
    }
    
    if (!stuckTasks || stuckTasks.length === 0) {
      console.log('[Task Recovery] 没有找到卡住的任务')
      return {
        success: true,
        message: 'No stuck tasks found',
        recoveredTasks: 0,
        failedTasks: 0
      }
    }
    
    console.log(`[Task Recovery] 找到 ${stuckTasks.length} 个卡住的任务`)
    
    // 将这些任务标记为失败
    const { error: updateError } = await supabase
      .from('translation_jobs')
      .update({
        status: 'failed',
        error_message: 'Task timed out - automatically recovered by system',
        processing_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .in('id', stuckTasks.map(task => task.id))
    
    if (updateError) {
      console.error('[Task Recovery] 更新失败:', updateError)
      return {
        success: false,
        message: 'Failed to update stuck tasks',
        recoveredTasks: 0,
        failedTasks: stuckTasks.length
      }
    }
    
    console.log(`[Task Recovery] 成功修复 ${stuckTasks.length} 个卡住的任务`)
    
    return {
      success: true,
      message: `Successfully recovered ${stuckTasks.length} stuck tasks`,
      recoveredTasks: stuckTasks.length,
      failedTasks: 0,
      details: stuckTasks.map(task => ({
        id: task.id,
        created_at: task.created_at,
        job_type: task.job_type,
        content_length: task.original_content?.length || 0
      }))
    }
    
  } catch (error) {
    console.error('[Task Recovery] 异常:', error)
    return {
      success: false,
      message: 'Internal error during task recovery',
      recoveredTasks: 0,
      failedTasks: 0
    }
  }
}

/**
 * 检查任务健康状态
 */
export async function checkTaskHealth(userId?: string): Promise<{
  totalTasks: number
  processingTasks: number
  stuckTasks: number
  recentFailures: number
}> {
  try {
    const supabase = createSupabaseAdminClient()
    
    // 查询最近24小时的任务
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    
    let baseQuery = supabase
      .from('translation_jobs')
      .select('id, status, created_at')
      .gte('created_at', twentyFourHoursAgo)
    
    if (userId) {
      baseQuery = baseQuery.eq('user_id', userId)
    }
    
    const { data: allTasks } = await baseQuery
    
    if (!allTasks) {
      return { totalTasks: 0, processingTasks: 0, stuckTasks: 0, recentFailures: 0 }
    }
    
    const processingTasks = allTasks.filter(task => task.status === 'processing')
    const stuckTasks = processingTasks.filter(task => 
      new Date(task.created_at) < new Date(thirtyMinutesAgo)
    )
    const recentFailures = allTasks.filter(task => 
      task.status === 'failed' && 
      new Date(task.created_at) > new Date(Date.now() - 2 * 60 * 60 * 1000) // 最近2小时
    )
    
    return {
      totalTasks: allTasks.length,
      processingTasks: processingTasks.length,
      stuckTasks: stuckTasks.length,
      recentFailures: recentFailures.length
    }
    
  } catch (error) {
    console.error('[Task Health Check] 异常:', error)
    return { totalTasks: 0, processingTasks: 0, stuckTasks: 0, recentFailures: 0 }
  }
}

/**
 * 自动任务恢复 - 可以定期调用
 */
export async function autoTaskRecovery(): Promise<TaskRecoveryResult> {
  console.log('[Auto Recovery] 开始自动任务恢复')
  
  const result = await fixStuckTasks()
  
  if (result.success && result.recoveredTasks > 0) {
    console.log(`[Auto Recovery] 自动恢复了 ${result.recoveredTasks} 个任务`)
  }
  
  return result
}
