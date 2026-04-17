
CREATE TYPE public.budget_status AS ENUM ('draft', 'sent', 'accepted', 'rejected');

ALTER TABLE public.budgets
  ADD COLUMN items JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN status public.budget_status NOT NULL DEFAULT 'draft',
  ADD COLUMN accepted_at TIMESTAMPTZ;

-- Allow anonymous clients to update only status/accepted_at via RPC
CREATE OR REPLACE FUNCTION public.set_budget_status(_slug TEXT, _status public.budget_status)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _status NOT IN ('accepted', 'rejected') THEN
    RAISE EXCEPTION 'Only accepted or rejected allowed';
  END IF;

  UPDATE public.budgets
  SET status = _status,
      accepted_at = CASE WHEN _status = 'accepted' THEN now() ELSE NULL END,
      updated_at = now()
  WHERE slug = _slug
    AND status IN ('draft', 'sent');
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_budget_status(TEXT, public.budget_status) TO anon, authenticated;
