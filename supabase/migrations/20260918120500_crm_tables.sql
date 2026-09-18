-- ============================================================
-- CRM Sigma Tecnologías · Tablas
-- ============================================================

-- ------------------------------------------------------------
-- 1) Alteres sobre tablas existentes (sin FK aun)
-- ------------------------------------------------------------
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS related_service text;

ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS service text;

-- ------------------------------------------------------------
-- 2) profiles · miembros del equipo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Rol default EMPLEADO para nuevos miembros (trigger sobre auth.users → user_roles)
CREATE OR REPLACE FUNCTION public.handle_new_employee()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Miembro'))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  SELECT NEW.id, 'empleado'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = NEW.id AND ur.role IN ('superadmin','admin','empleado')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_employee();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Backoffice can manage profiles"
ON public.profiles FOR ALL TO authenticated
USING (public.is_backoffice(auth.uid()))
WITH CHECK (public.is_backoffice(auth.uid()));

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ------------------------------------------------------------
-- 3) tasks · tareas del equipo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','done','cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Asignar automáticamente el creador al insertar
CREATE OR REPLACE FUNCTION public.tasks_set_created_by()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.created_by := auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tasks_set_created_by ON public.tasks;
CREATE TRIGGER trg_tasks_set_created_by
BEFORE INSERT ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.tasks_set_created_by();

-- Lectura: staff con permiso, filtrado por assignee/creator cuando corresponde
CREATE POLICY "Staff can read tasks"
ON public.tasks FOR SELECT TO authenticated
USING (
  public.has_permission('tasks.read')
  AND (
    public.has_permission('tasks.assign')
    OR assignee_id = auth.uid()
    OR created_by = auth.uid()
  )
);

CREATE POLICY "Staff can create tasks"
ON public.tasks FOR INSERT TO authenticated
WITH CHECK (public.has_permission('tasks.read'));

CREATE POLICY "Assignees and backoffice can update tasks"
ON public.tasks FOR UPDATE TO authenticated
USING (
  public.has_permission('tasks.read')
  AND (
    public.has_permission('tasks.assign')
    OR assignee_id = auth.uid()
    OR created_by = auth.uid()
  )
)
WITH CHECK (
  public.has_permission('tasks.read')
  AND (
    public.has_permission('tasks.assign')
    OR assignee_id = auth.uid()
    OR created_by = auth.uid()
  )
);

CREATE POLICY "Backoffice can delete tasks"
ON public.tasks FOR DELETE TO authenticated
USING (public.has_permission('tasks.assign'));

CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- ------------------------------------------------------------
-- 4) clients · clientes del CRM
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text,
  email text,
  phone text,
  whatsapp text,
  notes text,
  status text NOT NULL DEFAULT 'proposal' CHECK (status IN ('active','pending_payment','proposal','lost')),
  portal_enabled boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Backoffice can manage clients"
ON public.clients FOR ALL TO authenticated
USING (public.is_backoffice(auth.uid()))
WITH CHECK (public.is_backoffice(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients(created_at DESC);

-- FK de presupuestos hacia clientes (después de crear clients)
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_budgets_client_id ON public.budgets(client_id);

-- ------------------------------------------------------------
-- 5) client_invites · invitaciones/portales de clientes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked')),
  expires_at timestamptz,
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.client_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Backoffice can manage client invites"
ON public.client_invites FOR ALL TO authenticated
USING (public.is_backoffice(auth.uid()))
WITH CHECK (public.is_backoffice(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_client_invites_client ON public.client_invites(client_id);
CREATE INDEX IF NOT EXISTS idx_client_invites_token ON public.client_invites(token);

-- ------------------------------------------------------------
-- 6) documents · repositorio de documentos (Drive interno)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  path text NOT NULL UNIQUE,
  url text,
  mime_type text,
  size_bytes bigint,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view documents"
ON public.documents FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) AND public.has_permission('docs.read'));

CREATE POLICY "Backoffice can manage documents"
ON public.documents FOR ALL TO authenticated
USING (public.is_backoffice(auth.uid()))
WITH CHECK (public.is_backoffice(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_documents_client ON public.documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- ------------------------------------------------------------
-- 7) testimonials · testimonios (se cargan luego desde admin)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  company text,
  content text NOT NULL,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published testimonials"
ON public.testimonials FOR SELECT TO anon, authenticated
USING (published = true);

CREATE POLICY "Backoffice can manage testimonials"
ON public.testimonials FOR ALL TO authenticated
USING (public.is_backoffice(auth.uid()))
WITH CHECK (public.is_backoffice(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_testimonials_published ON public.testimonials(published, sort_order);

-- ------------------------------------------------------------
-- 8) faqs · preguntas frecuentes administrables
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text DEFAULT 'general',
  question text NOT NULL,
  answer text NOT NULL,
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published faqs"
ON public.faqs FOR SELECT TO anon, authenticated
USING (published = true);

CREATE POLICY "Backoffice can manage faqs"
ON public.faqs FOR ALL TO authenticated
USING (public.is_backoffice(auth.uid()))
WITH CHECK (public.is_backoffice(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_faqs_published ON public.faqs(published, sort_order);

-- ------------------------------------------------------------
-- 9) Chat de equipo · canales y mensajes (Realtime)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_channel_members (
  channel_id uuid NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read channels"
ON public.chat_channels FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Backoffice can manage channels"
ON public.chat_channels FOR ALL TO authenticated
USING (public.is_backoffice(auth.uid()))
WITH CHECK (public.is_backoffice(auth.uid()));

CREATE POLICY "Staff can read memberships"
ON public.chat_channel_members FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can join channels"
ON public.chat_channel_members FOR INSERT TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can read messages"
ON public.chat_messages FOR SELECT TO authenticated
USING (
  public.is_staff(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.chat_channel_members m
    WHERE m.channel_id = chat_messages.channel_id AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Members can post messages"
ON public.chat_messages FOR INSERT TO authenticated
WITH CHECK (
  public.is_staff(auth.uid())
  AND sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.chat_channel_members m
    WHERE m.channel_id = chat_messages.channel_id AND m.user_id = auth.uid()
  )
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON public.chat_messages(channel_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_members_user ON public.chat_channel_members(user_id);

-- Realtime para el chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- ------------------------------------------------------------
-- 10) help_docs · documentación interna (Ayuda)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.help_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text DEFAULT 'manual',
  content text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.help_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read help docs"
ON public.help_docs FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Backoffice can manage help docs"
ON public.help_docs FOR ALL TO authenticated
USING (public.is_backoffice(auth.uid()))
WITH CHECK (public.is_backoffice(auth.uid()));

-- ------------------------------------------------------------
-- 11) crm_settings · configuración clave/valor del CRM
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_settings (
  key text PRIMARY KEY,
  value text,
  category text NOT NULL DEFAULT 'general',
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read settings"
ON public.crm_settings FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Backoffice can manage settings"
ON public.crm_settings FOR ALL TO authenticated
USING (public.is_backoffice(auth.uid()))
WITH CHECK (public.is_backoffice(auth.uid()));