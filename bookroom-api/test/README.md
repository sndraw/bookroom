# BookRoom API 测试指南

本目录包含项目的自动化测试代码，主要使用Jest + TypeScript实现。

## 测试目录结构

```
test/
├── integration/            # 集成测试
│   └── tool-calls/         # 工具调用集成测试
│       └── tool-calls.test.ts
├── utils/                  # 测试辅助工具
│   └── test-helpers.ts     # 测试辅助函数
├── jest-globals.d.ts       # Jest类型声明文件
├── setup.ts                # 测试环境设置
└── README.md               # 本说明文档
```

## 配置测试环境

1. 复制`.env.test.example`到`.env.test.local`并填写有效的测试凭据：

```bash
cp .env.test.example .env.test.local
```

2. 编辑`.env.test.local`文件，设置必要的环境变量：

```
TEST_API_URL=http://localhost:5001/api/v1
TEST_AGENT_ID=your-test-agent-id
TEST_TOKEN=your-test-token
```

## 运行测试

项目提供了多种测试运行方式：

### 单元测试

运行项目中的单元测试（api目录下的.test.ts文件）：

```bash
pnpm test:unit
```

### 集成测试

运行集成测试（test目录下的测试）：

```bash
pnpm test:integration
```

### 所有测试

同时运行单元测试和集成测试：

```bash
pnpm test:jest
```

### 监视模式

在开发过程中实时监测文件变化并运行测试：

```bash
pnpm test:watch
```

### 测试覆盖率报告

生成测试覆盖率报告：

```bash
pnpm test:coverage
```

## 编写新测试

### 单元测试

单元测试应放置在与被测代码相同的目录下，使用`.test.ts`后缀：

```typescript
// api/service/SomeService.ts
export function someFunction() { /* ... */ }

// api/service/SomeService.test.ts
import { someFunction } from './SomeService';

describe('SomeService', () => {
  it('should do something', () => {
    expect(someFunction()).toBe(expectedResult);
  });
});
```

### 集成测试

集成测试应放置在`test/integration`目录下，按功能模块划分子目录：

```typescript
// test/integration/feature/feature.test.ts
import { someApiFunction } from '../../utils/test-helpers';

describe('Feature Integration', () => {
  it('should integrate correctly', async () => {
    const result = await someApiFunction();
    expect(result).toMatchExpectedOutput();
  });
});
```

## 测试辅助工具

项目提供了一些测试辅助工具，位于`test/utils/test-helpers.ts`：

- `callToolAPI()`: 封装工具调用API请求
- `verifyToolResult()`: 验证工具返回结果

请查看源代码了解详细用法。 