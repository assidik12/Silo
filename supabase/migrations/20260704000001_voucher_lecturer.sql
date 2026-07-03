-- Add lecturer details to voucher_codes table
ALTER TABLE public.voucher_codes
  ADD COLUMN IF NOT EXISTS lecturer_name text,
  ADD COLUMN IF NOT EXISTS lecturer_email text;
