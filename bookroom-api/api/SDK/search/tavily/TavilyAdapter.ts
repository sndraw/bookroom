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
  }

  /**
   * 执行搜索
   * @param query 搜索查询
   * @param options 可选参数
   * @returns 标准化的搜索结果数组
   */
  async execute(query: string, options?: any): Promise<SearchResult[]> {
    try {
      // 构建请求
      const response = await httpClient.post(
        this.endpoint,
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      // 处理响应
      if (response.status === 200 && response.data) {
        // 如果没有结果，返回空数组
        if (!response.data.results || !Array.isArray(response.data.results)) {
          return [];
        }

        // 将 Tavily 特定格式转换为标准格式
        return response.data.results.map((result: any) => ({
          title: result.title || '',
          url: result.url || '',
          content: result.content || '',
          score: result.score
        }));
      }

      return [];
    } catch (error: any) {
      // 处理各种错误情况
      if (error.response) {
        const { status } = error.response;
        
        switch (status) {
          case 401:
            throw new AuthenticationError('Tavily API authentication failed. Please check your API key.');
          case 403:
            throw new UsageLimitError('Tavily API usage limit exceeded.');
          case 429:
            throw new RateLimitError('Tavily API rate limit exceeded. Please try again later.');
          case 500:
          case 502:
          case 503:
          case 504:
            throw new ApiServerError(`Tavily API server error: ${status}`);
          default:
            throw new Error(`Unexpected error from Tavily API: ${status}`);
        }
      }

      // 处理网络错误
      if (error.request) {
        throw new NetworkError(`Network error when calling Tavily API: ${error.message}`);
      }

      // 解析错误或其他错误
      if (typeof error.message === 'string' && error.message.includes('JSON')) {
        throw new ApiResponseParseError(`Failed to parse Tavily API response: ${error.message}`);
      }

      // 重新抛出其他错误
      throw error;
    }
  }
} 