/**
 * 工具调用相关辅助函数
 */

/**
 * 解析工具调用参数
 * @param rawParams 原始参数字符串
 * @returns 解析后的参数对象
 */
export function parseToolParameters(rawParams: string): Record<string, any> {
  if (typeof rawParams !== 'string') {
    throw new Error('参数必须是字符串');
  }
  
  try {
    return JSON.parse(rawParams || '{}');
  } catch (e) {
    throw new Error('参数格式不正确');
  }
}

/**
 * 验证工具调用参数
 * @param params 参数对象
 * @param requiredFields 必需字段列表
 * @returns 验证结果
 */
export function validateToolParameters(
  params: Record<string, any>,
  requiredFields: string[] = []
): { isValid: boolean; error?: string } {
  // 参数不能为空
  if (!params) {
    return { isValid: false, error: '参数不能为空' };
  }
  
  // 验证必填字段
  for (const field of requiredFields) {
    if (params[field] === undefined) {
      return { isValid: false, error: `缺少必需参数: ${field}` };
    }
  }
  
  return { isValid: true };
}

/**
 * 格式化工具调用结果为标准响应格式
 * @param data 处理结果数据
 * @param error 错误信息
 * @returns 统一格式的响应对象
 */
export function formatToolResult(
  data: any,
  error?: string
): { content: Array<{ type: string; text: string }>; isError: boolean } {
  if (error) {
    return {
      content: [{ type: 'text', text: error }],
      isError: true
    };
  }
  
  // 如果数据已经符合格式要求，直接返回
  if (data && Array.isArray(data.content) && 'isError' in data) {
    return data;
  }
  
  // 将任意数据格式化为标准格式
  return {
    content: [
      {
        type: 'text',
        text: typeof data === 'string' ? data : JSON.stringify(data)
      }
    ],
    isError: false
  };
} 