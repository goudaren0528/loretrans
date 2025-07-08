const request = require('supertest')
const fs = require('fs-extra')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

// Import the app - we'll need to create a test version
const { createApp } = require('../../../microservices/file-processor/src/index')

describe('File Processor Microservice', () => {
  let app
  let server

  beforeAll(async () => {
    app = await createApp({ testing: true })
    await app.ready()
    server = app.server
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(server)
        .get('/health')
        .expect(200)

      expect(response.body).toEqual({
        status: 'healthy',
        service: 'file-processor',
        version: '1.0.0',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        memory: {
          used: expect.any(Number),
          total: expect.any(Number)
        },
        responseTime: expect.any(Number),
        checks: {
          uploadsDirectory: 'ok',
          tempDirectory: 'ok'
        }
      })
    })
  })

  describe('File Upload', () => {
    it('should upload a text file successfully', async () => {
      const testContent = 'Hello world, this is a test document.'
      const testFilePath = global.createTestFile(testContent, 'test.txt')

      const response = await request(server)
        .post('/upload')
        .attach('file', testFilePath)
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        data: {
          fileId: expect.any(String),
          originalName: 'test.txt',
          fileName: expect.any(String),
          fileSize: expect.any(Number),
          mimeType: 'text/plain',
          status: 'uploaded',
          uploadedAt: expect.any(String)
        }
      })

      // Clean up
      await fs.unlink(testFilePath)
    })

    it('should upload a PDF file successfully', async () => {
      // Create a minimal PDF file for testing
      const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 100 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000174 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n270\n%%EOF'
      const testFilePath = global.createTestFile(pdfContent, 'test.pdf')

      const response = await request(server)
        .post('/upload')
        .attach('file', testFilePath)
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        data: {
          fileId: expect.any(String),
          originalName: 'test.pdf',
          fileName: expect.any(String),
          fileSize: expect.any(Number),
          mimeType: 'application/pdf',
          status: 'uploaded',
          uploadedAt: expect.any(String)
        }
      })

      // Clean up
      await fs.unlink(testFilePath)
    })

    it('should reject files that are too large', async () => {
      // Create a large file (>50MB for testing)
      const largeContent = 'x'.repeat(52 * 1024 * 1024)
      const testFilePath = global.createTestFile(largeContent, 'large.txt')

      const response = await request(server)
        .post('/upload')
        .attach('file', testFilePath)
        .expect(400)

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds limit of 50MB'
        }
      })

      // Clean up
      await fs.unlink(testFilePath)
    })

    it('should reject unsupported file types', async () => {
      const testContent = 'not a supported file'
      const testFilePath = global.createTestFile(testContent, 'test.exe')

      const response = await request(server)
        .post('/upload')
        .attach('file', testFilePath)
        .expect(400)

      expect(response.body).toEqual({
        success: false,
        error: 'Unsupported file type',
      })

      // Clean up
      await fs.unlink(testFilePath)
    })

    it('should handle missing file', async () => {
      const response = await request(server)
        .post('/upload')
        .expect(400)

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'INVALID_CONTENT_TYPE',
          message: 'Request must be multipart/form-data'
        }
      })
    })
  })

  describe('Text Extraction', () => {
    it('should extract text from uploaded file', async () => {
      const testContent = 'This is test content for extraction.'
      const testFilePath = global.createTestFile(testContent, 'extract.txt')

      // First upload the file
      const uploadResponse = await request(server)
        .post('/upload')
        .attach('file', testFilePath)
        .expect(200)

      const { data: { fileId } } = uploadResponse.body

      // Then extract text
      const response = await request(server)
        .post('/extract')
        .send({ fileId })
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        data: {
          fileId,
          text: testContent,
          wordCount: expect.any(Number),
          charCount: testContent.length,
          extractedAt: expect.any(String)
        }
      })

      // Clean up
      await fs.unlink(testFilePath)
    })

    it('should handle invalid file ID', async () => {
      const response = await request(server)
        .post('/extract')
        .send({ fileId: 'invalid-id' })
        .expect(404)

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found'
        }
      })
    })

    it('should handle missing file ID', async () => {
      const response = await request(server)
        .post('/extract')
        .send({})
        .expect(400)

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'MISSING_FILE_ID',
          message: 'File ID is required'
        }
      })
    })
  })

  describe('File Translation', () => {
    it('should translate extracted text', async () => {
      const testContent = 'Hello world'
      const testFilePath = global.createTestFile(testContent, 'translate.txt')

      // Upload file first
      const uploadResponse = await request(server)
        .post('/upload')
        .attach('file', testFilePath)
        .expect(200)

      const { data: { fileId } } = uploadResponse.body

      // Translate (no need to extract separately as translate route handles it)
      const response = await request(server)
        .post('/translate')
        .send({
          fileId,
          sourceLanguage: 'en',
          targetLanguage: 'fr',
          email: 'test@example.com',
        })
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        data: {
          jobId: expect.any(String),
          status: expect.any(String),
          message: 'Translation job created',
          fileId,
          fileName: expect.any(String),
          sourceLanguage: 'en',
          targetLanguage: 'fr'
        }
      })

      // Clean up
      await fs.unlink(testFilePath)
    })

    it('should validate translation request', async () => {
      const response = await request(server)
        .post('/translate')
        .send({
          sourceLanguage: 'en',
          targetLanguage: 'fr',
        })
        .expect(400)

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'MISSING_FILE_ID',
          message: 'File ID is required'
        }
      })
    })

    it('should validate email format', async () => {
      const response = await request(server)
        .post('/translate')
        .send({
          fileId: uuidv4(),
          sourceLanguage: 'en',
          targetLanguage: 'fr',
          email: 'invalid-email',
        })
        .expect(400)

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Invalid email format'
        }
      })
    })
  })

  describe('Result Download', () => {
    it('should return download URL for completed translation', async () => {
      const fileName = 'translated_test.txt'
      const resultContent = 'Translated content'
      
      // Create a mock result file in the microservice results directory
      const resultDir = path.join(__dirname, '../../../microservices/file-processor/results')
      await fs.ensureDir(resultDir)
      const resultPath = path.join(resultDir, fileName)
      await fs.writeFile(resultPath, resultContent)

      const response = await request(server)
        .get(`/download/${fileName}`)
        .expect(200)

      expect(response.text).toBe(resultContent)
      expect(response.headers['content-type']).toMatch(/text\/plain/)

      // Clean up
      await fs.unlink(resultPath)
    })

    it('should handle missing result file', async () => {
      const fileName = 'nonexistent_file.txt'

      const response = await request(server)
        .get(`/download/${fileName}`)
        .expect(404)

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'Download file not found'
        }
      })
    })
  })

  describe('Job Status', () => {
    it('should return job status', async () => {
      // First create a job by uploading and translating a file
      const testContent = 'Hello world'
      const testFilePath = global.createTestFile(testContent, 'status-test.txt')

      // Upload file
      const uploadResponse = await request(server)
        .post('/upload')
        .attach('file', testFilePath)
        .expect(200)

      const { data: { fileId } } = uploadResponse.body

      // Create translation job
      const translateResponse = await request(server)
        .post('/translate')
        .send({
          fileId,
          sourceLanguage: 'en',
          targetLanguage: 'fr',
          email: 'test@example.com',
        })
        .expect(200)

      const { data: { jobId } } = translateResponse.body

      // Check job status
      const response = await request(server)
        .get(`/status/${jobId}`)
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        jobId,
        status: expect.any(String),
        progress: expect.any(Number),
        data: expect.any(Object),
        result: expect.anything(),
        createdAt: expect.any(String),
        processedAt: expect.anything(),
        finishedAt: expect.anything()
      })

      // Clean up
      await fs.unlink(testFilePath)
    })

    it('should handle missing job', async () => {
      const jobId = uuidv4()

      const response = await request(server)
        .get(`/status/${jobId}`)
        .expect(404)

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found'
        }
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(server)
        .get('/unknown-route')
        .expect(404)

      expect(response.body).toEqual({
        error: 'Not Found',
        message: 'Route GET:/unknown-route not found',
        statusCode: 404
      })
    })

    it('should handle internal server errors gracefully', async () => {
      // This would need to be implemented based on actual error scenarios
      // For now, we'll just ensure the error handler is in place
      expect(app.errorHandler).toBeDefined()
    })
  })

  describe('CORS and Security', () => {
    it('should include CORS headers', async () => {
      const response = await request(server)
        .get('/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200)

      expect(response.headers['access-control-allow-origin']).toBeTruthy()
    })

    it('should handle OPTIONS requests', async () => {
      const response = await request(server)
        .options('/upload')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .expect(204)

      expect(response.headers['access-control-allow-methods']).toMatch(/POST/)
    })
  })
}) 