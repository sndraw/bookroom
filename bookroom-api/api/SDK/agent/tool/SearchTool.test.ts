/**
 * @jest-environment node
 */
import SearchTool from './SearchTool';
import { TavilyAdapter } from '@/SDK/search/tavily/TavilyAdapter';
import { WeatherAdapter } from '@/SDK/search/weather/WeatherAdapter';
import {
    SearchResult,
    SearchAdapter
} from '@/common/search';
import {
    ConfigurationError,
    UnsupportedEngineError,
    AuthenticationError,
    RateLimitError,
    ApiServerError,
    ValidationError
} from '@/common/errors';

// --- Mock Adapters ---
const mockTavilyExecute = jest.fn();
const mockWeatherExecute = jest.fn();

jest.mock('@/SDK/search/tavily/TavilyAdapter', () => {
  return {
    TavilyAdapter: jest.fn().mockImplementation(() => {
      return { execute: mockTavilyExecute };
    }),
  };
});

jest.mock('@/SDK/search/weather/WeatherAdapter', () => {
  return {
    WeatherAdapter: jest.fn().mockImplementation(() => {
      return { execute: mockWeatherExecute };
    }),
  };
});

// --- Helper to create SearchTool instance with mocked config/adapters ---
interface ToolConfig {
    enabledEngines: { [key: string]: { apiKey?: string; adapter: SearchAdapter } };
}

const createSearchTool = (config: ToolConfig): SearchTool => {
    // This is a placeholder. Replace with how SearchTool actually gets its config/adapters.
    const tool = new SearchTool();
    // Hacky way to inject config for testing if no proper DI exists
    (tool as any).getConfig = () => config;
    (tool as any).getAdapter = (engine: string): SearchAdapter | undefined => {
         return config.enabledEngines[engine]?.adapter;
     };
    return tool;
};

// --- Test Data ---
const MOCK_QUERY = 'AI news';
const MOCK_TAVILY_RESULTS: SearchResult[] = [{ title: 'Tavily Result', url: '...', content: '...' }];
const MOCK_WEATHER_RESULTS: SearchResult[] = [{ title: 'Weather Result', url: '...', content: '...' }];


