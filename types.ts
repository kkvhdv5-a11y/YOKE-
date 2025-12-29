
export enum AIModelStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SYNCED = 'SYNCED',
  OFFLINE = 'OFFLINE'
}

export interface AIModelEngine {
  id: string;
  name: string;
  origin: string;
  status: AIModelStatus;
  load: number;
  type: 'core' | 'logic' | 'creative' | 'search' | 'context' | 'open' | 'multimodal';
  weight: number; // 0-100 routing weight
  isPinned: boolean; // Preferential routing
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'yoke' | 'system';
  content: string;
  timestamp: number;
}

export interface MemoryInsight {
  id: string;
  text: string;
  timestamp: number;
  relevance: number;
}

export interface YokeState {
  isListening: boolean;
  isSpeaking: boolean;
  currentThought: string;
  ensembleLoad: number;
  transcription: string;
}
