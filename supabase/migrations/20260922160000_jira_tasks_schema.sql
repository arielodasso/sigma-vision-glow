-- ============================================================
-- Jira-like Scrum Tasks Schema for Sigma Tecnologías
-- ============================================================

-- ------------------------------------------------------------
-- 1) Sprints table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  goal text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read sprints"
ON public.sprints FOR SELECT TO authenticated
USING (public.has_permission('tasks.read'));

CREATE POLICY "Backoffice can manage sprints"
ON public.sprints FOR ALL TO authenticated
USING (public.is_backoffice(auth.uid()))
WITH CHECK (public.is_backoffice(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_sprints_status ON public.sprints(status);
CREATE INDEX IF NOT EXISTS idx_sprints_dates ON public.sprints(start_date, end_date);

-- ------------------------------------------------------------
-- 2) Extend tasks table with Jira-like fields
-- ------------------------------------------------------------
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS key text UNIQUE,
ADD COLUMN IF NOT EXISTS issue_type text NOT NULL DEFAULT 'task' CHECK (issue_type IN ('epic', 'story', 'task', 'bug', 'subtask')),
ADD COLUMN IF NOT EXISTS story_points integer CHECK (story_points IS NULL OR story_points IN (1,2,3,5,8,13,21)),
ADD COLUMN IF NOT EXISTS epic_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS sprint_id uuid REFERENCES public.sprints(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add check constraint to ensure subtasks have parent and epics don't
ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_hierarchy_check;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_hierarchy_check CHECK (
  (issue_type = 'subtask' AND parent_id IS NOT NULL) OR
  (issue_type != 'subtask' AND parent_id IS NULL) OR
  (issue_type = 'epic' AND epic_id IS NULL) OR
  (issue_type != 'epic')
);

-- Add status check constraint for Jira-like statuses
ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_status_check;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_status_check CHECK (status IN ('backlog', 'pending', 'in_progress', 'in_review', 'done', 'cancelled'));

-- Add priority check constraint
ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_priority_check;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- ------------------------------------------------------------
-- 3) Auto-generate issue keys (e.g., SIGMA-1, SIGMA-2)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.tasks_generate_key()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_prefix text := 'SIGMA';
  next_num integer;
BEGIN
  IF NEW.key IS NULL THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(key FROM project_prefix || '-(\d+)') AS integer)), 0) + 1
    INTO next_num
    FROM public.tasks
    WHERE key LIKE project_prefix || '-%';
    
    NEW.key := project_prefix || '-' || next_num;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tasks_generate_key ON public.tasks;
CREATE TRIGGER trg_tasks_generate_key
BEFORE INSERT ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.tasks_generate_key();

-- ------------------------------------------------------------
-- 4) Update created_by trigger to also set reporter_id
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.tasks_set_created_by()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.created_by := auth.uid();
  IF NEW.reporter_id IS NULL THEN
    NEW.reporter_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------
-- 5) Indexes for new columns
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tasks_key ON public.tasks(key);
CREATE INDEX IF NOT EXISTS idx_tasks_issue_type ON public.tasks(issue_type);
CREATE INDEX IF NOT EXISTS idx_tasks_epic_id ON public.tasks(epic_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON public.tasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sprint_id ON public.tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_tasks_reporter_id ON public.tasks(reporter_id);
CREATE INDEX IF NOT EXISTS idx_tasks_story_points ON public.tasks(story_points);
CREATE INDEX IF NOT EXISTS idx_tasks_status_sprint ON public.tasks(status, sprint_id);

-- ------------------------------------------------------------
-- 6) RLS policies updated for new fields
-- ------------------------------------------------------------
-- The existing policies should work, but let's ensure they cover the new columns

-- ------------------------------------------------------------
-- 7) Sprint updated_at trigger
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sprints_updated_at()
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

DROP TRIGGER IF EXISTS trg_sprints_updated_at ON public.sprints;
CREATE TRIGGER trg_sprints_updated_at
BEFORE UPDATE ON public.sprints
FOR EACH ROW EXECUTE FUNCTION public.sprints_updated_at();

-- ------------------------------------------------------------
-- 8) Tasks updated_at trigger
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.tasks_updated_at()
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

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.tasks;
CREATE TRIGGER trg_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.tasks_updated_at();

-- ------------------------------------------------------------
-- 9) Helper view for sprint burndown data
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW public.sprint_burndown AS
SELECT
  s.id AS sprint_id,
  s.name AS sprint_name,
  s.start_date,
  s.end_date,
  s.status,
  COUNT(t.id) AS total_issues,
  COUNT(CASE WHEN t.issue_type IN ('story', 'task', 'bug') THEN 1 END) AS estimated_issues,
  SUM(CASE WHEN t.issue_type IN ('story', 'task', 'bug') THEN COALESCE(t.story_points, 0) END) AS total_story_points,
  SUM(CASE WHEN t.status = 'done' AND t.issue_type IN ('story', 'task', 'bug') THEN COALESCE(t.story_points, 0) END) AS completed_story_points,
  ARRAY_AGG(
    jsonb_build_object(
      'date', d::date,
      'remaining_points', (
        SELECT SUM(COALESCE(t2.story_points, 0))
        FROM public.tasks t2
        WHERE t2.sprint_id = s.id
        AND t2.issue_type IN ('story', 'task', 'bug')
        AND (t2.status != 'done' OR t2.completed_at > d)
      )
    ) ORDER BY d
  ) AS burndown_data
FROM public.sprints s
LEFT JOIN public.tasks t ON t.sprint_id = s.id
LEFT JOIN generate_series(
  COALESCE(s.start_date, CURRENT_DATE),
  COALESCE(s.end_date, CURRENT_DATE + INTERVAL '14 days'),
  INTERVAL '1 day'
) AS d ON true
WHERE s.status IN ('active', 'completed')
GROUP BY s.id, s.name, s.start_date, s.end_date, s.status;

-- ------------------------------------------------------------
-- 10) Grant permissions
-- ------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sprints TO authenticated;
GRANT ALL ON public.sprints TO service_role;