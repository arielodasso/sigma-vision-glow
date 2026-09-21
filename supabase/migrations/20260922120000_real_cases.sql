-- ============================================================
-- Real Cases · Casos reales administrables
-- ============================================================

CREATE TABLE IF NOT EXISTS public.real_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  logo_url text,
  logo_theme text DEFAULT 'dark' CHECK (logo_theme IN ('light', 'dark', 'gray')),
  url text,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  services text[] DEFAULT '{}', -- slugs de servicios: 'desarrollo-web', 'automatizacion', etc.
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.real_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published real cases"
ON public.real_cases FOR SELECT TO anon, authenticated
USING (published = true);

CREATE POLICY "Backoffice can manage real cases"
ON public.real_cases FOR ALL TO authenticated
USING (public.is_backoffice(auth.uid()))
WITH CHECK (public.is_backoffice(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_real_cases_published ON public.real_cases(published, sort_order);
CREATE INDEX IF NOT EXISTS idx_real_cases_services ON public.real_cases USING GIN (services);
CREATE INDEX IF NOT EXISTS idx_real_cases_client ON public.real_cases(client_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_real_cases_updated_at ON public.real_cases;
CREATE TRIGGER trg_real_cases_updated_at
BEFORE UPDATE ON public.real_cases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();