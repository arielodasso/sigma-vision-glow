-- ============================================================
-- CRM Sigma Tecnologías · RBAC (roles y permisos)
-- ============================================================

-- 1) Extender el enum de roles con los valores del CRM
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'superadmin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'empleado';

-- 2) Permisos granulares (RBAC)
CREATE TABLE IF NOT EXISTS public.permissions (
  code TEXT PRIMARY KEY,
  description TEXT
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role public.app_role NOT NULL REFERENCES public.app_role,
  permission TEXT NOT NULL REFERENCES public.permissions(code),
  PRIMARY KEY (role, permission)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 3) Funciones auxiliares de autorización
CREATE OR REPLACE FUNCTION public.is_backoffice(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'superadmin')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'moderator', 'superadmin', 'empleado')
  )
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles public.app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)
  )
$$;

-- 4) Consultar los roles del usuario actual (para el frontend/guardas)
CREATE OR REPLACE FUNCTION public.get_my_roles()
RETURNS public.app_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(role), ARRAY[]::public.app_role[])
  FROM public.user_roles
  WHERE user_id = auth.uid()
$$;

-- 5) Consultar los permisos efectivos del usuario actual
CREATE OR REPLACE FUNCTION public.get_my_permissions()
RETURNS TEXT[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(DISTINCT rp.permission), ARRAY[]::TEXT[])
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role = ur.role
  WHERE ur.user_id = auth.uid()
$$;

-- 6) Guarda genérica por permiso (usable en RLS)
CREATE OR REPLACE FUNCTION public.has_permission(_perm text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = auth.uid() AND rp.permission = _perm
  )
$$;

-- 7) Grants de las funciones auxiliares
REVOKE ALL ON FUNCTION public.is_backoffice(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_any_role(uuid, public.app_role[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_roles() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_permissions() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_permission(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_backoffice(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, public.app_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_permissions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(text) TO authenticated;

-- 8) Actualizar políticas existentes para aceptar superadmin / backoffice
-- blog_posts: reemplazar políticas admin-only por is_backoffice
DROP POLICY IF EXISTS "Admins can insert posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.blog_posts;

CREATE POLICY "Backoffice can insert posts"
ON public.blog_posts FOR INSERT TO authenticated
WITH CHECK (public.is_backoffice(auth.uid()));

CREATE POLICY "Backoffice can update posts"
ON public.blog_posts FOR UPDATE TO authenticated
USING (public.is_backoffice(auth.uid()))
WITH CHECK (public.is_backoffice(auth.uid()));

CREATE POLICY "Backoffice can delete posts"
ON public.blog_posts FOR DELETE TO authenticated
USING (public.is_backoffice(auth.uid()));

-- user_roles: solo backoffice puede ver la tabla
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Backoffice can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.is_backoffice(auth.uid()));

-- budgets
DROP POLICY IF EXISTS "Admins can view all budgets" ON public.budgets;
DROP POLICY IF EXISTS "Admins can insert budgets" ON public.budgets;
DROP POLICY IF EXISTS "Admins can update budgets" ON public.budgets;
DROP POLICY IF EXISTS "Admins can delete budgets" ON public.budgets;

CREATE POLICY "Backoffice can view all budgets"
ON public.budgets FOR SELECT TO authenticated
USING (public.is_backoffice(auth.uid()));

CREATE POLICY "Backoffice can insert budgets"
ON public.budgets FOR INSERT TO authenticated
WITH CHECK (public.is_backoffice(auth.uid()));

CREATE POLICY "Backoffice can update budgets"
ON public.budgets FOR UPDATE TO authenticated
USING (public.is_backoffice(auth.uid()))
WITH CHECK (public.is_backoffice(auth.uid()));

CREATE POLICY "Backoffice can delete budgets"
ON public.budgets FOR DELETE TO authenticated
USING (public.is_backoffice(auth.uid()));

-- contact_submissions
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON public.contact_submissions;

CREATE POLICY "Backoffice can view submissions"
ON public.contact_submissions FOR SELECT TO authenticated
USING (public.is_backoffice(auth.uid()));

CREATE POLICY "Backoffice can update submissions"
ON public.contact_submissions FOR UPDATE TO authenticated
USING (public.is_backoffice(auth.uid()))
WITH CHECK (public.is_backoffice(auth.uid()));

-- media_assets
DROP POLICY IF EXISTS "media_assets_admin_all" ON public.media_assets;
CREATE POLICY "media_assets_backoffice_all" ON public.media_assets
  FOR ALL TO authenticated
  USING (public.is_backoffice(auth.uid()))
  WITH CHECK (public.is_backoffice(auth.uid()));

DROP POLICY IF EXISTS "media_bucket_admin_select" ON storage.objects;
DROP POLICY IF EXISTS "media_bucket_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "media_bucket_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "media_bucket_admin_delete" ON storage.objects;

CREATE POLICY "media_bucket_backoffice_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'media' AND public.is_backoffice(auth.uid()));

CREATE POLICY "media_bucket_backoffice_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_backoffice(auth.uid()));

CREATE POLICY "media_bucket_backoffice_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.is_backoffice(auth.uid()));

CREATE POLICY "media_bucket_backoffice_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.is_backoffice(auth.uid()));