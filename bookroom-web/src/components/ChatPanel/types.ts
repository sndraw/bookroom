export interface ChatMessageType {
  id: string;
  role: string;
  content: any;
  images?: any[];
  audios?: any[];
  createdAt?: Date;
  logContent?: string;
}
