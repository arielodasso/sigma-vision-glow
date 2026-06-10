
-- Restrict user_roles SELECT to admins only
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Restrict public SELECT on budgets: remove permissive "Anyone can read budgets by slug"
DROP POLICY IF EXISTS "Anyone can read budgets by slug" ON public.budgets;

-- Admins can still read all budgets
CREATE POLICY "Admins can view all budgets"
ON public.budgets
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Secure RPC for public budget access by slug
CREATE OR REPLACE FUNCTION public.get_budget_by_slug(_slug text)
RETURNS SETOF public.budgets
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT * FROM public.budgets
  WHERE slug = _slug
    AND status IN ('draft','sent','accepted','rejected')
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_budget_by_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_budget_by_slug(text) TO anon, authenticated;

-- Tighten EXECUTE on has_role: only needed inside RLS (SECURITY DEFINER runs regardless of caller execute)
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
