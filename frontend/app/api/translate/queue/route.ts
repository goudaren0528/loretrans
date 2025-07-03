import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth, type NextRequestWithUser } from '@/lib/api-utils'
import { createTranslationJob, getUserTranslationJobs } from '@/lib/services/translation-queue'
import { getLocale, getTranslations } from 'next-intl/server'

// 创建翻译任务
async function createJobHandler(req: NextRequestWithUser) {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'Errors' })

  try {
    const { user } = req.userContext
    const body = await req.json()

    const {
      jobType,
      sourceLanguage,
      targetLanguage,
      originalContent,
      fileInfo,
      priority,
      metadata
    } = body

    // 验证必需参数
    if (!jobType || !sourceLanguage || !targetLanguage) {
      return NextResponse.json({
        error: t('missing_fields', { fields: 'jobType, sourceLanguage, targetLanguage' })
      }, { status: 400 })
    }

    // 验证任务类型
    if (!['text', 'document', 'batch'].includes(jobType)) {
      return NextResponse.json({
        error: 'Invalid job type. Must be one of: text, document, batch'
      }, { status: 400 })
    }

    // 文本任务需要内容
    if (jobType === 'text' && !originalContent) {
      return NextResponse.json({
        error: 'Text jobs require originalContent'
      }, { status: 400 })
    }

    // 文档任务需要文件信息
    if (jobType === 'document' && !fileInfo) {
      return NextResponse.json({
        error: 'Document jobs require fileInfo'
      }, { status: 400 })
    }

    // 创建翻译任务
    const jobId = await createTranslationJob({
      userId: user.id,
      jobType,
      sourceLanguage,
      targetLanguage,
      originalContent,
      fileInfo,
      priority: priority || 5,
      metadata: metadata || {}
    })

    if (!jobId) {
      return NextResponse.json({
        error: 'Failed to create translation job'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Translation job created successfully',
      estimatedProcessingTime: estimateProcessingTime(jobType, originalContent, fileInfo)
    })

  } catch (error) {
    console.error('Error creating translation job:', error)
    return NextResponse.json({
      error: t('unexpected_error', { error: error instanceof Error ? error.message : 'Unknown error' })
    }, { status: 500 })
  }
}

// 获取用户翻译任务
async function getJobsHandler(req: NextRequestWithUser) {
  try {
    const { user } = req.userContext
    const { searchParams } = new URL(req.url)
    
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') as any

    const jobs = await getUserTranslationJobs(user.id, {
      limit: Math.min(limit, 100), // 最多100个
      offset,
      status
    })

    return NextResponse.json({
      success: true,
      jobs,
      pagination: {
        limit,
        offset,
        hasMore: jobs.length === limit
      }
    })

  } catch (error) {
    console.error('Error getting translation jobs:', error)
    return NextResponse.json({
      error: 'Failed to get translation jobs'
    }, { status: 500 })
  }
}

// 估算处理时间
function estimateProcessingTime(
  jobType: string,
  originalContent?: string,
  fileInfo?: any
): number {
  let baseTime = 30 // 基础30秒

  if (jobType === 'text' && originalContent) {
    // 文本翻译：每1000字符约需30秒
    const chunks = Math.ceil(originalContent.length / 1000)
    return baseTime + (chunks * 30)
  } else if (jobType === 'document' && fileInfo) {
    // 文档翻译：根据估算的分块数
    const estimatedChunks = fileInfo.estimated_chunks || 1
    return baseTime + (estimatedChunks * 45)
  }

  return baseTime
}

// 导出处理函数
export const POST = withApiAuth(createJobHandler)
export const GET = withApiAuth(getJobsHandler)
