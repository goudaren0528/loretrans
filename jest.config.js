module.exports = {
  // 测试环境
  testEnvironment: 'node',
  
  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/__tests__/**/*.js'
  ],
  
  // 覆盖率收集
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // 覆盖率收集的文件
  collectCoverageFrom: [
    'frontend/app/api/**/*.{js,ts}',
    'frontend/lib/**/*.{js,ts}',
    'microservices/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/*.config.js'
  ],
  
  // 设置超时时间 - 增加以适应长文本翻译测试
  testTimeout: 60000,
  
  // 模块路径映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/frontend/$1'
  },
  
  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // 详细输出
  verbose: true,
  
  // 并行运行测试
  maxWorkers: 4,
  
  // 全局变量
  globals: {
    'process.env.NODE_ENV': 'test'
  },

  // 测试套件项目配置
  projects: [
    {
      displayName: 'Core Translation Tests',
      testMatch: ['<rootDir>/tests/core-translation.test.js'],
      testTimeout: 60000
    },
    {
      displayName: 'Long Text Translation Tests',
      testMatch: ['<rootDir>/tests/long-text-translation.test.js'],
      testTimeout: 90000 // 长文本测试需要更长时间
    },
    {
      displayName: 'Document Translation Tests',
      testMatch: ['<rootDir>/tests/document-translation.test.js'],
      testTimeout: 90000
    },
    {
      displayName: 'Comprehensive Translation Tests',
      testMatch: ['<rootDir>/tests/comprehensive-translation.test.js'],
      testTimeout: 120000 // 综合测试需要最长时间
    },
    {
      displayName: 'Credits and Billing Tests',
      testMatch: ['<rootDir>/tests/credits-and-billing.test.js'],
      testTimeout: 30000
    },
    {
      displayName: 'E2E Translation Tests',
      testMatch: ['<rootDir>/tests/e2e-translation.test.js'],
      testTimeout: 60000
    },
    {
      displayName: 'Unit Tests',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
      testTimeout: 30000
    }
  ]
};
