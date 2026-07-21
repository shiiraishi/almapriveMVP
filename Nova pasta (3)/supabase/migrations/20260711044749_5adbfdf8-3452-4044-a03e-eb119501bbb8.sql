
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS partnership_reason text,
  ADD COLUMN IF NOT EXISTS partnership_notes text,
  ADD COLUMN IF NOT EXISTS partnership_start_date date,
  ADD COLUMN IF NOT EXISTS partnership_review_date date,
  ADD COLUMN IF NOT EXISTS partnership_status text;
