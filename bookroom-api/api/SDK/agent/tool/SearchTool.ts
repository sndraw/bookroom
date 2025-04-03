import { SearchRequest, SearchResult, SearchAdapter, SearchEngineType } from '../../../common/search';
import { ConfigurationError, UnsupportedEngineError, ValidationError } from '../../../common/errors';
import { TavilyAdapter } from '../../search/tavily/TavilyAdapter';
import { WeatherAdapter } from '../../search/weather/WeatherAdapter';
// 可以添加更多适配器的导入

// 搜索工具类，提供给 Agent 调用
export default class SearchTool {
  private engineAdapters: Map<SearchEngineType, SearchAdapter>;
  private config: Record<string, any>;

  /**
   * 构造函数
   * @param config 包含各搜索引擎配置的对象
   */
  constructor(config: Record<string, any> = {}) {
    this.config = config;
    this.engineAdapters = new Map();
    this.initAdapters();
  }

  /**
   * 初始化各搜索引擎的适配器
   */
  private initAdapters(): void {
    // 根据配置初始化各个适配器
    if (this.config.tavily?.apiKey) {
      this.engineAdapters.set('Tavily', new TavilyAdapter(this.config.tavily.apiKey));
    }

    if (this.config.weather?.apiKey) {
      this.engineAdapters.set('weather', new WeatherAdapter(this.config.weather.apiKey));
    }

    // 可以添加更多搜索引擎的初始化
  }

  /**
   * 获取配置对象（用于测试）
   * @returns 配置对象
   */
  getConfig(): Record<string, any> {
    return this.config;
  }

  /**
   * 获取指定搜索引擎的适配器
   * @param engine 搜索引擎类型
   * @returns 搜索适配器实例
   */
  getAdapter(engine: SearchEngineType): SearchAdapter | undefined {
    return this.engineAdapters.get(engine);
  }

  /**
   * 执行搜索
   * @param params 搜索请求参数
   * @returns 搜索结果数组
   */
  async execute(params: SearchRequest): Promise<SearchResult[]> {
    const { query, engine, options } = params;

    // 验证查询字符串
    if (!query || query.trim() === '') {
      throw new ValidationError('Query cannot be empty');
    }

    // 获取对应的搜索引擎适配器
    const adapter = this.getAdapter(engine);
    if (!adapter) {
      throw new UnsupportedEngineError(engine);
    }

    try {
      // 使用适配器执行搜索
      return await adapter.execute(query, options);
    } catch (error) {
      // 重新抛出错误，保持原始错误的类型和消息
      throw error;
    }
  }
}