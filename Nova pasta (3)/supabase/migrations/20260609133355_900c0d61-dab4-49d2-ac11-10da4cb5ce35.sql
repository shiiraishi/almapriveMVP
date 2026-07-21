ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'bronze' CHECK (plan IN ('bronze','prata','ouro')),
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pendente' CHECK (payment_status IN ('pendente','pago','cancelado')),
  ADD COLUMN IF NOT EXISTS payment_date timestamptz;

-- Backfill plan a partir de priority_level (1=bronze, 2=prata, >=3=ouro)
UPDATE public.profiles SET plan = CASE
  WHEN priority_level >= 3 THEN 'ouro'
  WHEN priority_level = 2 THEN 'prata'
  ELSE 'bronze'
END;

CREATE INDEX IF NOT EXISTS profiles_plan_idx ON public.profiles(plan);
CREATE INDEX IF NOT EXISTS profiles_payment_status_idx ON public.profiles(payment_status);