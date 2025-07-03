import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth, type NextRequestWithUser } from '@/lib/api-utils'
import { getTranslationQueueService } from '@/lib/services/translation-queue'

// 获取任务详情和进度
async function getJobHandler(
  req: NextRequestWithUser,
  { params }: { params: { jobId: string } }
) {
  try {
    const { user } = req.userContext
    const { jobId } = params
    const queueService = getTranslationQueueService()

    // 获取任务详情
    const job = await queueService.getJobDetails(jobId)
    
    if (!job) {
      return NextResponse.json({
        error: 'Translation job not found'
      }, { status: 404 })
    }

    // 验证用户权限
    if (job.user_id !== user.id) {
      return NextResponse.json({
        error: 'Access denied'
      }, { status: 403 })
    }

    // 获取进度信息
    const progress = await queueService.getJobProgress(jobId)

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        jobType: job.job_type,
        status: job.status,
        sourceLanguage: job.source_language,
        targetLanguage: job.target_language,
        progressPercentage: job.progress_percentage,
        totalChunks: job.total_chunks,
        completedChunks: job.completed_chunks,
        failedChunks: job.failed_chunks,
        estimatedCredits: job.estimated_credits,
        consumedCredits: job.consumed_credits,
        refundedCredits: job.refunded_credits,
        createdAt: job.created_at,
        processingStartedAt: job.processing_started_at,
        processingCompletedAt: job.processing_completed_at,
        errorMessage: job.error_message,
        // 只在任务完成时返回结果
        translatedContent: job.status === 'completed' ? job.translated_content : undefined,
        partialResults: job.status === 'partial_success' ? job.partial_results : undefined
      },
      progress
    })

  } catch (error) {
    console.error('Error getting translation job:', error)
    return NextResponse.json({
      error: 'Failed to get translation job'
    }, { status: 500 })
  }
}

// 取消翻译任务
async function cancelJobHandler(
  req: NextRequestWithUser,
  { params }: { params: { jobId: string } }
) {
  try {
    const { user } = req.userContext
    const { jobId } = params
    const queueService = getTranslationQueueService()

    // 验证任务存在和权限
    const job = await queueService.getJobDetails(jobId)
    
    if (!job) {
      return NextResponse.json({
        error: 'Translation job not found'
      }, { status: 404 })
    }

    if (job.user_id !== user.id) {
      return NextResponse.json({
        error: 'Access denied'
      }, { status: 403 })
    }

    // 只能取消待处理或处理中的任务
    if (!['pending', 'processing'].includes(job.status)) {
      return NextResponse.json({
        error: `Cannot cancel job with status: ${job.status}`
      }, { status: 400 })
    }

    // 取消任务
    const success = await queueService.cancelJob(jobId)
    
    if (!success) {
      return NextResponse.json({
        error: 'Failed to cancel translation job'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Translation job cancelled successfully'
    })

  } catch (error) {
    console.error('Error cancelling translation job:', error)
    return NextResponse.json({
      error: 'Failed to cancel translation job'
    }, { status: 500 })
  }
}

// 重试失败的任务
async function retryJobHandler(
  req: NextRequestWithUser,
  { params }: { params: { jobId: string } }
) {
  try {
    const { user } = req.userContext
    const { jobId } = params
    const queueService = getTranslationQueueService()

    // 验证任务存在和权限
    const job = await queueService.getJobDetails(jobId)
    
    if (!job) {
      return NextResponse.json({
        error: 'Translation job not found'
      }, { status: 404 })
    }

    if (job.user_id !== user.id) {
      return NextResponse.json({
        error: 'Access denied'
      }, { status: 403 })
    }

    // 只能重试失败的任务
    if (job.status !== 'failed') {
      return NextResponse.json({
        error: `Cannot retry job with status: ${job.status}`
      }, { status: 400 })
    }

    // 检查重试次数
    if (job.retry_count >= job.max_retries) {
      return NextResponse.json({
        error: 'Maximum retry attempts exceeded'
      }, { status: 400 })
    }

    // 重置任务状态为待处理
    const { error } = await queueService.supabase
      .from('translation_jobs')
      .update({
        status: 'pending',
        error_message: null,
        error_details: null,
        processing_started_at: null,
        processing_completed_at: null,
        worker_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)

    if (error) {
      console.error('Failed to retry job:', error)
      return NextResponse.json({
        error: 'Failed to retry translation job'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Translation job queued for retry'
    })

  } catch (error) {
    console.error('Error retrying translation job:', error)
    return NextResponse.json({
      error: 'Failed to retry translation job'
    }, { status: 500 })
  }
}

// 导出处理函数
export const GET = withApiAuth(getJobHandler)
export const DELETE = withApiAuth(cancelJobHandler)
export const POST = withApiAuth(retryJobHandler) // POST用于重试操作
