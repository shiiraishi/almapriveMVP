
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS subscription_type TEXT NOT NULL DEFAULT 'paid',
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_subscription_type_check;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_subscription_type_check
  CHECK (subscription_type IN ('paid', 'partnership'));

CREATE OR REPLACE VIEW public.v_assinaturas_vencendo AS
SELECT p.name, p.whatsapp_number, s.plan_type, s.expiration_date
FROM public.subscriptions s
JOIN public.profiles p ON p.id = s.profile_id
WHERE s.subscription_type = 'paid'
  AND s.subscription_status = 'ativo'
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
WHERE s.subscription_type = 'paid'
  AND s.subscription_status = 'ativo'
  AND s.expiration_date IS NOT NULL
  AND s.expiration_date < now();

CREATE OR REPLACE VIEW public.v_pagamentos_pendentes AS
SELECT p.name, pay.plan_type, pay.amount, pay.expiration_date AS data_prevista
FROM public.payments pay
JOIN public.profiles p ON p.id = pay.profile_id
JOIN public.subscriptions s ON s.id = pay.subscription_id
WHERE pay.payment_status = 'pendente'
  AND s.subscription_type = 'paid';

CREATE OR REPLACE VIEW public.v_parcerias_ativas AS
SELECT
  p.name,
  p.whatsapp_number,
  s.plan_type,
  s.notes,
  s.created_at
FROM public.subscriptions s
JOIN public.profiles p ON p.id = s.profile_id
WHERE s.subscription_type = 'partnership'
  AND s.subscription_status = 'ativo';

ALTER VIEW public.v_assinaturas_vencendo SET (security_invoker = on);
ALTER VIEW public.v_assinaturas_atrasadas SET (security_invoker = on);
ALTER VIEW public.v_pagamentos_pendentes SET (security_invoker = on);
ALTER VIEW public.v_parcerias_ativas SET (security_invoker = on);

GRANT SELECT ON public.v_parcerias_ativas TO service_role;
