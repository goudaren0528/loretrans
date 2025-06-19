const path = require('path')

module.exports = {
  projects: [
    // Frontend tests
    {
      displayName: 'Frontend',
      testEnvironment: 'jsdom',
      rootDir: path.resolve(__dirname, '../'),
      setupFilesAfterEnv: ['<rootDir>/tests/config/setup/frontend.setup.js'],
      testMatch: [
        '<rootDir>/tests/unit/frontend/**/*.test.{js,jsx,ts,tsx}',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/frontend/$1',
        '^@tests/(.*)$': '<rootDir>/tests/$1',
      },
      collectCoverageFrom: [
        'frontend/app/**/*.{js,jsx,ts,tsx}',
        'frontend/components/**/*.{js,jsx,ts,tsx}',
        'frontend/lib/**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/.next/**',
        '!**/coverage/**',
        '!**/*.config.{js,ts}',
      ],
      coverageDirectory: 'tests/coverage/frontend',
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          tsconfig: 'frontend/tsconfig.json',
        }],
        '^.+\\.(js|jsx)$': ['babel-jest'],
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    },
    
    // Backend tests
    {
      displayName: 'Backend',
      testEnvironment: 'node',
      rootDir: path.resolve(__dirname, '../'),
      setupFilesAfterEnv: ['<rootDir>/tests/config/setup/backend.setup.js'],
      testMatch: [
        '<rootDir>/tests/unit/backend/**/*.test.js',
        '<rootDir>/tests/integration/**/*.integration.js',
      ],
      collectCoverageFrom: [
        'microservices/**/*.js',
        '!microservices/**/node_modules/**',
        '!microservices/**/coverage/**',
        '!**/*.test.js',
        '!**/*.spec.js',
        '!**/*.config.js',
      ],
      coverageDirectory: 'tests/coverage/backend',
      moduleNameMapper: {
        '^@tests/(.*)$': '<rootDir>/tests/$1',
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
  ],
  
  // Global configuration
  coverageDirectory: 'tests/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testTimeout: 15000,
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
} 