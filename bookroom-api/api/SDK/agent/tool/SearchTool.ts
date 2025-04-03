import { SearchRequest, SearchResult, SearchAdapter, SearchEngineType } from '../../../common/search';
import { ConfigurationError, UnsupportedEngineError, ValidationError } from '../../../common/errors';
import { TavilyAdapter } from '../../search/tavily/TavilyAdapter';
import { WeatherAdapter } from '../../search/weather/WeatherAdapter';
import { Tool } from './typings';
// 可以添加更多适配器的导入

// 搜索工具类，提供给 Agent 调用
export default class SearchTool implements Tool {
  private engineAdapters: Map<SearchEngineType, SearchAdapter>;
  private config: Record<string, any>;
  public name = "search_tool";
  public version = "1.0";
  public description = "Search the web for information | 在网络上搜索信息";
  public parameters = {
    type: "object",
    properties: {
      query: { type: "string", description: "搜索查询内容" },
      engine: { type: "string", description: "搜索引擎类型，如'Tavily'" }
    },
    required: ["query", "engine"]
  };

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
   * @returns 搜索结果数组或格式化为工具返回结果
   */
  async execute(params: SearchRequest): Promise<any> {
    try {
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

      // 使用适配器执行搜索
      const results = await adapter.execute(query, options);
      
      // 格式化返回结果，以符合工具调用的标准格式
      return {
        content: [{ 
          type: "text", 
          text: `搜索结果：${JSON.stringify(results)}` 
        }],
        isError: false
      };
    } catch (error: any) {
      // 返回错误信息，以符合工具调用的标准格式
      return {
        content: [{ 
          type: "text", 
          text: `搜索出错: ${error.message || '未知错误'}` 
        }],
        isError: true
      };
    }
  }
}