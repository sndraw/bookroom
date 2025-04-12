// 支持的模型平台-MAP
export const AI_LM_PLATFORM_MAP = {
  ollama: {
    value: 'ollama',
    text: 'Ollama'
  },
  openai: {
    value: 'openai',
    text: 'OpenAI'
  },
}

// 支持的知识图谱-MAP
export const AI_GRAPH_PLATFORM_MAP = {
  lightrag: {
    value: 'LightRAG',
    text: 'LightRAG',
  },
  bookroomrag: {
    value: 'BookRoomRAG',
    text: 'BookRoom RAG',
  },
};

// 支持的知识图谱-检索类型-MAP
export enum AI_GRAPH_MODE_ENUM {
  LOCAL = 'local',
  GLOBAL = 'global',
  HYBRID = 'hybrid',
  NAIVE = 'naive',
  MIX = 'mix'
}


// 支持知识图谱-文件上传类型
export const AI_GRAPH_UPLOAD_FILE_TYPE = [
  ".txt", ".md", ".pdf", ".docx", ".pptx",
  "text/plain", "text/markdown", "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
];

