/**
 * 工具调用辅助函数测试
 * @jest-environment node
 */
import { parseToolParameters, validateToolParameters, formatToolResult } from './toolHelper';

describe('工具调用辅助函数测试', () => {
  describe('parseToolParameters', () => {
    it('应正确解析有效的JSON参数', () => {
      const rawParams = '{"format": "ISO", "timezone": "Asia/Shanghai"}';
      const result = parseToolParameters(rawParams);
      
      expect(result).toEqual({
        format: 'ISO',
        timezone: 'Asia/Shanghai'
      });
    });
    
    it('应在参数为空字符串时返回空对象', () => {
      const result = parseToolParameters('');
      expect(result).toEqual({});
    });
    
    it('应在参数不是有效JSON时抛出错误', () => {
      expect(() => {
        parseToolParameters('{format: "ISO"}'); // 缺少引号
      }).toThrow('参数格式不正确');
    });
    
    it('应在参数不是字符串时抛出错误', () => {
      expect(() => {
        parseToolParameters(123 as any);
      }).toThrow('参数必须是字符串');
    });
  });
  
  describe('validateToolParameters', () => {
    it('应在参数都存在时返回有效', () => {
      const params = { format: 'ISO', timezone: 'Asia/Shanghai' };
      const result = validateToolParameters(params, ['format', 'timezone']);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
    
    it('应在参数为空时返回无效', () => {
      const result = validateToolParameters(null as any);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('参数不能为空');
    });
    
    it('应在缺少必需参数时返回无效', () => {
      const params = { format: 'ISO' };
      const result = validateToolParameters(params, ['format', 'timezone']);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('缺少必需参数: timezone');
    });
    
    it('应在无必需参数时默认有效', () => {
      const params = {};
      const result = validateToolParameters(params);
      
      expect(result.isValid).toBe(true);
    });
  });
  
  describe('formatToolResult', () => {
    it('应格式化字符串响应', () => {
      const result = formatToolResult('测试响应');
      
      expect(result).toEqual({
        content: [{ type: 'text', text: '测试响应' }],
        isError: false
      });
    });
    
    it('应格式化对象响应', () => {
      const data = { value: 123, name: 'test' };
      const result = formatToolResult(data);
      
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(data) }],
        isError: false
      });
    });
    
    it('应处理错误响应', () => {
      const result = formatToolResult(null, '发生错误');
      
      expect(result).toEqual({
        content: [{ type: 'text', text: '发生错误' }],
        isError: true
      });
    });
    
    it('应传递已格式化的响应', () => {
      const formattedData = {
        content: [{ type: 'text', text: '已格式化的响应' }],
        isError: false
      };
      
      const result = formatToolResult(formattedData);
      
      expect(result).toBe(formattedData);
    });
  });
}); 