/**
 * Global Jest type declarations
 * 此文件定义了Jest全局类型，使其在TypeScript测试文件中可用
 */

import * as jest from '@jest/globals';

// 将jest相关类型添加到全局命名空间
declare global {
  const jest: typeof import('@jest/globals').jest;
  const expect: typeof import('@jest/globals').expect;
  const describe: typeof import('@jest/globals').describe;
  const it: typeof import('@jest/globals').it;
  const test: typeof import('@jest/globals').test;
  const beforeAll: typeof import('@jest/globals').beforeAll;
  const beforeEach: typeof import('@jest/globals').beforeEach;
  const afterAll: typeof import('@jest/globals').afterAll;
  const afterEach: typeof import('@jest/globals').afterEach;
} 