describe('SearchTool', () => {
  let tavilyAdapterInstance: SearchAdapter;
  let weatherAdapterInstance: SearchAdapter;

  beforeEach(() => {
    // Clear mock function calls and potentially mock implementations before each test
    mockTavilyExecute.mockClear();
    mockWeatherExecute.mockClear();
    // Reset mock implementations if needed
    mockTavilyExecute.mockResolvedValue(MOCK_TAVILY_RESULTS);
    mockWeatherExecute.mockResolvedValue(MOCK_WEATHER_RESULTS);

    // Get instances created by the mock constructors
    tavilyAdapterInstance = new (TavilyAdapter as any)();
    weatherAdapterInstance = new (WeatherAdapter as any)();
  });

  // --- Success Scenario ---
  it('Scenario I.1: should execute search using the specified configured engine (Tavily)', async () => {
     const config: ToolConfig = {
        enabledEngines: {
            'Tavily': { apiKey: 'mock-key', adapter: tavilyAdapterInstance },
            'Weather': { apiKey: 'mock-key', adapter: weatherAdapterInstance },
        }
    };
    const searchTool = createSearchTool(config);

    const results = await searchTool.execute({ query: MOCK_QUERY, engine: 'Tavily' });

    expect(mockTavilyExecute).toHaveBeenCalledTimes(1);
    expect(mockTavilyExecute).toHaveBeenCalledWith(MOCK_QUERY, undefined);
    expect(mockWeatherExecute).not.toHaveBeenCalled(); // Ensure other adapters not called
    expect(results).toEqual({
      content: [{ type: 'text', text: expect.stringContaining('Tavily Result') }],
      isError: false
    });
  });

   it('Scenario I.1 (variant): should execute search using Weather engine', async () => {
     const config: ToolConfig = {
        enabledEngines: {
            'Tavily': { apiKey: 'mock-key', adapter: tavilyAdapterInstance },
            'Weather': { apiKey: 'mock-key', adapter: weatherAdapterInstance },
        }
    };
    const searchTool = createSearchTool(config);

    const results = await searchTool.execute({ query: "London temperature", engine: 'Weather' });

    expect(mockWeatherExecute).toHaveBeenCalledTimes(1);
    expect(mockWeatherExecute).toHaveBeenCalledWith("London temperature", undefined); // Pass query
    expect(mockTavilyExecute).not.toHaveBeenCalled();
    expect(results).toEqual({
      content: [{ type: 'text', text: expect.stringContaining('Weather Result') }],
      isError: false
    });
  });


  // --- Error Scenarios ---
  it('Scenario I.2: should return error for an unconfigured engine', async () => {
    const config: ToolConfig = {
        enabledEngines: { // ImaginarySearch is missing
            'Tavily': { apiKey: 'mock-key', adapter: tavilyAdapterInstance },
        }
    };
    const searchTool = createSearchTool(config);

    const result = await searchTool.execute({ query: 'test', engine: 'ImaginarySearch' });
    
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('系统中没有配置可用的搜索引擎');
    expect(mockTavilyExecute).not.toHaveBeenCalled();
  });

  it('Scenario I.3: should handle API key missing gracefully', async () => {
     const config: ToolConfig = {
        enabledEngines: {
            'Tavily': { adapter: tavilyAdapterInstance }, // API Key is missing!
        }
    };
    const searchTool = createSearchTool(config);

    const result = await searchTool.execute({ query: 'test', engine: 'Tavily' });
    
    // 现在检查返回的结构化错误信息
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError');
    expect(result.isError).toBe(false); // SearchTool现在处理了这种情况，并返回结果而不是错误
    expect(mockTavilyExecute).toHaveBeenCalledTimes(1);
  });

  it('Scenario I.4: should handle AuthenticationError from adapter gracefully', async () => {
      const authError = new AuthenticationError("Invalid Tavily Key");
      mockTavilyExecute.mockRejectedValueOnce(authError); // Adapter throws error

       const config: ToolConfig = {
          enabledEngines: {
              'Tavily': { apiKey: 'mock-key', adapter: tavilyAdapterInstance },
          }
      };
      const searchTool = createSearchTool(config);

      const result = await searchTool.execute({ query: 'test', engine: 'Tavily' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid Tavily Key');
      expect(mockTavilyExecute).toHaveBeenCalledTimes(1); // Adapter was called
  });

  it('Scenario I.5: should handle RateLimitError from adapter gracefully', async () => {
      const rateLimitError = new RateLimitError();
      mockTavilyExecute.mockRejectedValueOnce(rateLimitError);

      const config: ToolConfig = { enabledEngines: { 'Tavily': { apiKey: 'mock-key', adapter: tavilyAdapterInstance }}};
      const searchTool = createSearchTool(config);

      const result = await searchTool.execute({ query: 'test', engine: 'Tavily' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('rate limit');
      expect(mockTavilyExecute).toHaveBeenCalledTimes(1);
  });

  it('Scenario I.6: should handle empty results with a user-friendly message', async () => {
    mockTavilyExecute.mockResolvedValueOnce([]); // Adapter returns empty array

    const config: ToolConfig = { enabledEngines: { 'Tavily': { apiKey: 'mock-key', adapter: tavilyAdapterInstance }}};
    const searchTool = createSearchTool(config);

    const results = await searchTool.execute({ query: 'obscure query', engine: 'Tavily' });

    expect(results.isError).toBe(false);
    expect(results.content[0].text).toContain('没有找到相关结果');
    expect(mockTavilyExecute).toHaveBeenCalledTimes(1);
  });

  it('Scenario I.7: should handle ApiServerError from adapter gracefully', async () => {
    const serverError = new ApiServerError();
    mockTavilyExecute.mockRejectedValueOnce(serverError);

     const config: ToolConfig = { enabledEngines: { 'Tavily': { apiKey: 'mock-key', adapter: tavilyAdapterInstance }}};
    const searchTool = createSearchTool(config);

    const result = await searchTool.execute({ query: 'test', engine: 'Tavily' });
    
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('server error');
    expect(mockTavilyExecute).toHaveBeenCalledTimes(1);
  });

  it('Scenario I.8: should validate empty query string and return error message', async () => {
     const config: ToolConfig = {
        enabledEngines: {
            'Tavily': { apiKey: 'mock-key', adapter: tavilyAdapterInstance },
        }
    };
    const searchTool = createSearchTool(config);

    const result = await searchTool.execute({ query: '', engine: 'Tavily' });
    
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('查询内容不能为空');
    expect(mockTavilyExecute).not.toHaveBeenCalled(); // Adapter should not be called
  });

}); 