export interface ChatMessageType {
  id: string;
  role: string;
  content: any;
  images?: any[];
  videos?: any[];
  voice?: any;
  createdAt?: Date;
}
