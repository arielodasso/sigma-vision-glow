import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
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

const POSTS_PER_PAGE = 6;

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

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

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);
  const totalPages = Math.ceil(remainingPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = remainingPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Blog — Sigma Tecnologías | Desarrollo web, SaaS e IA</title>
        <meta name="description" content="Artículos sobre desarrollo web, plataformas SaaS, automatización e inteligencia artificial aplicada. Casos reales y soluciones técnicas." />
        <link rel="canonical" href="https://sigmatecnologiasarg.com/blog" />
        <meta property="og:title" content="Blog — Sigma Tecnologías" />
        <meta property="og:description" content="Desarrollo web, SaaS, automatización e inteligencia artificial aplicada." />
        <meta property="og:url" content="https://sigmatecnologiasarg.com/blog" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Navbar />

      <section className="pt-36 pb-20 lg:pt-44 lg:pb-28">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-14"
          >
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-gradient mb-3">Blog</h1>
            <p className="text-base text-muted-foreground max-w-2xl">
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
            <>
              {/* Featured Post */}
              {featuredPost && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mb-16"
                >
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-6 text-center">
                    Artículo destacado
                  </p>
                  <Link
                    to={`/blog/${featuredPost.slug}`}
                    className="block glass-card rounded-2xl overflow-hidden group lg:grid lg:grid-cols-2"
                  >
                    {featuredPost.image_url && (
                      <div className="aspect-[16/10] lg:aspect-auto lg:min-h-[360px] overflow-hidden">
                        <img
                          src={featuredPost.image_url}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                        />
                      </div>
                    )}
                    <div className="p-8 lg:p-10 flex flex-col justify-center">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3 text-[11px] text-muted-foreground">
                        {featuredPost.category && (
                          <span className="tracking-wide">
                            {featuredPost.category.toUpperCase()}
                          </span>
                        )}
                        {featuredPost.category && featuredPost.published_at && (
                          <span className="text-muted-foreground/40">·</span>
                        )}
                        {featuredPost.published_at && (
                          <span>{formatDate(featuredPost.published_at)}</span>
                        )}
                      </div>
                      <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-3 group-hover:text-foreground/80 transition-colors leading-tight">
                        {featuredPost.title}
                      </h2>
                      {featuredPost.excerpt && (
                        <p className="text-muted-foreground text-sm lg:text-base mb-6 line-clamp-3">
                          {featuredPost.excerpt}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/60 group-hover:text-foreground transition-colors">
                        Leer artículo
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Cards Grid */}
              {paginatedPosts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedPosts.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <Link
                        to={`/blog/${post.slug}`}
                        className="block glass-card rounded-2xl overflow-hidden group h-full flex flex-col"
                      >
                        {post.image_url && (
                          <div className="aspect-[16/10] overflow-hidden">
                            <img
                              src={post.image_url}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2 text-[11px] text-muted-foreground">
                            {post.category && (
                              <span className="tracking-wide">
                                {post.category.toUpperCase()}
                              </span>
                            )}
                            {post.category && post.published_at && (
                              <span className="text-muted-foreground/40">·</span>
                            )}
                            {post.published_at && (
                              <span>{formatDate(post.published_at)}</span>
                            )}
                          </div>
                          <h3 className="font-display text-base font-semibold text-foreground mb-2 group-hover:text-foreground/80 transition-colors leading-snug line-clamp-2">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
                              {post.excerpt}
                            </p>
                          )}
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/50 group-hover:text-foreground/80 transition-colors mt-auto">
                            Leer más
                            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center gap-2 mt-16"
                >
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ← Anterior
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Siguiente →
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Blog;
