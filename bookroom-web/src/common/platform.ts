interface PlatformTypeMap {
  [key: string]: { value: string; text: string };
}

// 支持的配置类型-MAP
export const PLATFORM_TYPE_MAP: PlatformTypeMap = {
  model: { value: 'model', text: '模型平台' },
  // KNOWLEDGE: { value: 'knowledge', text: '知识库' },
  graph: { value: 'graph', text: '知识图谱' },
  agent: { value: 'agent', text: '智能接口' },
  search: { value: 'search', text: '搜索引擎' },
  voice_recognize: { value: 'voice_recognize', text: '语音识别' },
};
