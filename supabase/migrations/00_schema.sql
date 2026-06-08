-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- Create custom types if they don't exist
DO $$ BEGIN
    CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'done');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL,
  email text NOT NULL,
  name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  xp integer DEFAULT 0,
  streak_count integer DEFAULT 0,
  last_active_date date,
  major text,
  productive_hours text,
  interests text,
  learning_type text DEFAULT 'santai'::text,
  onboarding_completed boolean DEFAULT false,
  bio text,
  streak integer DEFAULT 0,
  level integer DEFAULT 1,
  avatar_url text,
  ai_persona text DEFAULT 'mindful' CHECK (ai_persona IN ('aesthetic', 'savage', 'mindful')),
  semester integer,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- 2. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  scheduled_time timestamp with time zone NOT NULL,
  duration_estimate_minutes integer NOT NULL,
  google_event_id text,
  status public.task_status NOT NULL DEFAULT 'pending'::public.task_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  description text,
  module_link text,
  sub_tasks jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- 3. Learning Folders Table
CREATE TABLE IF NOT EXISTS public.learning_folders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  drive_folder_id text NOT NULL,
  folder_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT learning_folders_pkey PRIMARY KEY (id),
  CONSTRAINT learning_folders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 4. Document Chunks Table
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  folder_id uuid,
  user_id uuid,
  content text NOT NULL,
  embedding vector(768),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT document_chunks_pkey PRIMARY KEY (id),
  CONSTRAINT document_chunks_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.learning_folders(id),
  CONSTRAINT document_chunks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 5. Learning History Table
CREATE TABLE IF NOT EXISTS public.learning_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  folder_id uuid,
  title text NOT NULL,
  type text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT learning_history_pkey PRIMARY KEY (id),
  CONSTRAINT learning_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT learning_history_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.learning_folders(id)
);

-- 6. Learning Chat History Table
CREATE TABLE IF NOT EXISTS public.learning_chat_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  folder_id uuid,
  quarter_id text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'ai'::text])),
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT learning_chat_history_pkey PRIMARY KEY (id),
  CONSTRAINT learning_chat_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT learning_chat_history_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.learning_folders(id)
);

-- 7. Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  category text,
  message text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT feedback_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- 8. Journal Entries Table
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    raw_text text NOT NULL,
    ai_reflection text NOT NULL,
    sentiment_score integer NOT NULL CHECK (sentiment_score >= 1 AND sentiment_score <= 10),
    bg_color text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Setup Row Level Security (RLS) for journal_entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own journal entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own journal entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own journal entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own journal entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
