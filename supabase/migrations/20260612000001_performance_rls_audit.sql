-- Enable RLS on Tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Performance: Add indexes for Dashboard queries
-- Get tasks by user (Mencegah Sequential Scan di halaman Dashboard)
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);

-- Order tasks by scheduled_time (Mencegah pengurutan lambat)
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_time ON public.tasks(scheduled_time);

-- Filter tasks by learning_history_id
CREATE INDEX IF NOT EXISTS idx_tasks_learning_history_id ON public.tasks(learning_history_id);
