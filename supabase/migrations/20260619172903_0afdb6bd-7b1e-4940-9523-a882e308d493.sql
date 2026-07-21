
-- Add suspension flag to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false;

-- Reports table
CREATE TABLE IF NOT EXISTS public.profile_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_name text,
  reason text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.profile_reports TO anon, authenticated;
GRANT ALL ON public.profile_reports TO service_role;

ALTER TABLE public.profile_reports ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a report
CREATE POLICY "Anyone can create a report"
  ON public.profile_reports
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(coalesce(description, '')) BETWEEN 10 AND 1000
    AND length(coalesce(reason, '')) > 0
  );

-- No SELECT/UPDATE/DELETE policies => denied for anon/authenticated;
-- service_role bypasses RLS, so admin panel can manage.

CREATE TRIGGER update_profile_reports_updated_at
  BEFORE UPDATE ON public.profile_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_profile_reports_status_created ON public.profile_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_reports_profile_id ON public.profile_reports(profile_id);
