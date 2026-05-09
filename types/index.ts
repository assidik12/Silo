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
