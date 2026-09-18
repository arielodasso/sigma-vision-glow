-- Helper: staff check
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
    AND role IN ('superadmin','admin','moderator','empleado'));
$$;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
    AND role IN ('superadmin','admin'));
$$;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon;

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL DEFAULT '',
  full_name text,
  title text,
  phone text,
  whatsapp text,
  avatar_url text,
  manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_staff" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR id = auth.uid());
CREATE POLICY "profiles_update_self_or_admin" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "profiles_insert_admin" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) OR id = auth.uid());
CREATE POLICY "profiles_delete_admin" ON public.profiles FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, COALESCE(NEW.email, ''), NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, email, full_name)
SELECT u.id, COALESCE(u.email,''), u.raw_user_meta_data->>'full_name' FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- ROLE PERMISSIONS
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission text NOT NULL,
  UNIQUE (role, permission)
);
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_permissions_select_staff" ON public.role_permissions FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.get_my_roles()
RETURNS SETOF public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.get_my_roles() FROM anon;

CREATE OR REPLACE FUNCTION public.get_my_permissions()
RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT DISTINCT rp.permission FROM public.role_permissions rp
  JOIN public.user_roles ur ON ur.role = rp.role
  WHERE ur.user_id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.get_my_permissions() FROM anon;

INSERT INTO public.role_permissions (role, permission)
SELECT r, p FROM (VALUES ('admin'::public.app_role)) AS roles(r),
  (VALUES ('tasks.read'),('contents.manage'),('media.manage'),('seo.read'),('agenda.read'),
          ('clients.read'),('budgets.manage'),('docs.read'),('clients.invite'),('team.manage'),
          ('chat.read'),('help.manage'),('settings.manage')) AS perms(p)
ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission)
SELECT 'empleado'::public.app_role, p FROM (VALUES ('tasks.read'),('agenda.read'),('chat.read'),('docs.read')) AS perms(p)
ON CONFLICT DO NOTHING;

-- CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text,
  email text,
  phone text,
  whatsapp text,
  notes text,
  status text NOT NULL DEFAULT 'proposal',
  portal_enabled boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_staff_all" ON public.clients FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;

-- CLIENT INVITES
CREATE TABLE IF NOT EXISTS public.client_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz,
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  created_by uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_invites TO authenticated;
GRANT ALL ON public.client_invites TO service_role;
ALTER TABLE public.client_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client_invites_staff_all" ON public.client_invites FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- DOCUMENTS
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  path text NOT NULL,
  url text,
  mime_type text,
  size_bytes bigint,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_staff_all" ON public.documents FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  assignee_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  priority text NOT NULL DEFAULT 'medium',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_staff_all" ON public.tasks FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CHAT
CREATE TABLE IF NOT EXISTS public.chat_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_channels TO authenticated;
GRANT ALL ON public.chat_channels TO service_role;
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_channels_staff_all" ON public.chat_channels FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_messages_select_staff" ON public.chat_messages FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "chat_messages_insert_own" ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND sender_id = auth.uid());
CREATE POLICY "chat_messages_delete_own" ON public.chat_messages FOR DELETE TO authenticated
  USING (sender_id = auth.uid() OR public.is_admin(auth.uid()));
INSERT INTO public.chat_channels (name, description, is_default)
SELECT 'general', 'Canal general del equipo', true
WHERE NOT EXISTS (SELECT 1 FROM public.chat_channels);

-- CRM SETTINGS
CREATE TABLE IF NOT EXISTS public.crm_settings (
  key text PRIMARY KEY,
  value text,
  category text NOT NULL DEFAULT 'general',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_settings TO authenticated;
GRANT ALL ON public.crm_settings TO service_role;
ALTER TABLE public.crm_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_settings_staff_read" ON public.crm_settings FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "crm_settings_admin_write" ON public.crm_settings FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER crm_settings_updated_at BEFORE UPDATE ON public.crm_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FAQS
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'general',
  question text NOT NULL,
  answer text NOT NULL,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs_public_read" ON public.faqs FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "faqs_staff_read" ON public.faqs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "faqs_staff_write" ON public.faqs FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TESTIMONIALS
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  company text,
  content text NOT NULL,
  rating integer,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials_public_read" ON public.testimonials FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "testimonials_staff_read" ON public.testimonials FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "testimonials_staff_write" ON public.testimonials FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER testimonials_updated_at BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- HELP DOCS
CREATE TABLE IF NOT EXISTS public.help_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'manual',
  content text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.help_docs TO authenticated;
GRANT ALL ON public.help_docs TO service_role;
ALTER TABLE public.help_docs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "help_docs_staff_all" ON public.help_docs FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER help_docs_updated_at BEFORE UPDATE ON public.help_docs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TEAM INVITES
CREATE TABLE IF NOT EXISTS public.team_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'empleado',
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz,
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  invited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_invites TO authenticated;
GRANT ALL ON public.team_invites TO service_role;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_invites_admin_all" ON public.team_invites FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- BLOG POSTS extra SEO fields
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS related_service text;