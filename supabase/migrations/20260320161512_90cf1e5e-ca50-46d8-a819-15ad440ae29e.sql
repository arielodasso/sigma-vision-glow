DROP POLICY IF EXISTS "Anyone can delete posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can insert posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can update posts" ON public.blog_posts;

CREATE POLICY "Authenticated users can insert posts"
ON public.blog_posts FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts"
ON public.blog_posts FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete posts"
ON public.blog_posts FOR DELETE TO authenticated
USING (true);