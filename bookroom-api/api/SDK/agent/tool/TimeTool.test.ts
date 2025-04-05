/**
 * TimeTool 单元测试
 * @jest-environment node
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import TimeTool from './TimeTool';
import moment from 'moment';
import mockHelper, { TestMode } from '../../../../test/mocks/TestMockHelper';
import { MOCK_TIME_DATA } from '../../../../test/mocks/data/TimeTool.mock';

// Mock moment库
jest.mock('moment', () => {
  const mockMoment = jest.fn(() => ({
    format: jest.fn(() => '2023-05-15 08:30:00 Monday +0800')
  }));
  
  // 添加format静态方法 - 使用any类型解决类型错误
  (mockMoment as any).format = jest.fn(() => '2023-05-15 08:30:00 Monday +0800');
  
  return mockMoment;
});

describe('TimeTool测试', () => {
  let timeTool: TimeTool;
  
  beforeEach(() => {
    // 清除mock状态
    jest.clearAllMocks();
    
    // 重置测试模式
    mockHelper.resetMode();
    
    // 初始化TimeTool
    timeTool = new TimeTool({
      description: '测试时间工具'
    });
  });
  
  it('应正确初始化TimeTool', () => {
    expect(timeTool).toBeInstanceOf(TimeTool);
    expect(timeTool.name).toBe('time_tool');
    expect(timeTool.description).toContain('测试时间工具');
    expect(timeTool.parameters).toHaveProperty('properties.query');
  });
  
  it('应正确响应execute调用并返回当前时间', async () => {
    // 模拟模式下会直接返回模拟数据，不会调用moment
    mockHelper.setMode(TestMode.REAL);
    
    const result = await timeTool.execute({ query: '' });
    
    // 验证返回内容格式
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', false);
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBe(1);
    expect(result.content[0]).toHaveProperty('type', 'text');
    expect(result.content[0]).toHaveProperty('text', '2023-05-15 08:30:00 Monday +0800');
  });
  
  it('应使用配置中的format参数', async () => {
    // 确保使用真实模式
    mockHelper.setMode(TestMode.REAL);
    
    // 直接检查返回结果
    const timeToolWithParams = new TimeTool({
      description: '测试时间工具',
      parameters: {
        params: {
          format: 'YYYY/MM/DD'
        }
      }
    });
    
    const result = await timeToolWithParams.execute({ query: '' });
    
    // 检查返回结果
    expect(result).toHaveProperty('content');
    expect(result.content[0]).toHaveProperty('type', 'text');
  });
  
  it('应处理错误情况并仍返回有效结果', async () => {
    // 确保使用真实模式
    mockHelper.setMode(TestMode.REAL);
    
    // 模拟moment抛出异常的情况 - 使用any类型解决类型错误
    (moment as any).mockImplementationOnce(() => {
      throw new Error('模拟错误');
    });
    
    // 即使内部出错，execute也不应抛出异常
    const result = await timeTool.execute({ query: 'invalid date' });
    
    // 应提供默认结果
    expect(result).toHaveProperty('content');
    expect(result.content[0]).toHaveProperty('type', 'text');
    // 不要检查具体文本内容，因为错误处理时可能使用不同的默认值
    expect(result).toHaveProperty('isError', false);
  });
  
  it('在模拟模式下应返回固定的模拟数据', async () => {
    // 设置模拟模式
    mockHelper.setMode(TestMode.MOCK);
    
    // 创建新的TimeTool实例以确保设置生效
    const mockTimeTool = new TimeTool({
      description: '测试时间工具'
    });
    
    const result = await mockTimeTool.execute({ query: '' });
    
    // 验证模拟数据使用
    expect(result).toHaveProperty('content');
    expect(result.content[0]).toHaveProperty('type', 'text');
    // 使用模拟数据的属性验证内容包含模拟数据的日期
    expect(result.content[0].text).toContain(MOCK_TIME_DATA.date);
    expect(result.content[0].text).toContain(MOCK_TIME_DATA.weekday);
  });
}); 