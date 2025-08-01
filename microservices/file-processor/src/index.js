const fastify = require('fastify')({ logger: true })
// 获取文档信息路由
fastify.get('/api/documents/:documentId', async (request, reply) => {
  try {
    const { documentId } = request.params
    
    console.log(`[Document API] 请求文档: ${documentId}`)
    
    // 查找文档文件
    const uploadsDir = path.join(__dirname, '../uploads')
    const files = await fs.readdir(uploadsDir)
    
    // 查找匹配的文件（文档ID可能是文件名的一部分）
    let foundFile = null
    for (const file of files) {
      if (file.includes(documentId) || documentId.includes(file.split('.')[0])) {
        foundFile = file
        break
      }
    }
    
    if (!foundFile) {
      console.log(`[Document API] 文档未找到: ${documentId}`)
      console.log(`[Document API] 可用文件列表: ${files.slice(0, 5).join(', ')}...`)
      
      reply.code(404)
      return {
        success: false,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: '文档不存在或已过期',
          documentId: documentId,
          availableFiles: files.length
        }
      }
    }
    
    const filePath = path.join(uploadsDir, foundFile)
    const stats = await fs.stat(filePath)
    const content = await fs.readFile(filePath, 'utf8')
    
    console.log(`[Document API] 文档找到: ${foundFile}, 大小: ${stats.size} bytes`)
    
    return {
      success: true,
      data: {
        id: documentId,
        fileName: foundFile,
        content: content,
        size: stats.size,
        lastModified: stats.mtime,
        type: path.extname(foundFile).substring(1)
      }
    }
    
  } catch (error) {
    console.error(`[Document API] 错误: ${error.message}`)
    fastify.log.error(error)
    reply.code(500)
    return {
      success: false,
      error: {
        code: 'DOCUMENT_FETCH_ERROR',
        message: '获取文档失败',
        details: error.message
      }
    }
  }
})

const path = require('path')
const fs = require('fs-extra')
const { TranslationService } = require('./translation-service')
const { getJobQueue } = require('./job-queue')
const { ensureDirectories } = require('./setup')

// 注册插件
async function registerPlugins() {
  // CORS支持
  await fastify.register(require('@fastify/cors'), {
    origin: (origin, callback) => {
      // 允许测试环境和开发环境
      const allowedOrigins = [
        'http://localhost:3000', 
        'http://localhost:3001', 
        'http://localhost:3002'
      ]
      
      // 在测试环境中允许所有来源
      if (process.env.NODE_ENV === 'test' || !origin) {
        callback(null, true)
        return
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })

  // 文件上传支持
  await fastify.register(require('@fastify/multipart'), {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
      files: 1
    }
  })

  // 静态文件服务
  await fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, '../uploads'),
    prefix: '/files/'
  })
}

