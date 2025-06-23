const fastify = require('fastify')({ 
  logger: true
})
const path = require('path')

// 注册插件
async function registerPlugins() {
  await fastify.register(require('@fastify/cors'), {
    origin: true,
    credentials: true
  })
}

// 注册路由
async function registerRoutes() {
  const translationService = require('./translation-service')
  await translationService.initialize()

  // 健康检查
  fastify.get('/health', async (request, reply) => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'nllb-local',
      version: process.env.npm_package_version || '1.0.0',
      model_loaded: translationService.isModelLoaded()
    }
  })

  // 翻译接口
  fastify.post('/translate', async (request, reply) => {
    const { text, sourceLanguage, targetLanguage } = request.body

    // 验证输入
    if (!text || !sourceLanguage || !targetLanguage) {
      return reply.code(400).send({
        error: 'Missing required fields: text, sourceLanguage, targetLanguage'
      })
    }

    if (text.length > 1000) {
      return reply.code(400).send({
        error: 'Text too long. Maximum 1000 characters allowed.'
      })
    }

    try {
      const startTime = Date.now()
      const result = await translationService.translateText(text, sourceLanguage, targetLanguage)
      const processingTime = Date.now() - startTime

      return {
        translatedText: result,
        sourceLanguage,
        targetLanguage,
        processingTime,
        method: 'nllb-local'
      }
    } catch (error) {
      fastify.log.error('Translation error:', error)
      return reply.code(500).send({
        error: 'Translation failed',
        message: error.message
      })
    }
  })

  // 批量翻译接口
  fastify.post('/translate/batch', async (request, reply) => {
    const { texts, sourceLanguage, targetLanguage } = request.body

    if (!Array.isArray(texts) || texts.length === 0) {
      return reply.code(400).send({
        error: 'texts must be a non-empty array'
      })
    }

    if (texts.length > 10) {
      return reply.code(400).send({
        error: 'Maximum 10 texts allowed per batch request'
      })
    }

    try {
      const startTime = Date.now()
      const results = await translationService.translateBatch(texts, sourceLanguage, targetLanguage)
      const processingTime = Date.now() - startTime

      return {
        results,
        processingTime,
        method: 'nllb-local'
      }
    } catch (error) {
      fastify.log.error('Batch translation error:', error)
      return reply.code(500).send({
        error: 'Batch translation failed',
        message: error.message
      })
    }
  })

  // 支持的语言列表
  fastify.get('/languages', async (request, reply) => {
    return {
      supported: translationService.getSupportedLanguages(),
      total: Object.keys(translationService.getSupportedLanguages()).length
    }
  })

  // 模型信息
  fastify.get('/model/info', async (request, reply) => {
    return {
      model: 'facebook/nllb-200-distilled-600M',
      version: '1.0',
      loaded: translationService.isModelLoaded(),
      supportedLanguages: Object.keys(translationService.getSupportedLanguages()).length
    }
  })
}

// 启动服务器
async function start() {
  try {
    await registerPlugins()
    await registerRoutes()

    const port = process.env.PORT || 8081
    const host = process.env.HOST || '0.0.0.0'

    await fastify.listen({ port, host })
    fastify.log.info(`NLLB Local Service running on http://${host}:${port}`)
    fastify.log.info('Available endpoints:')
    fastify.log.info('  GET  /health - Health check')
    fastify.log.info('  POST /translate - Single text translation')
    fastify.log.info('  POST /translate/batch - Batch text translation')
    fastify.log.info('  GET  /languages - Supported languages')
    fastify.log.info('  GET  /model/info - Model information')
    
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  fastify.log.info('Received SIGINT, shutting down gracefully...')
  await fastify.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  fastify.log.info('Received SIGTERM, shutting down gracefully...')
  await fastify.close()
  process.exit(0)
})

// 错误处理
process.on('uncaughtException', (error) => {
  fastify.log.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  fastify.log.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

start() 