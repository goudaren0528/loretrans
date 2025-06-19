// backend test setup
const fs = require('fs-extra')
const path = require('path')

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.PORT = '3001'
process.env.REDIS_URL = 'redis://localhost:6379'
process.env.TRANSLATION_API_URL = 'http://localhost:3000/api/translate'
process.env.EMAIL_SERVICE_URL = 'http://localhost:3000/api/email'

// Create test directories
const testDirs = [
  path.join(__dirname, '../../../fixtures/files/temp'),
  path.join(__dirname, '../../../fixtures/files/uploads'),
  path.join(__dirname, '../../../fixtures/files/results'),
]

beforeAll(async () => {
  // Create test directories
  for (const dir of testDirs) {
    await fs.ensureDir(dir)
  }
})

afterAll(async () => {
  // Clean up test directories
  for (const dir of testDirs) {
    await fs.remove(dir)
  }
})

// Mock Redis client
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    on: jest.fn(),
  })),
}))

// Mock Bull queue
jest.mock('bull', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    process: jest.fn(),
    on: jest.fn(),
    close: jest.fn(),
  }))
})

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(),
    verify: jest.fn(),
  })),
}))

// Global test utilities
global.createTestFile = (content, filename = 'test.txt') => {
  const testDir = path.join(__dirname, '../../../fixtures/files/temp')
  const filepath = path.join(testDir, filename)
  fs.writeFileSync(filepath, content)
  return filepath
}

global.cleanupTestFiles = async () => {
  const testDir = path.join(__dirname, '../../../fixtures/files/temp')
  await fs.emptyDir(testDir)
}

// Console spy for tests
const originalConsole = { ...console }
beforeEach(() => {
  global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  }
})

afterEach(() => {
  global.console = originalConsole
  jest.clearAllMocks()
}) 