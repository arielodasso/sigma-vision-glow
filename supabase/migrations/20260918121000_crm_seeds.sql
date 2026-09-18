-- ============================================================
-- CRM Sigma Tecnologías · Portal clientes, storage, seeds
-- ============================================================

-- ------------------------------------------------------------
-- 1) RPC del portal de clientes (token como credencial)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.client_portal_info(_token text)
RETURNS SETOF public.clients
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.*
  FROM public.client_invites i
  JOIN public.clients c ON c.id = i.client_id
  WHERE i.token = _token
    AND i.status IN ('pending','accepted')
    AND (i.expires_at IS NULL OR i.expires_at > now())
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.client_portal_budgets(_token text)
RETURNS SETOF public.budgets
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.*
  FROM public.client_invites i
  JOIN public.budgets b ON b.client_id = i.client_id
  WHERE i.token = _token
    AND i.status IN ('pending','accepted')
    AND (i.expires_at IS NULL OR i.expires_at > now())
  ORDER BY b.created_at DESC
$$;

CREATE OR REPLACE FUNCTION public.client_portal_documents(_token text)
RETURNS SETOF public.documents
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT d.*
  FROM public.client_invites i
  JOIN public.documents d ON d.client_id = i.client_id
  WHERE i.token = _token
    AND i.status IN ('pending','accepted')
    AND (i.expires_at IS NULL OR i.expires_at > now())
  ORDER BY d.created_at DESC
$$;

