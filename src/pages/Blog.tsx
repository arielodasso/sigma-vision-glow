import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
  category: string | null;
  published_at: string | null;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts" as any)
        .select("id, title, slug, excerpt, image_url, category, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false });
      setPosts((data as any) || []);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-36 pb-20 lg:pt-44 lg:pb-28">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-gradient mb-4">Blog</h1>
            <p className="text-lg text-muted-foreground mb-16">
              Desarrollo web, SaaS, automatización, inteligencia artificial aplicada y casos reales.
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Cargando...</p>
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-20"
            >
              <p className="text-muted-foreground text-lg">Próximamente.</p>
              <p className="text-sm text-foreground/30 mt-2">Estamos preparando contenido.</p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="block glass-card rounded-2xl overflow-hidden group"
                  >
                    {post.image_url && (
                      <div className="aspect-[21/9] overflow-hidden">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-3">
                        {post.category && (
                          <span className="text-xs text-foreground/40 font-medium uppercase tracking-wide">{post.category}</span>
                        )}
                        {post.published_at && (
                          <span className="text-xs text-foreground/25">
                            {new Date(post.published_at).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}
                          </span>
                        )}
                      </div>
                      <h2 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-foreground/80 transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm mb-4">{post.excerpt}</p>
                      )}
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground/50 group-hover:text-foreground/80 transition-colors">
                        Leer artículo
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Blog;
