export type Status = 'ready' | 'listening' | 'thinking' | 'speaking';

export interface Message {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: number;
}