CREATE OR REPLACE FUNCTION public.client_invite_accept(_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.client_invites
  SET status = 'accepted',
      accepted_at = COALESCE(accepted_at, now())
  WHERE token = _token
    AND status = 'pending'
    AND (expires_at IS NULL OR expires_at > now());
END;
$$;

REVOKE ALL ON FUNCTION public.client_portal_info(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.client_portal_budgets(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.client_portal_documents(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.client_invite_accept(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.client_portal_info(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.client_portal_budgets(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.client_portal_documents(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.client_invite_accept(text) TO anon, authenticated;

-- ------------------------------------------------------------
-- 2) Buckets de storage
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas del bucket documents (staff lee, backoffice gestiona)
CREATE POLICY "documents_bucket_staff_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND public.is_staff(auth.uid()));

CREATE POLICY "documents_bucket_backoffice_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND public.is_backoffice(auth.uid()));

CREATE POLICY "documents_bucket_backoffice_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND public.is_backoffice(auth.uid()));

CREATE POLICY "documents_bucket_backoffice_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND public.is_backoffice(auth.uid()));

-- ------------------------------------------------------------
-- 3) Seed · permisos RBAC
-- ------------------------------------------------------------
INSERT INTO public.permissions (code, description) VALUES
  ('tasks.read', 'Ver tareas asignadas/creadas'),
  ('tasks.write', 'Crear y actualizar tareas'),
  ('tasks.assign', 'Asignar tareas y ver todas'),
  ('clients.read', 'Ver clientes'),
  ('clients.write', 'Crear/editar clientes'),
  ('clients.invite', 'Invitaciones y portal de clientes'),
  ('budgets.manage', 'Gestionar presupuestos'),
  ('contents.manage', 'Gestionar contenidos del sitio (blog, testimonios, faqs)'),
  ('media.manage', 'Gestionar multimedia'),
  ('seo.read', 'Ver dashboards SEO'),
  ('agenda.read', 'Ver agenda'),
  ('team.manage', 'Gestionar equipo y roles'),
  ('chat.read', 'Leer chat de equipo'),
  ('chat.write', 'Escribir en chat de equipo'),
  ('docs.read', 'Leer documentos internos'),
  ('docs.manage', 'Gestionar documentos'),
  ('help.manage', 'Gestionar documentación interna'),
  ('settings.manage', 'Gestionar configuración del CRM'),
  ('contacts.read', 'Ver bandeja de contactos')
ON CONFLICT (code) DO NOTHING;

-- superadmin + admin (legacy) → acceso completo
INSERT INTO public.role_permissions (role, permission)
SELECT r::public.app_role, p.code
FROM (VALUES ('superadmin'::public.app_role), ('admin'::public.app_role)) AS roles(r)
CROSS JOIN public.permissions p
ON CONFLICT DO NOTHING;

-- empleado → módulos básicos
INSERT INTO public.role_permissions (role, permission)
SELECT 'empleado'::public.app_role, p.code
FROM public.permissions p
WHERE p.code IN ('tasks.read','tasks.write','chat.read','chat.write','agenda.read','docs.read','contacts.read')
ON CONFLICT DO NOTHING;

-- moderator (legacy) → contenidos + colaboración
INSERT INTO public.role_permissions (role, permission)
SELECT 'moderator'::public.app_role, p.code
FROM public.permissions p
WHERE p.code IN ('tasks.read','tasks.write','chat.read','chat.write','agenda.read','docs.read','contents.manage','media.manage','contacts.read')
ON CONFLICT DO NOTHING;

-- user (legacy) → mínimo
INSERT INTO public.role_permissions (role, permission)
SELECT 'user'::public.app_role, p.code
FROM public.permissions p
WHERE p.code IN ('tasks.read','chat.read')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 4) Seed · superadmin
-- ------------------------------------------------------------
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, r.role
FROM auth.users u
CROSS JOIN (VALUES ('superadmin'::public.app_role), ('admin'::public.app_role)) AS r(role)
WHERE u.email = 'arielodassotec@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Asegurar que el superadmin tenga perfil
INSERT INTO public.profiles (id, full_name, title)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'full_name', 'Ariel Odasso'), 'Fundador · Superadmin'
FROM auth.users u
WHERE u.email = 'arielodassotec@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 5) Seed · configuración CRM
-- ------------------------------------------------------------
INSERT INTO public.crm_settings (key, value, category) VALUES
  ('google_calendar_embed_url', 'https://calendar.google.com/calendar/embed?src=contacto%40sigmatecnologiasarg.com&ctz=America%2FArgentina%2FBuenos_Aires', 'agenda'),
  ('google_calendar_appointments_url', 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2PpWB3iEynhEfWzNK523UydioImJl74qXNFHBkB-O68h2YSwZm9x34jFwbm7yl7ErrcAV6EX5U?gv=true', 'agenda'),
  ('company_whatsapp', '5492494556374', 'contacto')
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------
-- 6) Seed · canal general de chat + miembro
-- ------------------------------------------------------------
INSERT INTO public.chat_channels (id, name, description, is_default)
VALUES (gen_random_uuid(), 'general', 'Canal general del equipo', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.chat_channel_members (channel_id, user_id)
SELECT cc.id, ur.user_id
FROM public.chat_channels cc
JOIN public.user_roles ur ON ur.role IN ('admin','superadmin','moderator','empleado')
WHERE cc.is_default = true
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 8) Seed · FAQ de servicios y proceso (administrables)
-- ------------------------------------------------------------
INSERT INTO public.faqs (category, question, answer, published, sort_order) VALUES
  ('general', '¿Cómo empiezo un proyecto con Sigma Tecnologías?', 'Agendás una reunión, nos contás la necesidad y definimos alcance, plazos y presupuesto sin compromiso. Trabajamos por etapas claras y con comunicación directa.', true, 1),
  ('general', '¿Trabajan solo en Argentina?', 'Somos de Tandil, Buenos Aires, Argentina, y trabajamos con clientes en todo el país y el exterior.', true, 2),
  ('general', '¿Qué productos propios desarrollan?', 'Desarrollamos productos tecnológicos propios como Sigma Analytics (analítica de rendimiento deportivo) y Sigma Trend Engine (motor de tendencias con IA).', true, 3),
  ('general', '¿El sitio o sistema queda listo para operar?', 'Sí. Entregamos producto en producción, documentación y acompañamiento durante y después de la entrega.', true, 4),

  ('desarrollo-web', '¿Cuánto tarda un desarrollo web a medida?', 'Depende del alcance. Una landing optimizada se puede entregar en 1 a 3 semanas; un sitio con panel de administración suele llevar de 4 a 8 semanas. En la reunión inicial definimos un plazo concreto para tu caso.', true, 1),
  ('desarrollo-web', '¿Incluyen diseño o solo desarrollo?', 'Cubrimos diseño con propósito, desarrollo y puesta en producción. Interfaces orientadas a negocio, usabilidad y conversión.', true, 2),
  ('desarrollo-web', '¿Puedo actualizar el contenido yo mismo?', 'Sí. En muchos proyectos integramos un panel de administración para que edites contenido sin depender de un equipo técnico.', true, 3),

  ('automatizacion', '¿Qué tipo de procesos se pueden automatizar?', 'Tareas repetitivas, integraciones entre herramientas, generación de reportes, seguimiento de clientes y notificaciones, entre otros.', true, 1),
  ('automatizacion', '¿Necesito reemplazar mis herramientas actuales?', 'No. Las automatizaciones conectan las herramientas que ya usás (planillas, CRM, email, WhatsApp, etc.) para eliminar trabajo manual.', true, 2),
  ('automatizacion', '¿Cómo se mide el resultado?', 'Antes de empezar definimos indicadores concretos: tiempo ahorrado, errores eliminados y tareas procesadas, para que el resultado sea verificable.', true, 3),

  ('desarrollo-saas', '¿Pueden construir un SaaS desde cero?', 'Sí. Diseñamos, desarrollamos y lanzamos plataformas de software como servicio con modelo recurrente, incluyendo panel de administración.', true, 1),
  ('desarrollo-saas', '¿La plataforma queda nuestra al terminar?', 'Sí. El código y la infraestructura se transfieren a tu propiedad al completar el proyecto.', true, 2),
  ('desarrollo-saas', '¿Cómo se factura?', 'Cada proyecto define su esquema: desarrollo inicial y mantenimiento mensual opcional. Se detalla en la propuesta sin costos ocultos.', true, 3),

  ('desarrollo-software', '¿Desarrollan sistemas a medida sobre mi proceso?', 'Sí. Analizamos tu operación y construimos el sistema alrededor de tus procesos reales, no al revés.', true, 1),
  ('desarrollo-software', '¿Incluyen panel de administración?', 'En general sí. La mayoría de los sistemas incluyen paneles para gestionar usuarios, contenido y operación diaria.', true, 2),

  ('inteligencia-artificial', '¿Qué resuelve la IA en un proyecto?', 'Análisis de datos, motores de recomendación, automatización con lenguaje natural, generación de reportes e insights estratégicos.', true, 1),
  ('inteligencia-artificial', '¿Necesito conocimientos técnicos de IA?', 'No. Lo integramos nosotros y mantenemos el foco en el resultado de negocio.', true, 2),

  ('integraciones', '¿Se integran con las herramientas que ya uso?', 'Sí. Trabajamos con APIs de herramientas populares y plataformas de automatización como n8n y Make.', true, 1),
  ('integraciones', '¿Una integración puede romper mi sistema?', 'Trabajamos con entornos de prueba y monitoreo para minimizar riesgos. Validamos todo antes de tocar producción.', true, 2)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 9) Seed · documentación interna (Ayuda)
-- ------------------------------------------------------------
INSERT INTO public.help_docs (slug, title, category, content, sort_order) VALUES
  ('como-usar-el-crm', 'Cómo usar el CRM', 'manual',
   '## Bienvenido al CRM de Sigma Tecnologías\n\nEste espacio centraliza tareas, clientes, presupuestos, documentos y comunicación interna del equipo.\n\n### Módulos\n- **Tareas**: organizá el trabajo del equipo.\n- **Contenidos**: blog, testimonios y FAQ.\n- **Clientes**: gestión comercial y presupuestos.\n- **Equipo**: miembros, roles y organigrama.\n- **Chat Equipo**: comunicación interna en tiempo real.\n- **Conocimiento**: documentos, ayuda y portal editorial.', 1),
  ('gestionar-tareas', 'Gestionar tareas', 'manual',
   '## Tareas\n\nEl superadmin crea tareas, las asigna, define prioridad y vencimiento, y las filtra por estado.\n\nLos empleados ven sus tareas asignadas, pueden cambiar su estado y marcarlas como completadas.\n\nAl cambiar el estado de una tarea asignada, se notifica al superadmin por email.', 2),
  ('gestionar-clientes', 'Gestionar clientes', 'manual',
   '## Clientes\n\nCada cliente puede tener: documentos, presupuestos y un acceso restringido a su propia información a través de un enlace de invitación.\n\nLas invitaciones se envían por email y el cliente solo ve su información, nunca la de otros clientes.', 3)
ON CONFLICT (slug) DO NOTHING;