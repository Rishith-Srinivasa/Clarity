export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "archived";
  nextStep?: string;
  createdAt: number;
  lastUpdated: number;
}

export interface ProgressDay {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  description?: string;
}

export type Mood = "default" | "angry" | "sad" | "happy";

export interface ThemeConfig {
  bg: string;
  accent: string;
  text: string;
  card: string;
  border: string;
}
