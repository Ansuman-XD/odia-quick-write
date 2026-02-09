export type EditorMode = 'exam' | 'news' | 'free';

export type QuestionType = 'mcq' | 'short' | 'long';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  marks: number;
  options?: string[];
  answer?: string;
}

export interface ExamSection {
  id: string;
  name: string;
  odiaName: string;
  questions: Question[];
}

export interface NewsArticle {
  headline: string;
  body: string;
  category: 'politics' | 'sports' | 'local' | 'national' | 'entertainment';
}

export interface EditorState {
  mode: EditorMode;
  content: string;
  cursorPosition: number;
  wordCount: number;
  isUnicodeActive: boolean;
  typingMode: 'odia' | 'english';
}

export interface IMESuggestion {
  text: string;
  key: number;
}
