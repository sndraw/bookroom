/**
 * 搜索引擎类型映射
 */
export const SEARCH_API_MAP = {
  Tavily: 'Tavily',
  weather: 'weather',
  CustomSearch: 'CustomSearch',
  // 下面是规划中的搜索引擎
  // Baidu: 'Baidu',
  // Bing: 'Bing',
  // Google: 'Google',
} as const;

export type SearchEngineType = keyof typeof SEARCH_API_MAP;

/**
 * 标准化的搜索结果
 */
export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score?: number; // 可选的结果相关性分数
}

/**
 * 搜索适配器接口
 */
export interface SearchAdapter {
  execute(query: string, options?: any): Promise<SearchResult[]>;
}

/**
 * 搜索配置
 */
export interface SearchConfig {
  apiKey: string;
  endpoint?: string;
  [key: string]: any; // 其他可能的配置参数
}

/**
 * 搜索请求参数
 */
export interface SearchRequest {
  query: string;
  engine: SearchEngineType;
  options?: any; // 搜索引擎特有的选项
}
