// 支持的模型平台-MAP
export const AI_LM_PLATFORM_MAP = {
  ollama: {
    value: 'ollama',
    text: 'Ollama',
  },
  openai: {
    value: 'openai',
    text: 'OpenAI',
  },
};

// 支持的模型类型-MAP
export const AI_LM_TYPE_MAP = {
  llm: {
    value: 'chat',
    text: '聊天模型',
  },
  embedding: {
    value: 'embedding',
    text: '向量模型',
  },
  vision: {
    value: 'vision',
    text: '视觉模型',
  },
  audio: {
    value: 'audio',
    text: '音频模型',
  },
  video: {
    value: 'video',
    text: '视频模型',
  },
};
// 支持的知识图谱-MAP
export const AI_GRAPH_PLATFORM_MAP = {
  lightrag: {
    value: 'LightRAG',
    text: 'LightRAG',
  },
  lightrag_multi: {
    value: 'LightRAG_Multi',
    text: 'LightRAG_Multi',
  },
};

// 支持的知识图谱-检索类型-MAP
export enum AI_GRAPH_MODE_ENUM {
  LOCAL = 'local',
  GLOBAL = 'global',
  HYBRID = 'hybrid',
  NAIVE = 'naive',
  MIX = 'mix',
}

// 支持知识图谱-文件上传类型
export const AI_GRAPH_UPLOAD_FILE_TYPE = [
  '.txt',
  '.md',
  '.pdf',
  '.docx',
  '.pptx',
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];
// 支持知识图谱-文件上传大小限制(Byte)
export const AI_GRAPH_UPLOAD_FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB

// 支持视觉模型-文件上传类型
export const AI_VL_UPLOAD_FILE_TYPE = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.bmp',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
];

// 支持视觉模型-文件上传大小限制(Byte)
export const AI_VL_UPLOAD_FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB