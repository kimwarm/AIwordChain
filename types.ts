export enum Sender {
  USER = 'USER',
  AI = 'AI',
  SYSTEM = 'SYSTEM'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  word?: string; // The specific game word played (if applicable)
  definition?: string; // Definition of the word (optional)
}

export interface GameState {
  isPlaying: boolean;
  history: Set<string>; // Set of used words to prevent repetition
  lastWord: string | null;
  lastChar: string | null;
  turnCount: number;
  gameOverReason?: string;
}

export interface GeminiResponse {
  valid: boolean;
  word?: string;
  definition?: string; // Meaning of the word
  reason?: string; // Why it's invalid or chatty message
  win?: boolean; // If AI cannot answer
  dueumLastChar?: string; // Normalized last char for next turn (handling Dueum-beopchik)
}