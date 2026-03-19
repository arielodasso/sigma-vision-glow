
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'general',
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published posts"
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (published = true);

CREATE POLICY "Anyone can insert posts"
ON public.blog_posts
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can update posts"
ON public.blog_posts
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can delete posts"
ON public.blog_posts
FOR DELETE
TO anon, authenticated
USING (true);
