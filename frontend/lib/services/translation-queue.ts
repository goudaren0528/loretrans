/**
 * 异步翻译队列服务
 * 支持长文本和文档翻译的后台处理，用户可以离开页面后继续处理
 */

import { createSupabaseBrowserClient, createSupabaseServerClient } from '../supabase'
// import translation-resilience disabled
import { createServerCreditService } from './credits'
import { logTranslationRequest, logSystemError } from './audit'

// 翻译任务状态
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'partial_success'

// 翻译任务类型
export type JobType = 'text' | 'document' | 'batch'

// 翻译任务接口
export interface TranslationJob {
  id: string
  user_id: string
  job_type: JobType
  status: JobStatus
  priority: number
  source_language: string
  target_language: string
  original_content?: string
  file_info?: Record<string, any>
  content_chunks: ContentChunk[]
  translated_content?: string
  translated_chunks: TranslatedChunk[]
  partial_results?: Record<string, any>
  total_chunks: number
  completed_chunks: number
  failed_chunks: number
  progress_percentage: number
  estimated_credits: number
  consumed_credits: number
  refunded_credits: number
  credit_transaction_ids: string[]
  processing_started_at?: string
  processing_completed_at?: string
  processing_time_ms?: number
  worker_id?: string
  retry_count: number
  max_retries: number
  error_message?: string
  error_details?: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  expires_at: string
}

// 内容分块
export interface ContentChunk {
  chunk_id: number
  content: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  estimated_credits?: number
}

// 翻译结果分块
export interface TranslatedChunk {
  chunk_id: number
  result: string
  completed_at: string
  credits_consumed?: number
  processing_time?: number
}

// 任务创建参数
export interface CreateJobParams {
  userId: string
  jobType: JobType
  sourceLanguage: string
  targetLanguage: string
  originalContent?: string
  fileInfo?: Record<string, any>
  priority?: number
  metadata?: Record<string, any>
}

// 任务进度更新
export interface JobProgress {
  jobId: string
  totalChunks: number
  completedChunks: number
  failedChunks: number
  progressPercentage: number
  status: JobStatus
  estimatedTimeRemaining?: number
  currentChunk?: {
    chunkId: number
    content: string
    status: string
  }
}

class TranslationQueueService {
  private supabase: ReturnType<typeof createSupabaseBrowserClient>
  private isWorkerRunning = false
  private workerInterval?: NodeJS.Timeout
  private workerId: string

