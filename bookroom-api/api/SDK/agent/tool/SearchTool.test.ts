import SearchTool from './SearchTool'; // 正确导入默认导出的类
import { TavilyAdapter } from '../../search/tavily/TavilyAdapter'; // 调整路径
import { WeatherAdapter } from '../../search/weather/WeatherAdapter'; // 调整路径
import {
    SearchResult,
    SearchAdapter,
    ConfigurationError,
    UnsupportedEngineError,
    AuthenticationError,
    RateLimitError,
    ApiServerError,
    ValidationError,
} from '../../../common'; // 调整到 common 目录的相对路径

// --- Mock Adapters ---
const mockTavilyExecute = jest.fn();
const mockWeatherExecute = jest.fn();

jest.mock('../../search/tavily/TavilyAdapter', () => {
  return {
    TavilyAdapter: jest.fn().mockImplementation(() => {
      return { execute: mockTavilyExecute };
    }),
  };
});

jest.mock('../../search/weather/WeatherAdapter', () => {
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
    expect(mockTavilyExecute).toHaveBeenCalledWith(MOCK_QUERY);
    expect(mockWeatherExecute).not.toHaveBeenCalled(); // Ensure other adapters not called
    expect(results).toEqual(MOCK_TAVILY_RESULTS);
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
    expect(mockWeatherExecute).toHaveBeenCalledWith("London temperature"); // Pass query
    expect(mockTavilyExecute).not.toHaveBeenCalled();
    expect(results).toEqual(MOCK_WEATHER_RESULTS);
  });


  // --- Error Scenarios ---
  it('Scenario I.2: should throw UnsupportedEngineError for an unconfigured engine', async () => {
    const config: ToolConfig = {
        enabledEngines: { // ImaginarySearch is missing
            'Tavily': { apiKey: 'mock-key', adapter: tavilyAdapterInstance },
        }
    };
    const searchTool = createSearchTool(config);

    await expect(searchTool.execute({ query: 'test', engine: 'ImaginarySearch' }))
      .rejects.toThrow(UnsupportedEngineError); // Or specific error type
     await expect(searchTool.execute({ query: 'test', engine: 'ImaginarySearch' }))
      .rejects.toThrow('Search engine "ImaginarySearch" is not supported or configured.');


    expect(mockTavilyExecute).not.toHaveBeenCalled();
  });

  it('Scenario I.3: should throw ConfigurationError if engine configured but API key missing', async () => {
     const config: ToolConfig = {
        enabledEngines: {
            'Tavily': { adapter: tavilyAdapterInstance }, // API Key is missing!
        }
    };
    const searchTool = createSearchTool(config);


    await expect(searchTool.execute({ query: 'test', engine: 'Tavily' }))
          .rejects.toThrow(ConfigurationError);
     await expect(searchTool.execute({ query: 'test', engine: 'Tavily' }))
          .rejects.toThrow(/Tavily API key missing/i); // Match error message


    expect(mockTavilyExecute).not.toHaveBeenCalled();
  });

  it('Scenario I.4: should re-throw AuthenticationError from adapter', async () => {
      const authError = new AuthenticationError("Invalid Tavily Key");
      mockTavilyExecute.mockRejectedValueOnce(authError); // Adapter throws error

       const config: ToolConfig = {
          enabledEngines: {
              'Tavily': { apiKey: 'mock-key', adapter: tavilyAdapterInstance },
          }
      };
      const searchTool = createSearchTool(config);

      await expect(searchTool.execute({ query: 'test', engine: 'Tavily' }))
            .rejects.toThrow(AuthenticationError);
      await expect(searchTool.execute({ query: 'test', engine: 'Tavily' }))
            .rejects.toThrow("Invalid Tavily Key"); // Check if the original error is propagated


      expect(mockTavilyExecute).toHaveBeenCalledTimes(1); // Adapter was called
  });

  it('Scenario I.5: should re-throw RateLimitError from adapter', async () => {
      const rateLimitError = new RateLimitError();
      mockTavilyExecute.mockRejectedValueOnce(rateLimitError);

      const config: ToolConfig = { enabledEngines: { 'Tavily': { apiKey: 'mock-key', adapter: tavilyAdapterInstance }}};
      const searchTool = createSearchTool(config);

      await expect(searchTool.execute({ query: 'test', engine: 'Tavily' }))
            .rejects.toThrow(RateLimitError);
      expect(mockTavilyExecute).toHaveBeenCalledTimes(1);
  });

  it('Scenario I.6: should return empty results when adapter returns empty', async () => {
    mockTavilyExecute.mockResolvedValueOnce([]); // Adapter returns empty array

    const config: ToolConfig = { enabledEngines: { 'Tavily': { apiKey: 'mock-key', adapter: tavilyAdapterInstance }}};
    const searchTool = createSearchTool(config);

    const results = await searchTool.execute({ query: 'obscure query', engine: 'Tavily' });

    expect(results).toEqual([]);
    expect(mockTavilyExecute).toHaveBeenCalledTimes(1);
  });

  it('Scenario I.7: should re-throw ApiServerError from adapter', async () => {
    const serverError = new ApiServerError();
    mockTavilyExecute.mockRejectedValueOnce(serverError);

     const config: ToolConfig = { enabledEngines: { 'Tavily': { apiKey: 'mock-key', adapter: tavilyAdapterInstance }}};
    const searchTool = createSearchTool(config);


    await expect(searchTool.execute({ query: 'test', engine: 'Tavily' }))
          .rejects.toThrow(ApiServerError);
    expect(mockTavilyExecute).toHaveBeenCalledTimes(1);
  });

  it('Scenario I.8: should throw ValidationError or return empty for empty query string', async () => {
     const config: ToolConfig = {
        enabledEngines: {
            'Tavily': { apiKey: 'mock-key', adapter: tavilyAdapterInstance },
        }
    };
    const searchTool = createSearchTool(config);


    // Option 1: Throw ValidationError
     await expect(searchTool.execute({ query: '', engine: 'Tavily' }))
         .rejects.toThrow(ValidationError);
     await expect(searchTool.execute({ query: '', engine: 'Tavily' }))
         .rejects.toThrow(/Query cannot be empty/i);

    expect(mockTavilyExecute).not.toHaveBeenCalled(); // Adapter should not be called
  });

}); 