
CREATE TABLE IF NOT EXISTS public.sprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  goal text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'planning',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sprints TO authenticated;
GRANT ALL ON public.sprints TO service_role;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage sprints" ON public.sprints;
CREATE POLICY "Staff can manage sprints" ON public.sprints FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'superadmin') OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'empleado'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'superadmin') OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'empleado'));
DROP TRIGGER IF EXISTS update_sprints_updated_at ON public.sprints;
CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON public.sprints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS key text,
  ADD COLUMN IF NOT EXISTS reporter_id uuid,
  ADD COLUMN IF NOT EXISTS issue_type text NOT NULL DEFAULT 'task',
  ADD COLUMN IF NOT EXISTS story_points integer,
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS epic_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sprint_id uuid REFERENCES public.sprints(id) ON DELETE SET NULL;

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS image_url text;
