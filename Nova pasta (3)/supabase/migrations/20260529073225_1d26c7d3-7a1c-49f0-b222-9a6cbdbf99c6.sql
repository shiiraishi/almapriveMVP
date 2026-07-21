
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS video_360_url text,
  ADD COLUMN IF NOT EXISTS height_cm integer,
  ADD COLUMN IF NOT EXISTS weight_kg integer,
  ADD COLUMN IF NOT EXISTS dress_size text,
  ADD COLUMN IF NOT EXISTS eye_color text,
  ADD COLUMN IF NOT EXISTS hair_color text,
  ADD COLUMN IF NOT EXISTS has_silicone boolean,
  ADD COLUMN IF NOT EXISTS has_tattoo boolean,
  ADD COLUMN IF NOT EXISTS has_piercing boolean;
