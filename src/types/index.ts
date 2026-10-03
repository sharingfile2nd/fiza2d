export interface AnimationLayer {
  id: string;
  title: string;
  rawTitle: string;
  code: string;
  hidden: boolean;
}

export interface PresetItem {
  name: string;
  theme: string;
  styles: string[];
  lines: number;
  icon: string;
  color: string;
}

export interface ExtractedString {
  quote: string;
  text: string;
  fullMatch: string;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  type: 'SYS' | 'AI' | 'MATH' | 'PROC' | 'DONE' | 'ERR' | 'WARN';
  message: string;
}

export interface ToastInfo {
  id: number;
  message: string;
  isError?: boolean;
}

export type ResolutionMode = '450' | '720' | '1080';

export interface ResolutionConfig {
  width: number;
  height: number;
  label: string;
  badge: string;
}
