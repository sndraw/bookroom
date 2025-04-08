/**
 * TimeTool 工具模拟数据
 */
import { MockResponse } from '../TestMockHelper';

export interface TimeToolResponse {
  time: string;         // ISO格式时间字符串
  timestamp: number;    // 时间戳（毫秒）
  timezone: string;     // 时区
  date: string;         // 本地日期
  weekday: string;      // 星期几
}

// 提供固定的模拟数据，便于测试验证
export const MOCK_TIME_DATA: TimeToolResponse = {
  time: "2023-05-15T08:30:00.000Z",
  timestamp: 1684139400000,
  timezone: "Asia/Shanghai",
  date: "2023-05-15",
  weekday: "Monday"
};

// 模拟时间工具调用响应
export const MOCK_TIME_RESPONSE: MockResponse<TimeToolResponse> = {
  success: true,
  data: MOCK_TIME_DATA,
  statusCode: 200
};

// 生成动态的模拟时间数据（用于需要当前时间的场景）
export function generateDynamicTimeData(): TimeToolResponse {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return {
    time: now.toISOString(),
    timestamp: now.getTime(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    date: now.toISOString().split('T')[0],
    weekday: days[now.getDay()]
  };
}

// 生成动态的模拟时间响应
export function generateDynamicTimeResponse(): MockResponse<TimeToolResponse> {
  return {
    success: true,
    data: generateDynamicTimeData(),
    statusCode: 200
  };
} 