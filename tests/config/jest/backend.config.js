module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/../../../tests/config/setup/backend.setup.js'],
  testPathIgnorePatterns: [
    '<rootDir>/../../../node_modules/',
    '<rootDir>/../../../tests/unit/frontend/',
    '<rootDir>/../../../tests/e2e/'
  ],
  testMatch: [
    '<rootDir>/../../../tests/unit/backend/**/*.test.js',
    '<rootDir>/../../../tests/integration/**/*.integration.js',
  ],
  collectCoverageFrom: [
    '<rootDir>/../../../microservices/**/*.js',
    '!<rootDir>/../../../microservices/**/node_modules/**',
    '!<rootDir>/../../../microservices/**/coverage/**',
    '!**/*.test.js',
    '!**/*.spec.js',
    '!**/*.config.js',
  ],
  coverageDirectory: '<rootDir>/../../../tests/coverage/backend',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^@tests/(.*)$': '<rootDir>/../../../tests/$1',
    '^@/(.*)$': '<rootDir>/../../../$1',
  },
  testTimeout: 15000,
  verbose: true,
  // Enable experimental ESM support if needed
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
} 