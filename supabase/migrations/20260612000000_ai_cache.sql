-- Migration: Create ai_cache table
CREATE TABLE IF NOT EXISTS public.ai_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    context_hash TEXT NOT NULL UNIQUE,
    response TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookup by hash
CREATE INDEX IF NOT EXISTS ai_cache_context_hash_idx ON public.ai_cache (context_hash);

-- Enable RLS
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access to the cache, since it's meant to be shared across users
CREATE POLICY "Allow public read from ai_cache" ON public.ai_cache
    FOR SELECT USING (true);

-- Allow authenticated users to insert to the cache (or only backend service role)
-- Assuming the server actions run with authenticated user's client, we need insert policy
CREATE POLICY "Allow authenticated insert to ai_cache" ON public.ai_cache
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
