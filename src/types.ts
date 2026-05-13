export type ModelId = 
  | 'gemini-3.1-pro-preview' 
  | 'gemini-3-flash-preview' 
  | 'gpt-4o'
  | 'claude-3-5-sonnet'
  | 'llama-3.1-405b'
  | 'mistral-large';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: string[]; // base64 strings
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  modelId: ModelId;
  createdAt: number;
}
