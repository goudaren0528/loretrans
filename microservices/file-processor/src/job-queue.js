const { v4: uuidv4 } = require('uuid')

class JobQueue {
  constructor() {
    this.jobs = new Map() // 存储所有任务
    this.runningJobs = new Set() // 正在运行的任务
    this.maxConcurrent = 3 // 最大并发任务数
  }

  /**
   * 创建新的翻译任务
   */
  createJob(fileId, fileName, options = {}) {
    const jobId = uuidv4()
    const job = {
      id: jobId,
      fileId,
      fileName,
      status: 'pending', // pending, processing, completed, failed
      progress: 0,
      message: 'Job created',
      options: {
        sourceLanguage: options.sourceLanguage || 'auto',
        targetLanguage: options.targetLanguage || 'en',
        ...options
      },
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      result: null,
      error: null,
      downloadUrl: null
    }

    this.jobs.set(jobId, job)
    console.log(`Created translation job ${jobId} for file ${fileName}`)
    
    return job
  }

  /**
   * 获取任务信息
   */
  getJob(jobId) {
    return this.jobs.get(jobId)
  }

  /**
   * 获取所有任务
   */
  getAllJobs() {
    return Array.from(this.jobs.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  /**
   * 获取等待中的任务
   */
  getPendingJobs() {
    return Array.from(this.jobs.values())
      .filter(job => job.status === 'pending')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  /**
   * 更新任务状态
   */
  updateJob(jobId, updates) {
    const job = this.jobs.get(jobId)
    if (!job) {
      console.error(`Job ${jobId} not found`)
      return false
    }

    Object.assign(job, updates)
    
    if (updates.status === 'processing' && !job.startedAt) {
      job.startedAt = new Date().toISOString()
    }
    
    if (['completed', 'failed'].includes(updates.status) && !job.completedAt) {
      job.completedAt = new Date().toISOString()
    }

    console.log(`Updated job ${jobId}: ${updates.status || 'status unchanged'}`)
    return true
  }

  /**
   * 更新任务进度
   */
  updateProgress(jobId, progress, message) {
    return this.updateJob(jobId, { progress, message })
  }

  /**
   * 标记任务开始处理
   */
  startJob(jobId) {
    const job = this.jobs.get(jobId)
    if (!job) return false

    this.runningJobs.add(jobId)
    return this.updateJob(jobId, { 
      status: 'processing',
      progress: 0,
      message: 'Starting translation...'
    })
  }

  /**
   * 标记任务完成
   */
  completeJob(jobId, result, downloadUrl) {
    const job = this.jobs.get(jobId)
    if (!job) return false

    this.runningJobs.delete(jobId)
    return this.updateJob(jobId, {
      status: 'completed',
      progress: 100,
      message: 'Translation completed successfully',
      result,
      downloadUrl
    })
  }

  /**
   * 标记任务失败
   */
  failJob(jobId, error) {
    const job = this.jobs.get(jobId)
    if (!job) return false

    this.runningJobs.delete(jobId)
    return this.updateJob(jobId, {
      status: 'failed',
      message: `Translation failed: ${error}`,
      error
    })
  }

  /**
   * 删除任务
   */
  deleteJob(jobId) {
    const job = this.jobs.get(jobId)
    if (!job) return false

    this.runningJobs.delete(jobId)
    this.jobs.delete(jobId)
    console.log(`Deleted job ${jobId}`)
    return true
  }

  /**
   * 检查是否可以开始新任务
   */
  canStartNewJob() {
    return this.runningJobs.size < this.maxConcurrent
  }

  /**
   * 获取队列统计信息
   */
  getStats() {
    const jobs = Array.from(this.jobs.values())
    const stats = {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      runningJobs: this.runningJobs.size,
      maxConcurrent: this.maxConcurrent
    }

    return stats
  }

  /**
   * 清理旧任务（超过24小时的已完成/失败任务）
   */
  cleanupOldJobs() {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000 // 24小时前
    let cleanedCount = 0

    for (const [jobId, job] of this.jobs) {
      if (['completed', 'failed'].includes(job.status)) {
        const jobTime = new Date(job.completedAt || job.createdAt).getTime()
        if (jobTime < cutoffTime) {
          this.deleteJob(jobId)
          cleanedCount++
        }
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} old jobs`)
    }

    return cleanedCount
  }

  /**
   * 获取任务的详细信息（用于API响应）
   */
  getJobDetails(jobId) {
    const job = this.getJob(jobId)
    if (!job) return null

    const details = {
      id: job.id,
      fileId: job.fileId,
      fileName: job.fileName,
      status: job.status,
      progress: job.progress,
      message: job.message,
      sourceLanguage: job.options.sourceLanguage,
      targetLanguage: job.options.targetLanguage,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      downloadUrl: job.downloadUrl,
      error: job.error
    }

    // 如果任务完成，添加结果统计
    if (job.result && job.status === 'completed') {
      details.statistics = {
        wordCount: job.result.wordCount,
        translatedWordCount: job.result.translatedWordCount,
        chunkCount: job.result.chunkCount,
        originalLength: job.result.statistics?.originalLength,
        translatedLength: job.result.statistics?.translatedLength
      }
    }

    return details
  }
}

// 单例模式
let jobQueueInstance = null

function getJobQueue() {
  if (!jobQueueInstance) {
    jobQueueInstance = new JobQueue()
    
    // 定期清理旧任务
    setInterval(() => {
      jobQueueInstance.cleanupOldJobs()
    }, 60 * 60 * 1000) // 每小时清理一次
  }
  
  return jobQueueInstance
}

module.exports = { JobQueue, getJobQueue } 