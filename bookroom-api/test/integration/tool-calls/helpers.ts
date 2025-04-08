/**
 * 工具调用测试辅助函数
 */
import axios from 'axios';
import mockHelper from '../../mocks/TestMockHelper';
import { MOCK_TIME_RESPONSE } from '../../mocks/data/TimeTool.mock';

// 工具调用选项
export interface ToolCallOptions {
  forceMock?: boolean;
  timeout?: number;
  agentId?: string;
}

// 工具映射到模拟响应的字典
const MOCK_RESPONSES: Record<string, any> = {
  'time_tool': MOCK_TIME_RESPONSE,
  // 可以根据需要添加其他工具的模拟响应
};

/**
 * 调用工具API
 * 支持真实API调用和模拟模式
 * 
 * @param toolName 工具名称
 * @param params 工具参数
 * @param options 调用选项
 * @returns 工具调用结果
 */
export async function callToolAPI(
  toolName: string, 
  params: Record<string, any> = {}, 
  options: ToolCallOptions = {}
): Promise<any> {
  // 检查是否应该使用模拟模式
  const useMock = options.forceMock ?? mockHelper.shouldUseMock();
  
  // 如果使用模拟模式，返回预定义的模拟响应
  if (useMock) {
    console.log(`[模拟模式] 调用工具: ${toolName}`);
    return MOCK_RESPONSES[toolName] || {
      success: true,
      data: { message: `[模拟响应] 工具 ${toolName} 被调用` },
      statusCode: 200
    };
  }
  
  // 使用实际API
  const apiUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  const agentId = options.agentId || process.env.TEST_AGENT_ID;
  const token = process.env.TEST_TOKEN;
  
  if (!agentId || !token) {
    throw new Error('缺少必要的环境变量：TEST_AGENT_ID 或 TEST_TOKEN');
  }
  
  try {
    const response = await axios.post(
      `${apiUrl}/api/agent/${agentId}/tool/${toolName}`,
      params,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: options.timeout || 10000
      }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`工具调用错误: ${toolName}`, error.response?.data || error.message);
      return {
        error: error.response?.data?.error || error.message,
        statusCode: error.response?.status || 500
      };
    }
    
    console.error(`工具调用未知错误: ${toolName}`, error);
    return {
      error: '未知错误',
      statusCode: 500
    };
  }
}

/**
 * 设置模拟模式状态
 * 
 * @param mockEnabled 是否启用模拟模式
 */
export function setMockMode(mockEnabled: boolean): void {
  if (mockEnabled) {
    mockHelper.setMode('mock' as any);
  } else {
    mockHelper.resetMode();
  }
} 