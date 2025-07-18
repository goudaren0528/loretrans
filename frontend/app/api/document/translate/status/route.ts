import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth, type NextRequestWithUser } from '@/lib/api-utils'

// 查询文档翻译任务状态
async function handleGetStatus(request: NextRequestWithUser) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    
    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: '缺少任务ID',
        code: 'MISSING_JOB_ID'
      }, { status: 400 })
    }
    
    // 获取翻译队列
    const translationQueue = (global as any).translationQueue || new Map()
    const job = translationQueue.get(jobId)
    
    if (!job) {
      console.log(`[Document Status] 任务不存在: ${jobId}, 当前队列中有 ${translationQueue.size} 个任务`)
      
      return NextResponse.json({
        success: false,
        error: '任务不存在或已过期',
        code: 'JOB_NOT_FOUND',
        suggestion: '任务可能已完成并被清理，或者服务已重启。请重新提交翻译请求。'
      }, { status: 404 })
    }
    
    // 添加调试日志
    console.log(`[Document Status] 查询任务状态: ${jobId}`, {
      status: job.status,
      progress: job.progress,
      hasResult: !!job.result,
      resultLength: job.result?.length || 0,
      type: job.type
    })
    
    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        type: job.type,
        fileId: job.fileId,
        status: job.status,
        progress: job.progress,
        result: job.result,
        error: job.error,
        totalChunks: job.chunks?.length || 0,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      }
    })
    
  } catch (error) {
    console.error('[Document Status] 查询任务状态失败:', error)
    return NextResponse.json({
      success: false,
      error: '查询任务状态失败',
      code: 'QUERY_ERROR'
    }, { status: 500 })
  }
}

// 完成文档翻译任务（扣除积分）
async function handleCompleteTask(request: NextRequestWithUser) {
  try {
    const { user, role } = request.userContext

    if (!user) {
      return NextResponse.json({
        success: false,
        error: '需要登录账户',
        code: 'UNAUTHORIZED'
      }, { status: 401 })
    }

    const { jobId } = await request.json()
    
    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: '缺少任务ID',
        code: 'MISSING_JOB_ID'
      }, { status: 400 })
    }
    
    // 获取翻译队列
    const translationQueue = (global as any).translationQueue || new Map()
    const job = translationQueue.get(jobId)
    
    if (!job || job.status !== 'completed') {
      return NextResponse.json({
        success: false,
        error: '任务不存在或未完成',
        code: 'JOB_NOT_READY'
      }, { status: 400 })
    }
    
    // 计算积分消耗
    const characterCount = job.text?.length || 0
    const creditsRequired = Math.ceil(characterCount / 100) // 每100字符1积分
    
    // 扣除积分
    if (creditsRequired > 0) {
      try {
        const { createClient } = require('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )
        
        // 获取用户当前积分
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single()
        
        if (userError || !userData) {
          console.error('[Document Complete] 获取用户积分失败:', userError)
          return NextResponse.json({
            success: false,
            error: '获取用户积分失败',
            code: 'USER_CREDITS_ERROR'
          }, { status: 500 })
        }
        
        const currentCredits = userData.credits || 0
        
        if (currentCredits < creditsRequired) {
          return NextResponse.json({
            success: false,
            error: `积分不足，需要 ${creditsRequired} 积分，当前余额 ${currentCredits} 积分`,
            code: 'INSUFFICIENT_CREDITS',
            required: creditsRequired,
            available: currentCredits
          }, { status: 402 })
        }
        
        // 扣除积分
        const { error: deductError } = await supabase
          .from('users')
          .update({ credits: currentCredits - creditsRequired })
          .eq('id', user.id)
        
        if (deductError) {
          console.error('[Document Complete] 扣除积分失败:', deductError)
          return NextResponse.json({
            success: false,
            error: '扣除积分失败',
            code: 'DEDUCT_CREDITS_ERROR'
          }, { status: 500 })
        }
        
      } catch (error) {
        console.error('[Document Complete] 积分处理异常:', error)
        return NextResponse.json({
          success: false,
          error: '积分处理异常',
          code: 'CREDITS_EXCEPTION'
        }, { status: 500 })
      }
    }
    
    // 标记任务为已完成并清理
    translationQueue.delete(jobId)
    
    return NextResponse.json({
      success: true,
      message: '任务完成，积分已扣除',
      creditsUsed: creditsRequired,
      translatedText: job.result,
      originalLength: characterCount,
      translatedLength: job.result?.length || 0
    })
    
  } catch (error) {
    console.error('[Document Complete] 完成任务失败:', error)
    return NextResponse.json({
      success: false,
      error: '完成任务失败',
      code: 'COMPLETE_ERROR'
    }, { status: 500 })
  }
}

export const GET = withApiAuth(handleGetStatus)
export const POST = withApiAuth(handleCompleteTask)