  constructor(useServerClient = false) {
    this.supabase = useServerClient 
      ? createSupabaseServerClient() 
      : createSupabaseBrowserClient()
    this.workerId = `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 创建翻译任务
   */
  async createJob(params: CreateJobParams): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .rpc('create_translation_job', {
          p_user_id: params.userId,
          p_job_type: params.jobType,
          p_source_language: params.sourceLanguage,
          p_target_language: params.targetLanguage,
          p_original_content: params.originalContent || null,
          p_file_info: params.fileInfo || null,
          p_priority: params.priority || 5,
          p_metadata: params.metadata || {}
        })

      if (error) {
        console.error('Failed to create translation job:', error)
        return null
      }

      console.log(`Created translation job: ${data}`)
      return data as string
    } catch (error) {
      console.error('Error creating translation job:', error)
      return null
    }
  }

  /**
   * 获取用户的翻译任务
   */
  async getUserJobs(
    userId: string,
    options?: {
      limit?: number
      offset?: number
      status?: JobStatus
    }
  ): Promise<TranslationJob[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_user_translation_jobs', {
          p_user_id: userId,
          p_limit: options?.limit || 20,
          p_offset: options?.offset || 0,
          p_status: options?.status || null
        })

      if (error) {
        console.error('Failed to get user translation jobs:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error getting user translation jobs:', error)
      return []
    }
  }

  /**
   * 获取任务详情
   */
  async getJobDetails(jobId: string): Promise<TranslationJob | null> {
    try {
      const { data, error } = await this.supabase
        .from('translation_jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (error) {
        console.error('Failed to get job details:', error)
        return null
      }

      return data as TranslationJob
    } catch (error) {
      console.error('Error getting job details:', error)
      return null
    }
  }

  /**
   * 取消翻译任务
   */
  async cancelJob(jobId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('translation_jobs')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .in('status', ['pending', 'processing'])

      if (error) {
        console.error('Failed to cancel job:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error cancelling job:', error)
      return false
    }
  }

  /**
   * 获取任务进度
   */
  async getJobProgress(jobId: string): Promise<JobProgress | null> {
    try {
      const job = await this.getJobDetails(jobId)
      if (!job) return null

      // 估算剩余时间
      let estimatedTimeRemaining: number | undefined
      if (job.status === 'processing' && job.processing_started_at) {
        const elapsedTime = Date.now() - new Date(job.processing_started_at).getTime()
        const avgTimePerChunk = elapsedTime / Math.max(job.completed_chunks, 1)
        const remainingChunks = job.total_chunks - job.completed_chunks
        estimatedTimeRemaining = Math.ceil(avgTimePerChunk * remainingChunks / 1000) // 秒
      }

      return {
        jobId: job.id,
        totalChunks: job.total_chunks,
        completedChunks: job.completed_chunks,
        failedChunks: job.failed_chunks,
        progressPercentage: job.progress_percentage,
        status: job.status,
        estimatedTimeRemaining
      }
    } catch (error) {
      console.error('Error getting job progress:', error)
      return null
    }
  }

  /**
   * 启动翻译工作器
   */
  startWorker(intervalMs: number = 5000) {
    if (this.isWorkerRunning) {
      console.warn('Translation worker is already running')
      return
    }

    this.isWorkerRunning = true
    console.log(`Starting translation worker: ${this.workerId}`)

    this.workerInterval = setInterval(async () => {
      await this.processNextJob()
    }, intervalMs)
  }

  /**
   * 停止翻译工作器
   */
  stopWorker() {
    if (this.workerInterval) {
      clearInterval(this.workerInterval)
      this.workerInterval = undefined
    }
    this.isWorkerRunning = false
    console.log(`Stopped translation worker: ${this.workerId}`)
  }

  /**
   * 处理下一个翻译任务
   */
  private async processNextJob(): Promise<void> {
    try {
      // 获取下一个待处理任务
      const { data, error } = await this.supabase
        .rpc('get_next_translation_job', {
          p_worker_id: this.workerId
        })

      if (error || !data || data.length === 0) {
        return // 没有待处理任务
      }

      const job = data[0]
      console.log(`Processing job: ${job.job_id}`)

      await this.processJob(job)
    } catch (error) {
      console.error('Error in worker processing:', error)
      await logSystemError(
        'translation_worker_error',
        error instanceof Error ? error.message : 'Unknown worker error',
        error instanceof Error ? error.stack : undefined,
        undefined,
        { worker_id: this.workerId }
      )
    }
  }

  /**
   * 处理单个翻译任务
   */
  private async processJob(job: any): Promise<void> {
    const creditService = createServerCreditService()
    let totalCreditsConsumed = 0
    const transactionIds: string[] = []

    try {
      const chunks = job.content_chunks as ContentChunk[]
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        
        try {
          // 计算该分块需要的积分
          const chunkCredits = Math.max(0, Math.ceil((chunk.content.length - 500) * 0.1))
          
          // 消耗积分（如果需要）
          let transactionId: string | undefined
          if (chunkCredits > 0) {
            const creditResult = await creditService.consumeCreditsAtomic(
              job.user_id,
              chunk.content.length,
              job.source_language,
              job.target_language,
              job.job_type
            )

            if (!creditResult.success) {
              throw new Error(`Credit consumption failed: ${creditResult.error}`)
            }

            transactionId = creditResult.transaction_id
            totalCreditsConsumed += chunkCredits
            if (transactionId) transactionIds.push(transactionId)
          }

          // 执行翻译
          const translationResult = await translateWithResilience(
            chunk.content,
            job.source_language,
            job.target_language
          )

          // 更新任务进度
          await this.supabase.rpc('update_job_progress', {
            p_job_id: job.job_id,
            p_chunk_id: chunk.chunk_id,
            p_chunk_result: translationResult.translatedText,
            p_credits_consumed: chunkCredits,
            p_transaction_id: transactionId || null
          })

          console.log(`Completed chunk ${chunk.chunk_id + 1}/${chunks.length} for job ${job.job_id}`)

        } catch (chunkError) {
          console.error(`Failed to process chunk ${chunk.chunk_id}:`, chunkError)
          
          // 记录分块失败，但继续处理其他分块
          await this.supabase
            .from('translation_jobs')
            .update({
              failed_chunks: job.failed_chunks + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', job.job_id)
        }
      }

      // 检查任务是否完全完成
      const updatedJob = await this.getJobDetails(job.job_id)
      if (updatedJob) {
        if (updatedJob.completed_chunks === updatedJob.total_chunks) {
          // 任务完全成功
          await logTranslationRequest(
            job.user_id,
            job.source_language,
            job.target_language,
            job.original_content?.length || 0,
            true,
            undefined,
            updatedJob.processing_time_ms,
            'queue_processing'
          )
        } else if (updatedJob.completed_chunks > 0) {
          // 部分成功
          await this.supabase.rpc('handle_job_failure', {
            p_job_id: job.job_id,
            p_error_message: `Partial completion: ${updatedJob.completed_chunks}/${updatedJob.total_chunks} chunks completed`,
            p_error_details: { 
              completed_chunks: updatedJob.completed_chunks,
              failed_chunks: updatedJob.failed_chunks,
              total_chunks: updatedJob.total_chunks
            },
            p_save_partial_results: true
          })
        }
      }

    } catch (error) {
      console.error(`Job ${job.job_id} failed:`, error)
      
      // 处理任务失败
      await this.supabase.rpc('handle_job_failure', {
        p_job_id: job.job_id,
        p_error_message: error instanceof Error ? error.message : 'Unknown error',
        p_error_details: { 
          error_type: error instanceof Error ? error.constructor.name : 'UnknownError',
          worker_id: this.workerId,
          credits_consumed: totalCreditsConsumed,
          transaction_ids: transactionIds
        },
        p_save_partial_results: false
      })

      // 记录审计日志
      await logTranslationRequest(
        job.user_id,
        job.source_language,
        job.target_language,
        job.original_content?.length || 0,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  /**
   * 实时订阅任务状态更新
   */
  subscribeToJobUpdates(
    userId: string,
    callback: (job: TranslationJob) => void
  ): () => void {
    const subscription = this.supabase
      .channel('translation_jobs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'translation_jobs',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          callback(payload.new as TranslationJob)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  /**
   * 清理过期任务
   */
  async cleanupExpiredJobs(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .rpc('cleanup_expired_jobs')

      if (error) {
        console.error('Failed to cleanup expired jobs:', error)
        return 0
      }

      return data || 0
    } catch (error) {
      console.error('Error cleaning up expired jobs:', error)
      return 0
    }
  }
}

// 单例实例
let queueService: TranslationQueueService | null = null

export function getTranslationQueueService(useServerClient = false): TranslationQueueService {
  if (!queueService) {
    queueService = new TranslationQueueService(useServerClient)
  }
  return queueService
}

// 便捷函数
export async function createTranslationJob(params: CreateJobParams): Promise<string | null> {
  const service = getTranslationQueueService(true)
  return await service.createJob(params)
}

export async function getUserTranslationJobs(
  userId: string,
  options?: { limit?: number; offset?: number; status?: JobStatus }
): Promise<TranslationJob[]> {
  const service = getTranslationQueueService()
  return await service.getUserJobs(userId, options)
}

export async function getTranslationJobProgress(jobId: string): Promise<JobProgress | null> {
  const service = getTranslationQueueService()
  return await service.getJobProgress(jobId)
}

export { TranslationQueueService }

// 临时替换函数
function translateWithResilience(text: string, sourceLanguage: string, targetLanguage: string) {
  // 简单的 fallback 实现
  return Promise.resolve({
    translatedText: `[TRANSLATED] ${text}`,
    sourceLanguage,
    targetLanguage,
    processingTime: 100,
    method: 'fallback' as const
  });
}
