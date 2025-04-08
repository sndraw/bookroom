export interface ChatMessageType {
  id: string;
  role: string;
  content: any;
  images?: any[];
  audios?: any[];
  videos?: any[];
  createdAt?: Date;
  logContent?: string;
}
