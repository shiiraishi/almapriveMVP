-- Feature Black: gradiente dark no card (não é um plano)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_black boolean NOT NULL DEFAULT false;
