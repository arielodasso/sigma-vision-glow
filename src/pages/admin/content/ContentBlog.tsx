import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, Search, Edit, Trash2, Eye, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import BlogPostModal from "./BlogPostModal";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  category: string | null;
  published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  related_service: string | null;
  created_at: string;
  updated_at: string;
}

const POSTS_PER_PAGE = 10;

const ContentBlog = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPosts(data as BlogPost[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este artículo?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Artículo eliminado" });
      fetchPosts();
    }
  };

  const handlePublish = async (id: string, published: boolean) => {
    const { error } = await supabase
      .from("blog_posts")
      .update({ published, published_at: published ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: published ? "Publicado" : "Despublicado" });
      fetchPosts();
    }
  };

  const openCreate = () => {
    setEditingPost(null);
    setModalOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contenidos · Blog · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient">Blog</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona los artículos del blog</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            <Plus size={16} />
            Nuevo artículo
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5 mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
            <input
              type="text"
              placeholder="Buscar artículos..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full glass-input rounded-xl px-10 py-3 text-sm text-foreground placeholder:text-foreground/25"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Cargando...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <p className="text-lg">No hay artículos</p>
              <p className="text-sm mt-1">Crea tu primer artículo para empezar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/[0.06] text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    <th className="p-4">Artículo</th>
                    <th className="p-4 hidden md:table-cell">Categoría</th>
                    <th className="p-4 hidden lg:table-cell">Estado</th>
                    <th className="p-4">Actualizado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {paginatedPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">{post.title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">{post.slug}</p>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        {post.category ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-foreground/[0.05] text-foreground/70">
                            {post.category}
                          </span>
                        ) : (
                          <span className="text-sm text-foreground/30">—</span>
                        )}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          post.published
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {post.published ? "Publicado" : "Borrador"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-foreground/60">
                          {new Date(post.updated_at).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(post)}
                            className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handlePublish(post.id, !post.published)}
                            className={`p-2 rounded-lg transition-colors ${
                              post.published
                                ? "text-amber-400 hover:bg-amber-500/10"
                                : "text-emerald-400 hover:bg-emerald-500/10"
                            }`}
                            title={post.published ? "Despublicar" : "Publicar"}
                          >
                            {post.published ? <Eye size={14} className="opacity-50" /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 rounded-lg text-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-foreground/[0.04]">
                <span className="text-sm text-foreground/50">
                  Página {currentPage} de {totalPages} · {filteredPosts.length} artículos
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {modalOpen && (
            <BlogPostModal
              post={editingPost}
              onClose={() => { setModalOpen(false); setEditingPost(null); }}
              onSuccess={fetchPosts}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContentBlog;