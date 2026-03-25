

# Plan: Optimizar indexación SEO del blog

## Problema
Los blogs son accesibles públicamente pero tienen limitaciones para ser indexados por Google:
- No existe sitemap.xml (referenciado en robots.txt pero inexistente)
- No hay meta tags dinámicos por artículo (título, descripción, OG tags)
- Sin canonical URLs por post
- Sin links internos hacia /blog desde la navegación principal

## Solución

### 1. Generar sitemap.xml dinámico via Edge Function
Crear una edge function `sitemap` que consulte los posts publicados y genere XML dinámico con todas las URLs del sitio (home, contacto, blog, y cada post individual).

### 2. Meta tags SEO dinámicos via Edge Function (prerender)
Crear una edge function `og-metadata` que intercepte requests de crawlers (Googlebot, Twitterbot, etc.) y devuelva HTML con meta tags dinámicos (title, description, og:image) para cada artículo. Alternativa más simple: usar `react-helmet-async` para actualizar el `<head>` desde el cliente (funciona parcialmente con Google ya que renderiza JS, pero no con redes sociales).

### 3. Canonical URLs en BlogPost
Agregar `<link rel="canonical">` dinámico en cada página de artículo usando `document.head`.

### 4. Link interno al blog (opcional, sutil)
Agregar un link al blog en el footer para que Google pueda descubrirlo vía crawling, sin exponerlo en el navbar principal.

## Detalle técnico

**Edge Function `sitemap`:**
- Ruta: `supabase/functions/sitemap/index.ts`
- Consulta `blog_posts` donde `published = true`
- Retorna XML con URLs estáticas + dinámicas
- Se configura con `verify_jwt = false`

**Meta tags dinámicos (react-helmet-async):**
- Instalar `react-helmet-async`
- Agregar `<Helmet>` en `BlogPost.tsx` con title, description y OG tags del post
- Google renderiza JS así que los lee; para redes sociales se necesitaría SSR/edge pero es una mejora incremental

**Footer link:**
- Agregar "Blog" discretamente en el footer apuntando a `/blog`

## Archivos a crear/modificar
- `supabase/functions/sitemap/index.ts` (nuevo)
- `supabase/config.toml` (agregar config de sitemap)
- `src/pages/BlogPost.tsx` (agregar Helmet con meta tags)
- `src/pages/Blog.tsx` (agregar Helmet)
- `src/components/FooterSection.tsx` (agregar link a /blog)
- Instalar `react-helmet-async`, agregar `HelmetProvider` en App.tsx

