import axios from 'axios';
import { AxiosRequestConfig } from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载测试环境配置
try {
  const envPath = path.resolve(process.cwd(), '.env.test.local');
  dotenv.config({ path: envPath });
} catch (error) {
  console.warn('无法加载测试环境配置文件，将使用模拟数据');
}

// 模拟数据 - 当未设置环境变量时使用
const MOCK_RESPONSES: Record<string, any> = {
  'time_tool': {
    result: '2023-05-15T10:30:00.000Z',
    isError: false
  },
  'search_tool': {
    result: '搜索结果：\n1. 测试结果 1\n   https://example.com/result1\n   测试结果内容 1...',
    isError: false
  },
  'weather_tool': {
    result: '北京天气：晴，温度25°C，湿度45%',
    isError: false
  },
  'error': {
    error: true,
    message: '工具调用失败：参数错误'
  }
};

// 模拟模式标志
let MOCK_MODE = !process.env.TEST_AGENT_ID || !process.env.TEST_TOKEN;
// 允许强制开启或关闭模拟模式的函数
export function setMockMode(enabled: boolean): void {
  MOCK_MODE = enabled;
  console.log(`已${MOCK_MODE ? '启用' : '禁用'}模拟模式`);
}

/**
 * 工具调用API测试辅助函数
 * @param toolName 工具名称
 * @param parameters 工具参数
 * @param options 可选配置
 * @returns API响应结果
 */
export async function callToolAPI(
  toolName: string,
  parameters: Record<string, any>,
  options: {
    agentId?: string;
    stream?: boolean;
    apiUrl?: string;
    token?: string;
    timeout?: number;
    forceMock?: boolean; // 强制使用模拟数据
  } = {}
) {
  // 如果强制模拟或者处于模拟模式
  if (options.forceMock || MOCK_MODE) {
    console.log(`[测试] 使用模拟数据执行工具 ${toolName}`);
    
    // 等待一小段时间模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 处理特殊情况
    if (toolName === 'nonexistent_tool') {
      return {
        error: true,
        status: 404,
        message: '工具不存在'
      };
    }
    
    // 参数验证错误
    if (toolName === 'time_tool' && parameters.format === 'INVALID_FORMAT') {
      return {
        error: true,
        message: '无效的时间格式'
      };
    }
    
    // 参数缺失错误
    if ((toolName === 'time_tool' && Object.keys(parameters).length === 0) ||
        (toolName === 'weather_tool' && !parameters.location)) {
      return {
        error: true,
        message: '缺少必需参数'
      };
    }
    
    // 搜索引擎错误
    if (toolName === 'search_tool' && parameters.engine === 'NonExistentEngine') {
      return {
        error: true,
        message: '搜索引擎不存在'
      };
    }
    
    // 返回模拟数据
    const response = MOCK_RESPONSES[toolName] || MOCK_RESPONSES.error;
    if (response.error) {
      return response;
    }
    
    return {
      result: response.result,
      content: [{ type: 'text', text: response.result }],
      isError: false
    };
  }
  
  // 从环境变量或参数获取配置
  const apiUrl = options.apiUrl || process.env.TEST_API_URL || 'http://localhost:5001/api/v1';
  const agentId = options.agentId || process.env.TEST_AGENT_ID;
  const token = options.token || process.env.TEST_TOKEN;
  const stream = options.stream !== undefined ? options.stream : false;
  
  if (!agentId) {
    console.warn('警告: 未设置 TEST_AGENT_ID 环境变量或提供 agentId 参数');
    throw new Error('缺少必要的 Agent ID');
  }
  
  if (!token) {
    console.warn('警告: 未设置 TEST_TOKEN 环境变量或提供 token 参数');
    throw new Error('缺少必要的认证令牌');
  }

  const config: AxiosRequestConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    timeout: options.timeout || 30000 // 默认30秒超时
  };

  try {
    const response = await axios.post(
      `${apiUrl}/agents/${agentId}/tool-calls`,
      {
        tool_name: toolName,
        parameters,
        stream
      },
      config
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        error: true,
        status: error.response.status,
        message: error.response.data
      };
    }
    throw error;
  }
}

/**
 * 测试结果验证器
 */
export function verifyToolResult(result: any, expectedType?: string): boolean {
  if (!result || typeof result !== 'object') return false;
  if (result.error === true) return false;
  
  // 验证结果存在
  if (!result.result && !result.content) return false;
  
  // 如果检查内容
  if (result.content) {
    if (!Array.isArray(result.content) || result.content.length === 0) {
      return false;
    }
  }
  
  // 如果指定了类型检查
  if (expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof result.result === 'string';
      case 'number':
        return typeof result.result === 'number';
      case 'boolean':
        return typeof result.result === 'boolean';
      case 'object':
        return typeof result.result === 'object';
      case 'array':
        return Array.isArray(result.result);
      case 'iso-date':
        // 验证ISO日期格式
        return typeof result.result === 'string' &&
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(result.result);
      default:
        return true;
    }
  }
  
  return true;
} 