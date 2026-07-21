ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cover_image text,
  ADD COLUMN IF NOT EXISTS services_not_offered text[],
  ADD COLUMN IF NOT EXISTS availability text,
  ADD COLUMN IF NOT EXISTS is_online boolean NOT NULL DEFAULT false;