export interface ChatMessageType {
  id: string;
  role: string;
  content: any;
  images?: any[];
  audios?: any[];
  videos?: any[];
  files?: any[];
  createdAt?: Date;
  logContent?: string;
}
