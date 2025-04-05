# 测试模拟数据

本目录包含测试使用的模拟数据和辅助工具。

## 目录结构

```
mocks/
├── README.md             # 本文件
├── TestMockHelper.ts     # 测试模拟辅助类
└── data/                 # 模拟数据
    └── TimeTool.mock.ts  # 时间工具模拟数据
```

## 使用方法

### 模拟模式

测试可以在两种模式下运行：

1. **真实模式（Real Mode）**：使用实际API和数据
2. **模拟模式（Mock Mode）**：使用预定义的模拟数据

系统会根据环境变量自动决定使用哪种模式。如果缺少必要的环境变量（如`TEST_AGENT_ID`或`TEST_TOKEN`），将自动切换到模拟模式。

### 代码示例

```typescript
// 导入模拟辅助工具
import mockHelper, { TestMode } from '../mocks/TestMockHelper';

// 检查是否处于模拟模式
const isMockMode = mockHelper.shouldUseMock();

// 强制设置模拟模式
mockHelper.setMode(TestMode.MOCK);

// 重置为默认模式（由环境变量决定）
mockHelper.resetMode();
```

## 增加新的模拟数据

要为新工具添加模拟数据，请在 `data/` 目录下创建新的 `.mock.ts` 文件：

```typescript
// MyCoolTool.mock.ts
import { MockResponse } from '../TestMockHelper';

// 定义模拟数据类型
export interface MyCoolToolData {
  // ...数据字段
}

// 创建模拟数据
export const MOCK_COOL_TOOL_DATA: MyCoolToolData = {
  // ...具体数据
};

// 导出模拟响应
export const MOCK_COOL_TOOL_RESPONSE: MockResponse<MyCoolToolData> = {
  success: true,
  data: MOCK_COOL_TOOL_DATA,
  statusCode: 200
};
```

然后在 `test/integration/tool-calls/helpers.ts` 文件中注册该模拟数据：

```typescript
// 工具映射到模拟响应的字典
const MOCK_RESPONSES: Record<string, any> = {
  'time_tool': MOCK_TIME_RESPONSE,
  'my_cool_tool': MOCK_COOL_TOOL_RESPONSE,  // 添加这一行
};
``` 