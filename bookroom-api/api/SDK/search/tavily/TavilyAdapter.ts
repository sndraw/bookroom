import { SearchAdapter, SearchResult } from '../../../common/search';
import {
  AuthenticationError,
  UsageLimitError,
  RateLimitError,
  ApiServerError,
  NetworkError,
  ApiResponseParseError
} from '../../../common/errors';
import httpClient from '../../../utils/httpClient';

/**
 * Tavily 搜索引擎适配器
 */
export class TavilyAdapter implements SearchAdapter {
  private apiKey: string;
  private endpoint: string;

  /**
   * 构造函数
   * @param apiKey Tavily API Key
   * @param endpoint 可选的自定义API端点
   */
  constructor(apiKey: string, endpoint: string = 'https://api.tavily.com/search') {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
    console.log(`[TavilyAdapter] 初始化，API端点: ${this.endpoint}`);
  }

  /**
   * 执行搜索
   * @param query 搜索查询
   * @param options 可选参数
   * @returns 标准化的搜索结果数组
   */
  async execute(query: string, options?: any): Promise<SearchResult[]> {
    console.log(`[TavilyAdapter] 开始搜索: "${query}"`);
    try {
      // 构建请求
      console.log(`[TavilyAdapter] 发送请求到API服务`);
      const requestData = { 
        query,
        search_depth: "advanced",  // 确保使用高级搜索模式
        include_answer: true,      // 请求包含AI生成的答案
        include_raw_content: false, // 不包含原始内容以减少响应大小
        ...options
      };
      
      const response = await httpClient.post(
        this.endpoint,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 30000 // 30秒超时
        }
      );

      // 处理响应
      console.log(`[TavilyAdapter] 收到响应，状态码: ${response.status}`);
      if (response.status === 200 && response.data) {
        console.log(`[TavilyAdapter] 响应数据类型: ${typeof response.data}`);
        console.log(`[TavilyAdapter] 响应数据有结果: ${response.data.results ? '是' : '否'}`);
        
        // 如果没有结果，返回空数组
        if (!response.data.results || !Array.isArray(response.data.results)) {
          console.error(`[TavilyAdapter] 搜索结果为空或不是数组`);
          
          // 如果有answer字段，记录它
          if (response.data.answer) {
            console.log(`[TavilyAdapter] Tavily生成的答案: ${response.data.answer}`);
          }
          
          return [];
        }

        console.log(`[TavilyAdapter] 找到 ${response.data.results.length} 条结果`);
        
        // 将 Tavily 特定格式转换为标准格式
        const results = response.data.results.map((result: any) => ({
          title: result.title || '无标题',
          url: result.url || '#',
          content: result.content || '无内容',
          score: result.score
        }));
        
        console.log(`[TavilyAdapter] 返回 ${results.length} 条标准化结果`);
        return results;
      } else {
        console.error(`[TavilyAdapter] 响应无效，状态码: ${response.status}`);
        if (response.data && response.data.detail) {
          console.error(`[TavilyAdapter] 错误详情: ${response.data.detail}`);
        }
        throw new ApiServerError('Tavily API返回无效响应');
      }
    } catch (error: any) {
      console.error(`[TavilyAdapter] 搜索出错:`, error);
      
      // 处理特定错误类型
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        console.error(`[TavilyAdapter] HTTP错误 ${status}`);
        
        if (status === 401) {
          console.error('[TavilyAdapter] 认证错误: API密钥无效');
          throw new AuthenticationError('Tavily API密钥无效或已过期');
        } else if (status === 403) {
          console.error('[TavilyAdapter] 权限错误: API使用超出限制');
          throw new UsageLimitError('Tavily API使用超出限制，请升级您的计划');
        } else if (status === 429) {
          console.error('[TavilyAdapter] 频率限制: 请求过多');
          throw new RateLimitError('Tavily API请求频率过高，请稍后再试');
        } else if (status >= 500) {
          console.error('[TavilyAdapter] 服务器错误: Tavily API服务异常');
          throw new ApiServerError('Tavily API服务器错误，请稍后再试');
        } else {
          console.error(`[TavilyAdapter] 未知HTTP错误: ${status}`);
          throw new ApiServerError(`Tavily API返回未预期的响应状态: ${status}`);
        }
      } else if (error.request) {
        // 请求已发送但未收到响应
        console.error(`[TavilyAdapter] 网络错误: 无法连接到 Tavily API`);
        throw new NetworkError('无法连接到 Tavily API，请检查网络连接');
      } else if (error.message && error.message.includes('timeout')) {
        console.error(`[TavilyAdapter] 超时错误: Tavily API请求超时`);
        throw new NetworkError('Tavily API请求超时，服务可能暂时不可用');
      }
      
      // 重新抛出原始错误
      throw error;
    }
  }
} 