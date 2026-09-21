-- ============================================================
-- Fix RLS policies for user_roles - allow backoffice to manage roles
-- ============================================================

-- Add INSERT policy for backoffice
CREATE POLICY "Backoffice can insert user roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.is_backoffice(auth.uid()));

-- Add UPDATE policy for backoffice
CREATE POLICY "Backoffice can update user roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.is_backoffice(auth.uid()))
WITH CHECK (public.is_backoffice(auth.uid()));

-- Add DELETE policy for backoffice
CREATE POLICY "Backoffice can delete user roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.is_backoffice(auth.uid()));