// 健康检查路由
fastify.get('/health', async (request, reply) => {
  const startTime = Date.now()
  
  try {
    // 检查上传目录
    const uploadsDir = path.join(__dirname, '../uploads')
    await fs.ensureDir(uploadsDir)
    
    // 检查临时目录
    const tempDir = path.join(__dirname, '../temp')
    await fs.ensureDir(tempDir)
    
    const responseTime = Date.now() - startTime
    
    return {
      status: 'healthy',
      service: 'file-processor',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      responseTime,
      checks: {
        uploadsDirectory: 'ok',
        tempDirectory: 'ok'
      }
    }
  } catch (error) {
    reply.code(503)
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
})

// 文件上传路由
fastify.post('/upload', async (request, reply) => {
  try {
    // 检查是否为multipart请求
    if (!request.isMultipart()) {
      reply.code(400)
      return {
        success: false,
        error: {
          code: 'INVALID_CONTENT_TYPE',
          message: 'Request must be multipart/form-data'
        }
      }
    }

    const data = await request.file()
    
    if (!data) {
      reply.code(400)
      return {
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      }
    }
    
    // 验证文件大小 (50MB限制)
    const maxSize = 50 * 1024 * 1024 // 50MB
    const buffer = await data.toBuffer()
    
    if (buffer.length > maxSize) {
      reply.code(400)
      return {
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds limit of ${maxSize / 1024 / 1024}MB`
        }
      }
    }
    
    // 验证文件类型
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ]
    
    if (!allowedTypes.includes(data.mimetype)) {
      reply.code(400)
      return {
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: `File type not supported: ${data.mimetype}`
        }
      }
    }
    
    // 生成唯一文件名
    const { v4: uuidv4 } = require('uuid')
    const fileId = uuidv4()
    const originalName = data.filename
    const extension = path.extname(originalName)
    const fileName = `${fileId}${extension}`
    const filePath = path.join(__dirname, '../uploads', fileName)
    
    // 保存文件
    await fs.ensureDir(path.dirname(filePath))
    await fs.writeFile(filePath, buffer)
    
    // 获取文件统计信息
    const stats = await fs.stat(filePath)
    
    return {
      success: true,
      data: {
        fileId,
        originalName,
        fileName,
        fileSize: stats.size,
        mimeType: data.mimetype,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded'
      }
    }
    
  } catch (error) {
    fastify.log.error(error)
    reply.code(500)
    return {
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message: 'File upload failed',
        details: error.message
      }
    }
  }
})

// 文本提取路由
fastify.post('/extract', async (request, reply) => {
  try {
    const { fileId } = request.body
    
    if (!fileId) {
      reply.code(400)
      return {
        success: false,
        error: {
          code: 'MISSING_FILE_ID',
          message: 'File ID is required'
        }
      }
    }
    
    // 查找文件
    const uploadsDir = path.join(__dirname, '../uploads')
    const files = await fs.readdir(uploadsDir)
    const targetFile = files.find(file => file.startsWith(fileId))
    
    if (!targetFile) {
      reply.code(404)
      return {
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found'
        }
      }
    }
    
    const filePath = path.join(uploadsDir, targetFile)
    const extension = path.extname(targetFile).toLowerCase()
    
    let extractedText = ''
    
    // 根据文件类型提取文本
    switch (extension) {
      case '.pdf':
        extractedText = await extractPdfText(filePath)
        break
      case '.doc':
      case '.docx':
        extractedText = await extractWordText(filePath)
        break
      case '.ppt':
      case '.pptx':
        extractedText = await extractPowerPointText(filePath)
        break
      case '.txt':
        extractedText = await fs.readFile(filePath, 'utf8')
        break
      default:
        reply.code(400)
        return {
          success: false,
          error: {
            code: 'UNSUPPORTED_FORMAT',
            message: `File format not supported: ${extension}`
          }
        }
    }
    
    return {
      success: true,
      data: {
        fileId,
        text: extractedText,
        wordCount: extractedText.split(/\s+/).length,
        charCount: extractedText.length,
        extractedAt: new Date().toISOString()
      }
    }
    
  } catch (error) {
    fastify.log.error(error)
    reply.code(500)
    return {
      success: false,
      error: {
        code: 'EXTRACTION_FAILED',
        message: 'Text extraction failed',
        details: error.message
      }
    }
  }
})

// 文本提取函数
async function extractPdfText(filePath) {
  const pdfParse = require('pdf-parse')
  const buffer = await fs.readFile(filePath)
  const data = await pdfParse(buffer)
  return data.text
}

async function extractWordText(filePath) {
  const mammoth = require('mammoth')
  const buffer = await fs.readFile(filePath)
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

async function extractPowerPointText(filePath) {
  const officeParser = require('officeparser')
  return new Promise((resolve, reject) => {
    officeParser.parseOffice(filePath, (data, err) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

// 文档翻译任务路由
fastify.post('/translate', async (request, reply) => {
  try {
    const { fileId, email, sourceLanguage = 'auto', targetLanguage = 'en' } = request.body
    
    // 验证必需参数
    if (!fileId) {
      reply.code(400)
      return {
        success: false,
        error: {
          code: 'MISSING_FILE_ID',
          message: 'File ID is required'
        }
      }
    }
    
    if (!email) {
      reply.code(400)
      return {
        success: false,
        error: {
          code: 'MISSING_EMAIL',
          message: 'Email is required'
        }
      }
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      reply.code(400)
      return {
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Invalid email format'
        }
      }
    }
    
    // 查找文件
    const uploadsDir = path.join(__dirname, '../uploads')
    const files = await fs.readdir(uploadsDir)
    const targetFile = files.find(file => file.startsWith(fileId))
    
    if (!targetFile) {
      reply.code(404)
      return {
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found'
        }
      }
    }
    
    // 先提取文本
    const extractResult = await extractTextFromFile(fileId, targetFile)
    if (!extractResult.success) {
      reply.code(400)
      return extractResult
    }
    
    // 创建翻译任务
    const jobQueue = getJobQueue()
    const job = jobQueue.createJob(fileId, targetFile, {
      sourceLanguage,
      targetLanguage,
      extractedText: extractResult.data.text
    })
    
    // 异步开始翻译
    processTranslationJob(job.id)
    
    return {
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        message: 'Translation job created',
        fileId,
        fileName: targetFile,
        sourceLanguage,
        targetLanguage
      }
    }
    
  } catch (error) {
    fastify.log.error(error)
    reply.code(500)
    return {
      success: false,
      error: {
        code: 'TRANSLATION_JOB_FAILED',
        message: 'Failed to create translation job',
        details: error.message
      }
    }
  }
})

// 获取任务状态路由
fastify.get('/job/:jobId', async (request, reply) => {
  try {
    const { jobId } = request.params
    const jobQueue = getJobQueue()
    const job = jobQueue.getJobDetails(jobId)
    
    if (!job) {
      reply.code(404)
      return {
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Translation job not found'
        }
      }
    }
    
    return {
      success: true,
      data: job
    }
    
  } catch (error) {
    fastify.log.error(error)
    reply.code(500)
    return {
      success: false,
      error: {
        code: 'JOB_STATUS_ERROR',
        message: 'Failed to get job status',
        details: error.message
      }
    }
  }
})

// 获取所有任务路由
fastify.get('/jobs', async (request, reply) => {
  try {
    const jobQueue = getJobQueue()
    const jobs = jobQueue.getAllJobs().map(job => jobQueue.getJobDetails(job.id))
    const stats = jobQueue.getStats()
    
    return {
      success: true,
      data: {
        jobs,
        stats
      }
    }
    
  } catch (error) {
    fastify.log.error(error)
    reply.code(500)
    return {
      success: false,
      error: {
        code: 'JOBS_LIST_ERROR',
        message: 'Failed to get jobs list',
        details: error.message
      }
    }
  }
})

// 任务状态查询路由
fastify.get('/status/:jobId', async (request, reply) => {
  try {
    const { jobId } = request.params
    
    if (!jobId) {
      reply.code(400)
      return {
        success: false,
        error: {
          code: 'MISSING_JOB_ID',
          message: 'Job ID is required'
        }
      }
    }
    
    const jobQueue = getJobQueue()
    const job = await jobQueue.getJob(jobId)
    
    if (!job) {
      reply.code(404)
      return {
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found'
        }
      }
    }
    
    return {
      success: true,
      jobId: job.id,
      status: await job.getState(),
      progress: job.progress(),
      data: job.data,
      result: job.returnvalue,
      createdAt: new Date(job.timestamp),
      processedAt: job.processedOn ? new Date(job.processedOn) : null,
      finishedAt: job.finishedOn ? new Date(job.finishedOn) : null
    }
  } catch (error) {
    console.error('Status check error:', error)
    reply.code(500)
    return {
      success: false,
      error: {
        code: 'STATUS_CHECK_ERROR',
        message: 'Failed to check job status',
        details: error.message
      }
    }
  }
})

// 下载翻译结果路由
fastify.get('/download/:fileName', async (request, reply) => {
  try {
    const { fileName } = request.params
    const resultsDir = path.join(__dirname, '../results')
    const filePath = path.join(resultsDir, fileName)
    
    // 安全检查：确保文件在results目录内
    if (!filePath.startsWith(resultsDir)) {
      reply.code(403)
      return {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      }
    }
    
    // 检查文件是否存在
    if (!await fs.pathExists(filePath)) {
      reply.code(404)
      return {
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'Download file not found'
        }
      }
    }
    
    // 设置下载头
    const stats = await fs.stat(filePath)
    reply.header('Content-Disposition', `attachment; filename="${fileName}"`)
    reply.header('Content-Length', stats.size)
    reply.type('text/plain')
    
    // 发送文件
    return reply.send(await fs.readFile(filePath))
    
  } catch (error) {
    fastify.log.error(error)
    reply.code(500)
    return {
      success: false,
      error: {
        code: 'DOWNLOAD_ERROR',
        message: 'Failed to download file',
        details: error.message
      }
    }
  }
})

// 处理翻译任务的辅助函数
async function extractTextFromFile(fileId, fileName) {
  try {
    const uploadsDir = path.join(__dirname, '../uploads')
    const filePath = path.join(uploadsDir, fileName)
    const extension = path.extname(fileName).toLowerCase()
    
    let extractedText = ''
    
    switch (extension) {
      case '.pdf':
        extractedText = await extractPdfText(filePath)
        break
      case '.doc':
      case '.docx':
        extractedText = await extractWordText(filePath)
        break
      case '.ppt':
      case '.pptx':
        extractedText = await extractPowerPointText(filePath)
        break
      case '.txt':
        extractedText = await fs.readFile(filePath, 'utf8')
        break
      default:
        throw new Error(`Unsupported file format: ${extension}`)
    }
    
    return {
      success: true,
      data: {
        text: extractedText,
        wordCount: extractedText.split(/\s+/).length,
        charCount: extractedText.length
      }
    }
    
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'EXTRACTION_FAILED',
        message: 'Text extraction failed',
        details: error.message
      }
    }
  }
}

// 异步处理翻译任务
async function processTranslationJob(jobId) {
  const jobQueue = getJobQueue()
  const translationService = new TranslationService()
  
  try {
    // 检查是否可以开始新任务
    if (!jobQueue.canStartNewJob()) {
      console.log(`Job ${jobId} queued, waiting for available slot`)
      // 等待队列有空位时再处理
      setTimeout(() => processTranslationJob(jobId), 5000)
      return
    }
    
    const job = jobQueue.getJob(jobId)
    if (!job || job.status !== 'pending') {
      console.log(`Job ${jobId} is not pending, skipping`)
      return
    }
    
    // 开始处理
    jobQueue.startJob(jobId)
    console.log(`Started processing translation job ${jobId}`)
    
    // 执行翻译
    const result = await translationService.translateDocument(
      job.fileId,
      job.options.extractedText,
      job.options.sourceLanguage,
      job.options.targetLanguage,
      (progress, message) => {
        jobQueue.updateProgress(jobId, progress, message)
      }
    )
    
    if (result.success) {
      // 保存翻译结果
      const saveResult = await translationService.saveTranslationResult(
        job.fileId,
        job.fileName,
        result
      )
      
      if (saveResult.success) {
        const downloadUrl = translationService.generateDownloadUrl(saveResult.resultFileName)
        jobQueue.completeJob(jobId, result, downloadUrl)
        console.log(`Translation job ${jobId} completed successfully`)
      } else {
        throw new Error('Failed to save translation result')
      }
    } else {
      throw new Error(result.error || 'Translation failed')
    }
    
  } catch (error) {
    console.error(`Translation job ${jobId} failed:`, error.message)
    jobQueue.failJob(jobId, error.message)
  }
}

// 创建应用实例 (用于测试)
async function createApp(options = {}) {
  if (!options.testing) {
    // 确保目录存在
    await ensureDirectories()
  }
  
  await registerPlugins()
  
  return fastify
}

// 启动服务器
async function start() {
  try {
    // 确保目录存在
    await ensureDirectories()
    
    await registerPlugins()
    
    const host = process.env.HOST || '0.0.0.0'
    const port = process.env.PORT || 3010
    
    await fastify.listen({ host, port })
    console.log(`📄 File Processor service running on http://${host}:${port}`)
    
    // 启动任务队列处理器
    const jobQueue = getJobQueue()
    console.log('🔄 Job queue manager initialized')
    
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...')
  await fastify.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...')
  await fastify.close()
  process.exit(0)
})

// 导出用于测试
module.exports = { createApp, fastify }

// 只在非测试环境下启动服务器
if (require.main === module) {
  start()
} 