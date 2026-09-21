-- ============================================================
-- CRM Sigma Tecnologías · FIXES
-- ============================================================

-- El listado de blog del admin necesita ver artículos publicados y
-- borradores/despublicados. Hasta ahora la única política SELECT era
-- "Anyone can read published posts" (solo published = true), con lo cual
-- al despublicar el artículo dejaba de aparecer en el admin.
CREATE POLICY "Backoffice can read all posts"
ON public.blog_posts FOR SELECT TO authenticated
USING (public.is_backoffice(auth.uid()));