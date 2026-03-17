import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { motion } from "framer-motion";

const blogPosts: { slug: string; title: string; excerpt: string; date: string; category: string }[] = [];

const Blog = () => {
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

          {blogPosts.length === 0 ? (
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
            <div className="space-y-6">
              {blogPosts.map((post, i) => (
                <motion.a
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="block glass-card rounded-2xl p-8 group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-sigma-yellow font-medium uppercase">{post.category}</span>
                    <span className="text-xs text-foreground/30">{post.date}</span>
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-foreground/80 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm">{post.excerpt}</p>
                </motion.a>
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
