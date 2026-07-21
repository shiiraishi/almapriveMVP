
CREATE OR REPLACE VIEW public.v_assinaturas_vencendo AS
SELECT p.name, p.whatsapp_number, s.plan_type, s.expiration_date
FROM public.subscriptions s
JOIN public.profiles p ON p.id = s.profile_id
WHERE s.subscription_type = 'paid'
  AND s.subscription_status = 'ativo'
  AND lower(coalesce(s.plan_type, '')) <> 'bronze'
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
  AND lower(coalesce(s.plan_type, '')) <> 'bronze'
  AND s.expiration_date IS NOT NULL
  AND s.expiration_date < now();

CREATE OR REPLACE VIEW public.v_pagamentos_pendentes AS
SELECT p.name, pay.plan_type, pay.amount, pay.expiration_date AS data_prevista
FROM public.payments pay
JOIN public.profiles p ON p.id = pay.profile_id
JOIN public.subscriptions s ON s.id = pay.subscription_id
WHERE pay.payment_status = 'pendente'
  AND s.subscription_type = 'paid'
  AND lower(coalesce(pay.plan_type, '')) <> 'bronze';

ALTER VIEW public.v_assinaturas_vencendo SET (security_invoker = on);
ALTER VIEW public.v_assinaturas_atrasadas SET (security_invoker = on);
ALTER VIEW public.v_pagamentos_pendentes SET (security_invoker = on);

-- Trigger: não criar payments para plano bronze (gratuito)
CREATE OR REPLACE FUNCTION public.block_bronze_payments()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF lower(coalesce(NEW.plan_type, '')) = 'bronze' THEN
    RAISE EXCEPTION 'Plano bronze é gratuito e não gera cobrança';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_block_bronze_payments ON public.payments;
CREATE TRIGGER trg_block_bronze_payments
BEFORE INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.block_bronze_payments();
