/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // 测试前置设置
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  // 转换器
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  // 测试目录
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)',
  ],
  // 测试覆盖率收集
  collectCoverageFrom: [
    'api/**/*.ts',
    '!api/**/*.d.ts',
    '!**/node_modules/**',
  ],
  // 测试环境变量
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  // 简化模块导入路径
  moduleNameMapper: {
    '^@api/(.*)$': '<rootDir>/api/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  // 忽略监听文件
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/',
  ],
  // 针对单元测试增加超时时间
  testTimeout: 10000,
}; 