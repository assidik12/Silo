export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  module_link: string | null;
  scheduled_time: string;
  duration_estimate_minutes: number;
  google_event_id: string | null;
  status: 'pending' | 'done';
  created_at: string;
}

export interface ActionResponse {
  success: boolean;
  error?: string;
  data?: any;
}
