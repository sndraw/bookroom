import { TavilyAdapter } from './TavilyAdapter';
import { SearchResult } from '@/common/search';
import {
  AuthenticationError,
  RateLimitError,
  UsageLimitError,
  ApiServerError,
  NetworkError,
  ApiResponseParseError
} from '@/common/errors';

/**
 * @jest-environment node
 */

// Mock the external HTTP client (e.g., fetch or axios)
const mockHttpPost = jest.fn();
jest.mock('@/utils/httpClient', () => ({
  post: (...args: any[]) => mockHttpPost(...args),
}));

// --- Test Data ---
const MOCK_API_KEY = 'tvly-mock-key';
const MOCK_QUERY = 'AI news';
const MOCK_SUCCESS_RESPONSE = {
  query: MOCK_QUERY,
  follow_up_questions: null,
  answer: null,
  images: [],
  results: [
    {
      title: "Result 1",
      url: "https://example.com/1",
      content: "Content for result 1...",
      score: 0.8,
      raw_content: null
    },
    {
      title: "Result 2",
      url: "https://example.com/2",
      content: "Content for result 2...",
      score: 0.75,
      raw_content: null
    }
  ],
  response_time: 1.5
};
const MOCK_PARSED_RESULTS: SearchResult[] = [
    { title: "Result 1", url: "https://example.com/1", content: "Content for result 1...", score: 0.8 },
    { title: "Result 2", url: "https://example.com/2", content: "Content for result 2...", score: 0.75 },
];
const TAVILY_API_ENDPOINT = 'https://api.tavily.com/search';

describe('TavilyAdapter', () => {
  let adapter: TavilyAdapter;

  beforeEach(() => {
    // Reset mocks before each test
    mockHttpPost.mockClear();
    adapter = new TavilyAdapter(MOCK_API_KEY); // Assuming constructor takes API key
  });

  // --- Success Scenarios ---
  it('Scenario II.1: should call Tavily API and parse successful response', async () => {
    mockHttpPost.mockResolvedValueOnce({ // Simulate successful HTTP response
      status: 200,
      data: MOCK_SUCCESS_RESPONSE,
    });

    const results = await adapter.execute(MOCK_QUERY);

    expect(mockHttpPost).toHaveBeenCalledTimes(1);
    expect(mockHttpPost).toHaveBeenCalledWith(
      TAVILY_API_ENDPOINT,
      expect.objectContaining({ 
        query: MOCK_QUERY,
        search_depth: "advanced",
        include_answer: true,
        include_raw_content: false
      }),
      expect.objectContaining({ 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_API_KEY}`,
        },
        timeout: 30000
      })
    );
    expect(results).toEqual(MOCK_PARSED_RESULTS); // Check if parsing is correct
  });

  it('Scenario II.2: should return an empty array when API returns no results', async () => {
    mockHttpPost.mockResolvedValueOnce({
      status: 200,
      data: { ...MOCK_SUCCESS_RESPONSE, results: [] },
    });

    const results = await adapter.execute('obscure query');

    expect(results).toEqual([]);
  });

  // --- Error Scenarios ---
  it('Scenario II.3: should throw AuthenticationError on 401 response', async () => {
    mockHttpPost.mockRejectedValueOnce({ // Simulate HTTP client throwing an error for non-2xx
      response: {
        status: 401,
        data: { detail: { error: "Unauthorized: missing or invalid API key." } },
      },
    });

    await expect(adapter.execute('test')).rejects.toThrow(AuthenticationError);
    expect(mockHttpPost).toHaveBeenCalledTimes(1);
  });

   it('Scenario II.4: should throw UsageLimitError on 403 response', async () => {
    mockHttpPost.mockRejectedValueOnce({
      response: {
        status: 403,
        data: { detail: { error: "<403 Forbidden, (e.g This request exceeds...>" } },
      },
    });

    await expect(adapter.execute('test')).rejects.toThrow(UsageLimitError);
    expect(mockHttpPost).toHaveBeenCalledTimes(1);
  });

  it('Scenario II.5: should throw RateLimitError on 429 response', async () => {
    mockHttpPost.mockRejectedValueOnce({
      response: {
        status: 429,
        data: { detail: { error: "Your request has been blocked..." } },
      },
    });

    await expect(adapter.execute('test')).rejects.toThrow(RateLimitError);
    expect(mockHttpPost).toHaveBeenCalledTimes(1);
  });

  it('Scenario II.6: should throw ApiServerError on 500 response', async () => {
    mockHttpPost.mockRejectedValueOnce({
      response: {
        status: 500,
        data: { detail: { error: "Internal Server Error" } },
      },
    });

    await expect(adapter.execute('test')).rejects.toThrow(ApiServerError);
    expect(mockHttpPost).toHaveBeenCalledTimes(1);
  });

  it('Scenario II.7: should throw NetworkError on network issues', async () => {
    // 创建一个符合NetworkError的错误对象
    const networkError = new NetworkError("无法连接到 Tavily API，请检查网络连接");
    mockHttpPost.mockRejectedValueOnce(networkError);

    await expect(adapter.execute('test')).rejects.toThrow(NetworkError);
    expect(mockHttpPost).toHaveBeenCalledTimes(1);
  });

  it('Scenario II.8: should throw ApiResponseParseError on invalid JSON response', async () => {
    mockHttpPost.mockResolvedValueOnce({
      status: 200,
      data: 'This is not JSON {'
    });

    await expect(adapter.execute('test')).rejects.toThrow(ApiResponseParseError);
    expect(mockHttpPost).toHaveBeenCalledTimes(1);
  });
}); 