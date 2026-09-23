
CREATE TABLE IF NOT EXISTS public.contract_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contract_type text NOT NULL DEFAULT 'general',
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_templates TO authenticated;
GRANT ALL ON public.contract_templates TO service_role;
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage contract templates" ON public.contract_templates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'superadmin') OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'empleado'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'superadmin') OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'empleado'));
CREATE TRIGGER update_contract_templates_updated_at BEFORE UPDATE ON public.contract_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  title text NOT NULL,
  contract_type text NOT NULL DEFAULT 'general',
  amount numeric,
  currency text NOT NULL DEFAULT 'ARS',
  project text,
  body text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  sent_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO authenticated;
GRANT ALL ON public.contracts TO service_role;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage contracts" ON public.contracts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'superadmin') OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'empleado'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'superadmin') OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'empleado'));
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
