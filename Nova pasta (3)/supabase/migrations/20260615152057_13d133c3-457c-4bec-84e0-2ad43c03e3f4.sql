
-- =========================
-- 1. SUBSCRIPTIONS
-- =========================
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('ouro','prata','bronze')),
  subscription_status TEXT NOT NULL DEFAULT 'ativo' CHECK (subscription_status IN ('ativo','vencido','suspenso','cancelado')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiration_date TIMESTAMPTZ,
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Apenas service_role gerencia (painel admin Supabase). Sem políticas para anon/authenticated => sem acesso via API pública.

CREATE INDEX idx_subscriptions_profile ON public.subscriptions(profile_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(subscription_status);
CREATE INDEX idx_subscriptions_plan ON public.subscriptions(plan_type);
-- Apenas uma assinatura ativa por perfil
CREATE UNIQUE INDEX uniq_active_subscription_per_profile
  ON public.subscriptions(profile_id)
  WHERE subscription_status = 'ativo';

-- =========================
-- 2. PAYMENTS
-- =========================
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('ouro','prata','bronze')),
  amount NUMERIC(10,2),
  payment_method TEXT CHECK (payment_method IN ('pix','dinheiro','transferência','cartão','outro')),
  payment_status TEXT NOT NULL DEFAULT 'pendente' CHECK (payment_status IN ('pago','pendente','cancelado')),
  payment_date TIMESTAMPTZ,
  expiration_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_payments_profile ON public.payments(profile_id);
CREATE INDEX idx_payments_subscription ON public.payments(subscription_id);
CREATE INDEX idx_payments_status ON public.payments(payment_status);
CREATE INDEX idx_payments_date ON public.payments(payment_date);

-- =========================
-- 3. updated_at trigger
-- =========================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- 4. MIGRAÇÃO DE DADOS
-- =========================
-- Cria uma assinatura para cada perfil existente com base no plan atual
INSERT INTO public.subscriptions (profile_id, plan_type, subscription_status, start_date, expiration_date, auto_renew)
SELECT
  p.id,
  COALESCE(NULLIF(p.plan,''), 'bronze') AS plan_type,
  CASE
    WHEN p.payment_status = 'pago' THEN 'ativo'
    WHEN p.payment_status = 'cancelado' THEN 'cancelado'
    ELSE 'ativo'
  END AS subscription_status,
  COALESCE(p.payment_date, p.created_at::timestamptz, now()) AS start_date,
  CASE
    WHEN p.payment_date IS NOT NULL THEN p.payment_date + INTERVAL '30 days'
    ELSE NULL
  END AS expiration_date,
  false
FROM public.profiles p;

-- Cria um pagamento histórico para cada perfil que possui payment_status/date
INSERT INTO public.payments (profile_id, subscription_id, plan_type, payment_status, payment_method, payment_date, expiration_date, notes)
SELECT
  p.id,
  s.id,
  COALESCE(NULLIF(p.plan,''), 'bronze'),
  COALESCE(p.payment_status, 'pendente'),
  NULL,
  p.payment_date,
  CASE WHEN p.payment_date IS NOT NULL THEN p.payment_date + INTERVAL '30 days' ELSE NULL END,
  'Registro migrado da estrutura anterior'
FROM public.profiles p
LEFT JOIN public.subscriptions s ON s.profile_id = p.id
WHERE p.payment_status IS NOT NULL OR p.payment_date IS NOT NULL;

-- =========================
-- 5. REMOVER COLUNAS ANTIGAS
-- =========================
ALTER TABLE public.profiles DROP COLUMN IF EXISTS plan;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS payment_status;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS payment_date;

-- =========================
-- 6. VIEWS ADMINISTRATIVAS
-- =========================
CREATE OR REPLACE VIEW public.v_ouro_ativos AS
SELECT p.name, p.whatsapp_number, s.plan_type, s.expiration_date
FROM public.subscriptions s
JOIN public.profiles p ON p.id = s.profile_id
WHERE s.plan_type = 'ouro' AND s.subscription_status = 'ativo';

CREATE OR REPLACE VIEW public.v_prata_ativos AS
SELECT p.name, p.whatsapp_number, s.plan_type, s.expiration_date
FROM public.subscriptions s
JOIN public.profiles p ON p.id = s.profile_id
WHERE s.plan_type = 'prata' AND s.subscription_status = 'ativo';

CREATE OR REPLACE VIEW public.v_bronze_ativos AS
SELECT p.name, p.whatsapp_number, s.plan_type, s.expiration_date
FROM public.subscriptions s
JOIN public.profiles p ON p.id = s.profile_id
WHERE s.plan_type = 'bronze' AND s.subscription_status = 'ativo';

CREATE OR REPLACE VIEW public.v_assinaturas_vencendo AS
SELECT p.name, p.whatsapp_number, s.plan_type, s.expiration_date
FROM public.subscriptions s
JOIN public.profiles p ON p.id = s.profile_id
WHERE s.subscription_status = 'ativo'
  AND s.expiration_date IS NOT NULL
  AND s.expiration_date >= now()
  AND s.expiration_date <= now() + INTERVAL '7 days';

CREATE OR REPLACE VIEW public.v_assinaturas_atrasadas AS
SELECT
  p.name,
  p.whatsapp_number,
  s.plan_type,
  EXTRACT(DAY FROM (now() - s.expiration_date))::int AS dias_em_atraso,
  s.expiration_date
FROM public.subscriptions s
JOIN public.profiles p ON p.id = s.profile_id
WHERE s.expiration_date IS NOT NULL
  AND s.expiration_date < now();

CREATE OR REPLACE VIEW public.v_pagamentos_pendentes AS
SELECT p.name, pay.plan_type, pay.amount, pay.expiration_date AS data_prevista
FROM public.payments pay
JOIN public.profiles p ON p.id = pay.profile_id
WHERE pay.payment_status = 'pendente';

GRANT SELECT ON public.v_ouro_ativos, public.v_prata_ativos, public.v_bronze_ativos,
  public.v_assinaturas_vencendo, public.v_assinaturas_atrasadas, public.v_pagamentos_pendentes
  TO service_role;
