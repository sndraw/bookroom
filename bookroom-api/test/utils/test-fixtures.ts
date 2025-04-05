/**
 * 测试固定数据
 */

/**
 * 模拟的搜索结果数据
 */
export const MOCK_SEARCH_RESULTS = [
  {
    title: '测试结果 1',
    url: 'https://example.com/result1',
    content: '测试结果内容 1...',
    score: 0.95
  },
  {
    title: '测试结果 2',
    url: 'https://example.com/result2',
    content: '测试结果内容 2...',
    score: 0.85
  }
];

/**
 * 模拟的工具调用响应
 */
export const MOCK_TOOL_CALL_RESPONSE = {
  id: 'call_012345',
  object: 'tool_call',
  function: {
    name: 'time_tool',
    arguments: '{"format":"ISO"}'
  }
};

/**
 * 模拟的工具处理结果
 */
export const MOCK_TOOL_RESULT = {
  content: [
    { 
      type: 'text', 
      text: '2023-05-15T10:30:00.000Z' 
    }
  ],
  isError: false
};

/**
 * 模拟的错误结果
 */
export const MOCK_ERROR_RESULT = {
  content: [
    { 
      type: 'text', 
      text: '工具调用失败：参数错误' 
    }
  ],
  isError: true
};

/**
 * 模拟的消息历史
 */
export const MOCK_MESSAGE_HISTORY = [
  {
    role: 'system',
    content: '你是一个有用的助手'
  },
  {
    role: 'user',
    content: '现在几点了？'
  },
  {
    role: 'assistant',
    content: '',
    tool_calls: [
      {
        id: 'call_012345',
        function: {
          name: 'time_tool',
          arguments: '{"format":"ISO"}'
        }
      }
    ]
  },
  {
    role: 'tool',
    tool_call_id: 'call_012345',
    content: '2023-05-15T10:30:00.000Z'
  }
];