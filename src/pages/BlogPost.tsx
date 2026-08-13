import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  category: string | null;
  published_at: string | null;
}

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase
        .from("blog_posts" as any)
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (data) {
        setPost(data as any);
        // Fetch related posts
        const { data: relatedData } = await supabase
          .from("blog_posts" as any)
          .select("id, title, slug, excerpt, image_url, category, published_at")
          .eq("published", true)
          .neq("slug", slug)
          .order("published_at", { ascending: false })
          .limit(3);
        setRelated((relatedData as any) || []);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-36 pb-20 text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-36 pb-20 text-center">
          <p className="text-muted-foreground text-lg">Artículo no encontrado.</p>
          <Link to="/blog" className="text-sm text-foreground/50 hover:text-foreground mt-4 inline-block">
            ← Volver al blog
          </Link>
        </div>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{post.title} — Sigma Tecnologías</title>
        {post.excerpt && <meta name="description" content={post.excerpt} />}
        <link rel="canonical" href={`https://www.sigmatecnologiasarg.com/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        {post.excerpt && <meta property="og:description" content={post.excerpt} />}
        <meta property="og:url" content={`https://www.sigmatecnologiasarg.com/blog/${post.slug}`} />
        <meta property="og:type" content="article" />
        {post.image_url && <meta property="og:image" content={post.image_url} />}
        {post.published_at && <meta property="article:published_time" content={post.published_at} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        {post.excerpt && <meta name="twitter:description" content={post.excerpt} />}
        {post.image_url && <meta name="twitter:image" content={post.image_url} />}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.excerpt || "",
            "image": post.image_url || "",
            "datePublished": post.published_at || "",
            "dateModified": post.published_at || "",
            "author": {
              "@type": "Organization",
              "name": "Sigma Tecnologías",
              "url": "https://www.sigmatecnologiasarg.com"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Sigma Tecnologías",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.sigmatecnologiasarg.com/placeholder.svg"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://www.sigmatecnologiasarg.com/blog/${post.slug}`
            },
            ...(post.category ? { "articleSection": post.category } : {})
          })}
        </script>
      </Helmet>
      <Navbar />

      <article className="pt-36 pb-20 lg:pt-44 lg:pb-28">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-foreground/40 hover:text-foreground/70 transition-colors">
              <ArrowLeft size={14} />
              Blog
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-4">
              {post.category && (
                <span className="text-xs text-foreground/40 font-medium uppercase tracking-wide">{post.category}</span>
              )}
              {post.published_at && (
                <span className="text-xs text-foreground/25">
                  {new Date(post.published_at).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-[1.15] mb-6">

              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl">
                {post.excerpt}
              </p>
            )}
          </motion.div>

          {/* Featured image */}
          {post.image_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mb-12"
            >
              <img
                          loading="lazy"
                          decoding="async"
                src={post.image_url}
                alt={post.title}
                className="w-full rounded-2xl aspect-[21/9] object-cover"
              />
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="prose-sigma max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="border-t border-foreground/[0.04] py-20">
          <div className="container mx-auto px-6 max-w-4xl">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-10">Más artículos</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/blog/${r.slug}`}
                  className="glass-card rounded-xl overflow-hidden group"
                >
                  {r.image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img loading="lazy" decoding="async" src={r.image_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5">
                    <h4 className="font-display text-sm font-semibold text-foreground group-hover:text-foreground/80 transition-colors leading-snug mb-2">
                      {r.title}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-xs text-foreground/40 group-hover:text-foreground/60 transition-colors">
                      Leer <ArrowRight size={10} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <FooterSection />
    </div>
  );
};

export default BlogPost;
