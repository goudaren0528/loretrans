const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: '../../../frontend',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/../../../tests/config/setup/frontend.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/../../../frontend/.next/', 
    '<rootDir>/../../../node_modules/',
    '<rootDir>/../../../tests/e2e/',
    '<rootDir>/../../../tests/integration/'
  ],
  testMatch: [
    '<rootDir>/../../../tests/unit/frontend/**/*.test.{js,jsx,ts,tsx}',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../../frontend/$1',
    '^@tests/(.*)$': '<rootDir>/../../../tests/$1',
  },
  collectCoverageFrom: [
    '<rootDir>/../../../frontend/app/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/../../../frontend/components/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/../../../frontend/lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/*.config.{js,ts}',
  ],
  coverageDirectory: '<rootDir>/../../../tests/coverage/frontend',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/../../../frontend/tsconfig.json',
    }],
  },
  testTimeout: 10000,
  verbose: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig) 