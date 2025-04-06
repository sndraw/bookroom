import axios, { AxiosError } from 'axios';
import { jest, describe, it, expect, beforeAll, beforeEach, afterEach } from '@jest/globals';
import AgentService from '@/service/AgentService'; // Adjust path if necessary

// 从环境变量获取配置，与agent_test.sh保持一致
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001/api/v1';
const AGENT_ID = process.env.TEST_AGENT_ID || '9f5389cc-affb-4715-befd-0a893a94feb3';
const TOKEN = process.env.TEST_TOKEN;

// 设置测试超时时间
jest.setTimeout(30000); // 30秒

// --- Mock AgentService ---
// Define the mock agent data structure (adjust based on actual AgentModel structure)
const mockAgentInfo = {
  id: AGENT_ID,
  name: 'Test Agent for Bug 0405',
  // ... other basic fields if needed
  toJSON: function() { // Sequelize models often have toJSON
    return {
      id: this.id,
      name: this.name,
      // --- Crucial Parameters ---
      parameters: {
        prompt: `你是一个智能助手，可以根据用户的指令和自己的理解，选择合适的工具帮你完成任务。
你有以下工具可供使用： time_tool: API for curent time | 查询当前时间接口 search_tool: Search the web for information | 在网络上搜索信息
如果你不确定如何处理某个任务，可以询问用户寻求帮助。
如果某个工具连续返回错误信息或者无法完成任务，最高限制为5次尝试，超过次数后不再尝试该工具并提示用户该工具可能存在问题。
请注意，你的目标是高效地完成用户的任务。一旦你认为已经收集到足够的信息并得出了最终结论，就应该立即停止思考和工具调用，并整合所有信息，清晰地输出最终答案给用户。不要为了达到"步数限制"而执行不必要的步骤。在任务完成的最后，必须向用户展示最终的、整合后的答案。`, // Prompt from bug report
        limitSteps: 5, // Default or from agent config
        limitSeconds: 30,
        maxTokens: 4096,
        isMemory: false, // Assuming no memory for this test case
        logLevel: 'debug',
        // -- Include necessary tool configs if AgentService needs them --
        // e.g., modelConfig, searchEngine (assuming search_tool is enabled by 'searchEngine' parameter)
        searchEngine: 'tavily', // Assuming 'tavily' enables the search_tool
        modelConfig: { platform: 'openai', model: 'gpt-3.5-turbo' } // Example
        // ------------------------------------------------------------
      },
      // --- Messages (History) ---
      // For this test, an empty history seems appropriate as per the original scenario
      messages: [], 
      // -------------------------
    };
  }
};

describe('Bug Reproduction Tests', () => {
  
  beforeAll(() => {
    // 检查必需的环境变量
    if (!TOKEN) {
      throw new Error('测试失败: 缺少环境变量 TEST_TOKEN');
    }
    // Agent ID now comes from mockAgentInfo, but keep the log
    console.log(`[测试环境] API URL: ${API_BASE_URL}, Agent ID: ${AGENT_ID}`); 
  });

  beforeEach(() => {
    // --- Apply the mock before each test ---.
    // Note: Using spyOn might be cleaner if AgentService is already loaded,
    // but jest.mock is safer if modules load order is complex.
    // Let's try spyOn first assuming AgentService is accessible.
    jest.spyOn(AgentService, 'getAgentById').mockResolvedValue(mockAgentInfo as any); 
    // We cast to 'any' because the mock might not perfectly match the Sequelize model type
  });

  afterEach(() => {
    // --- Restore original implementation after each test ---.
    jest.restoreAllMocks(); 
  });

  it('Bug #0405: Agent logic fixed, should output time_tool result', async () => {
    const url = `${API_BASE_URL}/agent/${AGENT_ID}/chat`;
    
    // Payload now only needs the essential parts, as history/prompt come from the mock
    const payload = {
      query: {
        // Mimic the structure frontend likely sends (last message object)
        role: 'user',
        content: '最近有什么新上映的电影？',
        id: `test-message-${Date.now()}` // Add a message ID
      },
      is_stream: true, 
      limitSteps: 3,   // Keep this to override agent default if needed for the bug
      // history and conversation_id might still be useful if controller uses them
      history: [], 
      conversation_id: `test-bug-0405-${Date.now()}` 
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'text/event-stream', 
    };

    try {
      const response = await axios.post(url, payload, { headers, responseType: 'stream' });
      expect(response.status).toBe(200);
      
      let lastOutputContent: string | null = null; // 旧变量，可能不再需要
      let receivedFinalAnswerContent: string | null = null; // 新增变量，存储 final_answer 的内容
      let accumulatedData = ''; // Buffer for data spanning multiple chunks

      await new Promise<void>((resolve, reject) => {
         response.data.on('data', (chunk: Buffer) => {
            accumulatedData += chunk.toString();
            
            // Process complete messages (ending with \n\n)
            let messageEndIndex;
            while ((messageEndIndex = accumulatedData.indexOf('\n\n')) !== -1) {
                const messageBlock = accumulatedData.substring(0, messageEndIndex);
                accumulatedData = accumulatedData.substring(messageEndIndex + 2); 

                // --- Parse SSE message with event type --- 
                let currentEvent = 'message';
                let currentDataLines: string[] = [];
                const lines = messageBlock.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('event:')) {
                        currentEvent = line.substring(6).trim();
                    } else if (line.startsWith('data:')) {
                        currentDataLines.push(line.substring(5).trim()); 
                    }
                }
                const currentData = currentDataLines.join('\n');

                if (currentData) { 
                    if (currentEvent === 'final_answer') {
                        try {
                            const parsedData = JSON.parse(currentData);
                            if (parsedData && typeof parsedData.content === 'string') {
                                receivedFinalAnswerContent = parsedData.content;
                            } else {
                            }
                        } catch (parseError) {
                        }
                    } else if (currentEvent === 'output') {
                        lastOutputContent = currentData; 
                    }
                }
            }
         });
         response.data.on('end', () => {
            if (accumulatedData.trim()) {
                let currentEvent = 'message';
                let currentDataLines: string[] = [];
                const lines = accumulatedData.trim().split('\n'); 
                for (const line of lines) {
                    const trimmedLine = line.trim(); 
                    if (trimmedLine.startsWith('event:')) {
                        currentEvent = trimmedLine.substring(6).trim();
                    } else if (trimmedLine.startsWith('data:')) {
                        currentDataLines.push(trimmedLine.substring(5).trim()); 
                    }
                }
                const currentData = currentDataLines.join('\n'); 
                
                if (currentData) {
                     if (currentEvent === 'final_answer') {
                        try {
                            const parsedData = JSON.parse(currentData); 
                            if (parsedData && typeof parsedData.content === 'string') {
                                receivedFinalAnswerContent = parsedData.content;
                            } else {
                            }
                        } catch (parseError) {
                        }
                    } else if (currentEvent === 'output') {
                        lastOutputContent = currentData;
                    }
                }
            }
            resolve();
         });
         response.data.on('error', (err: Error) => {
             console.error('[TEST] Stream error:', err);
             reject(err);
         });
      });

      expect(receivedFinalAnswerContent).not.toBeNull(); 

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios Error:', error.response?.status, error.response?.data);
        } else {
            console.error('Unexpected Error:', error);
        }
        throw error; // 抛出错误让测试失败
    }
  });
}); 