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
    console.log(`[SearchTool] 初始化，配置:`, JSON.stringify(config));
  }

  /**
   * 初始化各搜索引擎的适配器
   */
  private initAdapters(): void {
    console.log(`[SearchTool] 初始化搜索适配器`);
    
    // 确定要初始化的引擎类型
    let engineType = this.config.engine || this.config.code;
    if (engineType && typeof engineType === 'string') {
      // 确保首字母大写
      engineType = engineType.charAt(0).toUpperCase() + engineType.slice(1);
      
      console.log(`[SearchTool] 检测到引擎类型: ${engineType}`);
      
      // 根据引擎类型初始化对应的适配器
      if (engineType === 'Tavily') {
        if (this.config.apiKey) {
          console.log(`[SearchTool] 初始化Tavily适配器成功`);
          this.engineAdapters.set('Tavily', new TavilyAdapter(this.config.apiKey));
        } else {
          console.log(`[SearchTool] 无法初始化Tavily适配器，缺少API密钥`);
        }
      } else if (engineType === 'Weather') {
        if (this.config.apiKey) {
          console.log(`[SearchTool] 初始化Weather适配器成功`);
          this.engineAdapters.set('weather', new WeatherAdapter(this.config.apiKey));
        } else {
          console.log(`[SearchTool] 无法初始化Weather适配器，缺少API密钥`);
        }
      } else {
        console.log(`[SearchTool] 未知的引擎类型: ${engineType}`);
      }
    } else {
      // 向下兼容旧的初始化方式
      let tavilyApiKey = this.config.tavily?.apiKey;
      
      // 如果在tavily子对象中找不到apiKey，尝试在顶层配置中查找
      if (!tavilyApiKey && this.config.apiKey && this.config.code === 'Tavily') {
        console.log(`[SearchTool] 在顶层配置中找到Tavily API密钥`);
        tavilyApiKey = this.config.apiKey;
      }
      
      if (tavilyApiKey) {
        console.log(`[SearchTool] 初始化Tavily适配器成功`);
        this.engineAdapters.set('Tavily', new TavilyAdapter(tavilyApiKey));
      } else {
        console.log(`[SearchTool] 未找到Tavily API密钥，跳过初始化`);
      }
  
      let weatherApiKey = this.config.weather?.apiKey;
      
      // 如果在weather子对象中找不到apiKey，尝试在顶层配置中查找
      if (!weatherApiKey && this.config.apiKey && this.config.code === 'weather') {
        console.log(`[SearchTool] 在顶层配置中找到Weather API密钥`);
        weatherApiKey = this.config.apiKey;
      }
      
      if (weatherApiKey) {
        console.log(`[SearchTool] 初始化Weather适配器成功`);
        this.engineAdapters.set('weather', new WeatherAdapter(weatherApiKey));
      } else {
        console.log(`[SearchTool] 未找到Weather API密钥，跳过初始化`);
      }
    }

    // 可以添加更多搜索引擎的初始化
    console.log(`[SearchTool] 初始化完成，可用引擎:`, Array.from(this.engineAdapters.keys()).join(', '));
  }

  /**
   * 获取工具的配置信息
   * @returns 配置信息
   */
  getConfig() {
    return {
      engineAdapters: Array.from(this.engineAdapters.keys()),
      config: this.config
    };
  }

  /**
   * 获取指定搜索引擎的适配器
   * @param engine 搜索引擎类型
   * @returns 搜索适配器实例
   */
  getAdapter(engine: SearchEngineType): SearchAdapter | undefined {
    // 直接匹配
    let adapter = this.engineAdapters.get(engine);
    
    // 如果没找到，尝试不区分大小写匹配
    if (!adapter) {
      // 获取所有可用的引擎名称
      const availableEngines = Array.from(this.engineAdapters.keys());
      
      // 尝试不区分大小写匹配
      const matchedEngine = availableEngines.find(
        e => e.toLowerCase() === engine.toLowerCase()
      );
      
      if (matchedEngine) {
        console.log(`[SearchTool] 引擎名称大小写不匹配，使用 ${matchedEngine} 代替 ${engine}`);
        adapter = this.engineAdapters.get(matchedEngine);
      }
    }
    
    console.log(`[SearchTool] 获取${engine}适配器:`, adapter ? '成功' : '失败');
    
    return adapter;
  }

  /**
   * 执行搜索
   * @param params 搜索参数
   * @returns 搜索结果数组或格式化为工具返回结果
   */
  async execute(params: any): Promise<any> {
    console.log(`[SearchTool] 执行搜索:`, JSON.stringify(params, null, 2));
    
    try {
      // 参数验证
      if (!params.engine) {
        console.error('[SearchTool] 错误: 搜索引擎未指定');
        return {
          content: [{ type: "text", text: "搜索错误: 未指定搜索引擎" }],
          isError: true
        };
      }
      
      if (!params.query || typeof params.query !== 'string' || params.query.trim() === '') {
        console.error('[SearchTool] 错误: 查询内容为空');
        return {
          content: [{ type: "text", text: "搜索错误: 查询内容不能为空" }],
          isError: true
        };
      }
      
      console.log(`[SearchTool] 查询内容: "${params.query}"`);
      console.log(`[SearchTool] 使用引擎: ${params.engine}`);
      
      // 尝试规范化引擎名称，使首字母大写
      let engineName = params.engine;
      if (typeof engineName === 'string') {
        // 如果是全小写，尝试转换为首字母大写
        if (engineName === engineName.toLowerCase() && engineName.length > 1) {
          const normalizedName = engineName.charAt(0).toUpperCase() + engineName.slice(1);
          console.log(`[SearchTool] 规范化引擎名称: ${engineName} -> ${normalizedName}`);
          engineName = normalizedName;
        }
      }
      
      // 获取适配器
      const adapter = this.getAdapter(engineName);
      if (!adapter) {
        // 列出所有可用引擎
        const availableEngines = Array.from(this.engineAdapters.keys());
        
        console.error(`[SearchTool] 错误: 未找到引擎适配器 ${engineName}`);
        console.log(`[SearchTool] 可用适配器: ${availableEngines.join(', ') || '无'}`);
        
        if (availableEngines.length > 0) {
          // 建议使用可用的引擎
          return {
            content: [{ type: "text", text: `搜索错误: 未找到搜索引擎 "${engineName}"。可用的搜索引擎有: ${availableEngines.join(', ')}` }],
            isError: true
          };
        } else {
          return {
            content: [{ type: "text", text: `搜索错误: 系统中没有配置可用的搜索引擎。请联系管理员添加搜索引擎配置。` }],
            isError: true
          };
        }
      }
      
      // 执行搜索
      console.log(`[SearchTool] 开始执行搜索...`);
      const startTime = Date.now();
      try {
        console.log(`[SearchTool] 调用适配器执行搜索...`);
        const results = await adapter.execute(params.query, params.options);
        const endTime = Date.now();
        console.log(`[SearchTool] 搜索完成，耗时: ${endTime - startTime}ms`);
        
        console.log(`[SearchTool] 结果数量: ${results ? results.length : 0}`);
        
        // 如果没有结果，记录详细信息
        if (!results || results.length === 0) {
          console.log(`[SearchTool] 警告: 没有搜索结果`);
          
          return {
            content: [{ 
              type: "text", 
              text: `我使用${engineName}搜索了"${params.query}"，但没有找到相关结果。请尝试使用其他关键词。` 
            }],
            isError: false
          };
        }
        
        // 处理结果
        console.log(`[SearchTool] 处理搜索结果...`);
        
        // 确保结果中的每个项都有必要的属性
        const validResults = results.filter((result, idx) => {
          if (!result || typeof result !== 'object') {
            console.error(`[SearchTool] 跳过无效结果类型: ${typeof result}`);
            return false;
          }
          
          if (!result.title) {
            result.title = '无标题';
          }
          
          if (!result.url) {
            result.url = '#';
          }
          
          if (!result.content) {
            result.content = '无内容描述';
          }
          
          return true;
        });
        
        console.log(`[SearchTool] 有效结果数量: ${validResults.length}/${results.length}`);
        
        const formattedResults = validResults.map((result, index) => {
          return `${index + 1}. ${result.title}\n   ${result.url}\n   ${result.content?.substring(0, 300)}${result.content?.length > 300 ? '...' : ''}`;
        }).join('\n\n');
        
        console.log(`[SearchTool] 返回格式化结果，总长度: ${formattedResults.length}`);
        
        if (formattedResults.length === 0) {
          console.error(`[SearchTool] 警告: 格式化后的结果为空字符串!`);
          return {
            content: [{ 
              type: "text", 
              text: `搜索结果处理出错，未能获取有效内容。请稍后再试或修改搜索词。` 
            }],
            isError: true
          };
        }
        
        const response = {
          content: [{ 
            type: "text", 
            text: `搜索结果：\n${formattedResults}` 
          }],
          isError: false
        };
        
        // 记录返回内容摘要
        console.log(`[SearchTool] 返回内容摘要: ${response.content[0].text.substring(0, 100)}...`);
        return response;
      } catch (adapterError: any) {
        console.error(`[SearchTool] 适配器执行错误:`, adapterError);
        throw adapterError; // 重新抛出，让外层catch处理
      }
      
    } catch (error: any) {
      console.error(`[SearchTool] 搜索出错:`, error);
      
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