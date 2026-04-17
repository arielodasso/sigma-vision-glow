
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  scope TEXT,
  work_type TEXT,
  observations TEXT,
  delivery_time TEXT,
  payment_method TEXT,
  billing TEXT,
  development_cost NUMERIC,
  monthly_maintenance_cost NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read budgets by slug"
ON public.budgets FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can insert budgets"
ON public.budgets FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update budgets"
ON public.budgets FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete budgets"
ON public.budgets FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_budgets_slug ON public.budgets(slug);
