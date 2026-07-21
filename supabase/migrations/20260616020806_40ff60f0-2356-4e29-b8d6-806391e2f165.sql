
-- Plan duration helper (days)
CREATE OR REPLACE FUNCTION public.plan_duration_days(_plan text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE lower(coalesce(_plan, ''))
    WHEN 'bronze' THEN 30
    WHEN 'prata'  THEN 30
    WHEN 'ouro'   THEN 30
    ELSE 30
  END;
$$;

-- Auto-fill expiration_date on subscriptions
CREATE OR REPLACE FUNCTION public.set_subscription_expiration()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.expiration_date IS NULL THEN
    NEW.expiration_date := coalesce(NEW.start_date, now())
      + (public.plan_duration_days(NEW.plan_type) || ' days')::interval;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_subscription_expiration ON public.subscriptions;
CREATE TRIGGER trg_set_subscription_expiration
BEFORE INSERT OR UPDATE OF plan_type, start_date ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.set_subscription_expiration();

-- Auto-fill payment_date / expiration_date on payments
CREATE OR REPLACE FUNCTION public.set_payment_dates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.payment_status = 'pago' AND NEW.payment_date IS NULL THEN
    NEW.payment_date := now();
  END IF;
  IF NEW.expiration_date IS NULL AND NEW.payment_date IS NOT NULL THEN
    NEW.expiration_date := NEW.payment_date
      + (public.plan_duration_days(NEW.plan_type) || ' days')::interval;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_payment_dates ON public.payments;
CREATE TRIGGER trg_set_payment_dates
BEFORE INSERT OR UPDATE OF payment_status, payment_date, plan_type ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.set_payment_dates();

-- Backfill: fill expiration_date for existing subscriptions from start_date
UPDATE public.subscriptions
SET expiration_date = start_date + (public.plan_duration_days(plan_type) || ' days')::interval
WHERE expiration_date IS NULL AND start_date IS NOT NULL;
