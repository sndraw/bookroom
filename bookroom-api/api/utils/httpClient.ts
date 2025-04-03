/**
 * 简单的 HTTP 客户端封装
 */

interface RequestOptions {
  headers?: Record<string, string>;
  [key: string]: any;
}

interface Response {
  status: number;
  data: any;
  headers?: Record<string, string>;
  request?: any;
}

/**
 * 执行 HTTP 请求的工具
 */
const httpClient = {
  /**
   * 发送 POST 请求
   * @param url 请求 URL
   * @param data 请求体数据
   * @param options 请求选项
   * @returns 响应对象
   */
  async post(url: string, data: any, options: RequestOptions = {}): Promise<Response> {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        ...options
      });

      // 解析响应数据
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // 构建统一的响应格式
      const result: Response = {
        status: response.status,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries())
      };

      // 对非 2xx 状态码抛出异常
      if (!response.ok) {
        const error: any = new Error(`Request failed with status ${response.status}`);
        error.response = result;
        throw error;
      }

      return result;
    } catch (error: any) {
      // 确保网络错误和其他错误都有一致的格式
      if (!error.response) {
        error.request = { url, method: 'POST', data };
      }
      throw error;
    }
  }
};

export default httpClient; 