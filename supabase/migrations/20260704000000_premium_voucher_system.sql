-- 1. Add premium columns to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_expires_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS signup_source text;

-- 2. Create voucher_codes table
CREATE TABLE IF NOT EXISTS public.voucher_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  duration_days integer NOT NULL DEFAULT 30,
  max_uses integer NOT NULL DEFAULT 1,
  current_uses integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Create voucher_redemptions table (prevent double redeem)
CREATE TABLE IF NOT EXISTS public.voucher_redemptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  voucher_code_id uuid REFERENCES public.voucher_codes(id) ON DELETE CASCADE NOT NULL,
  redeemed_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, voucher_code_id)
);

-- 4. RLS for voucher_codes (read-only for authenticated users)
ALTER TABLE public.voucher_codes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can read active voucher codes" 
    ON public.voucher_codes FOR SELECT 
    USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 5. RLS for voucher_redemptions
ALTER TABLE public.voucher_redemptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their own redemptions" 
    ON public.voucher_redemptions FOR SELECT 
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own redemptions" 
    ON public.voucher_redemptions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 6. Index for fast voucher lookup
CREATE INDEX IF NOT EXISTS idx_voucher_codes_code ON public.voucher_codes(code);
CREATE INDEX IF NOT EXISTS idx_voucher_redemptions_user ON public.voucher_redemptions(user_id);
