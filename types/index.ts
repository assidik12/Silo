export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  module_link: string | null;
  scheduled_time: string;
  duration_estimate_minutes: number;
  google_event_id: string | null;
  status: "pending" | "done";
  created_at: string;
  sub_tasks?: { id: string; title: string; done: boolean }[] | null;
  learning_history_id?: string | null;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface Episode {
  id: string;
  title: string;
  description: string;
}

export interface LearningHistoryItem {
  id: string;
  user_id: string;
  folder_id: string | null;
  title: string;
  type: string;
  content: string | Record<string, unknown>;
  created_at: string;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "ai";
  content: string;
}

export interface UserProfile {
  id: string;
  email: string;
  xp: number;
  streak_count: number;
  last_active_date: string | null;
  onboarding_completed: boolean;
  major: string | null;
  productive_hours: string | null;
  interests: string | null;
  learning_type: 'ngebut' | 'santai' | null;
  ai_persona?: 'aesthetic' | 'savage' | 'mindful' | null;
  nickname?: string | null;
  name?: string | null;
  semester?: number | null;
  is_premium?: boolean;
  premium_expires_at?: string | null;
  signup_source?: string | null;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  raw_text: string;
  ai_reflection: string;
  sentiment_score: number;
  bg_color?: string | null;
  created_at: string;
}

export interface VoucherCode {
  id: string;
  code: string;
  duration_days: number;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
}
