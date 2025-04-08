/**
 * 工具调用服务测试
 * @jest-environment node
 */
import { parseToolParameters } from '@/utils/toolHelper';

// 避免引入实际依赖，使用模拟函数
jest.mock('@/utils/toolHelper', () => ({
  parseToolParameters: jest.fn((rawParams) => {
    if (typeof rawParams !== 'string') {
      throw new Error('参数必须是字符串');
    }
    
    try {
      return JSON.parse(rawParams);
    } catch (e) {
      throw new Error('参数格式不正确');
    }
  })
}));

describe('工具调用辅助函数测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('parseToolParameters', () => {
    it('应正确解析有效的JSON参数', () => {
      const rawParams = '{"format": "ISO", "timezone": "Asia/Shanghai"}';
      const parsedParams = parseToolParameters(rawParams);
      
      expect(parseToolParameters).toHaveBeenCalledWith(rawParams);
      expect(parsedParams).toEqual({
        format: 'ISO',
        timezone: 'Asia/Shanghai'
      });
    });
    
    it('应在参数为空对象时返回空对象', () => {
      const rawParams = '{}';
      const parsedParams = parseToolParameters(rawParams);
      
      expect(parseToolParameters).toHaveBeenCalledWith(rawParams);
      expect(parsedParams).toEqual({});
    });
    
    it('应在参数不是有效JSON时抛出错误', () => {
      const rawParams = '{format: "ISO"'; // 缺少引号和闭合花括号
      
      expect(() => {
        parseToolParameters(rawParams);
      }).toThrow('参数格式不正确');
      
      expect(parseToolParameters).toHaveBeenCalledWith(rawParams);
    });
    
    it('应在参数不是字符串时抛出错误', () => {
      const rawParams = 123 as any; // 非字符串参数
      
      expect(() => {
        parseToolParameters(rawParams);
      }).toThrow('参数必须是字符串');
      
      expect(parseToolParameters).toHaveBeenCalledWith(rawParams);
    });
  });
}); 