import { useState, useEffect, FormEvent } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit2, Eye, EyeOff, LogOut, Map } from "lucide-react";
import BlogAdminLogin from "@/components/BlogAdminLogin";

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
  created_at: string;
}

const BlogAdmin = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSitemap, setShowSitemap] = useState(false);
  const [sitemapXml, setSitemapXml] = useState("");
  const [sitemapLoading, setSitemapLoading] = useState(false);
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts((data as any) || []);
  };

  useEffect(() => {
    if (session) fetchPosts();
  }, [session]);

  const generateSlug = (text: string) =>
    text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const resetForm = () => {
    setTitle(""); setSlug(""); setExcerpt(""); setContent(""); setImageUrl(""); setCategory(""); setPublished(false);
    setEditing(null);
  };

  const loadPost = (post: BlogPost) => {
    setEditing(post);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt || "");
    setContent(post.content);
    setImageUrl(post.image_url || "");
    setCategory(post.category || "");
    setPublished(post.published);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const postData = {
      title,
      slug: slug || generateSlug(title),
      excerpt: excerpt || null,
      content,
      image_url: imageUrl || null,
      category: category || "general",
      published,
      published_at: published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editing) {
        await supabase.from("blog_posts").update(postData as any).eq("id", editing.id);
        toast({ title: "Artículo actualizado" });
      } else {
        await supabase.from("blog_posts").insert(postData as any);
        toast({ title: "Artículo creado" });
      }
      resetForm();
      fetchPosts();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("¿Eliminar este artículo?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    fetchPosts();
    toast({ title: "Artículo eliminado" });
  };

  const togglePublish = async (post: BlogPost) => {
    const newPublished = !post.published;
    await supabase.from("blog_posts").update({
      published: newPublished,
      published_at: newPublished ? new Date().toISOString() : null,
    } as any).eq("id", post.id);
    fetchPosts();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchSitemap = async () => {
    setSitemapLoading(true);
    try {
      const res = await fetch(
        `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID || 'qxkeungqbgaytxdfhccn'}.supabase.co/functions/v1/sitemap`
      );
      const xml = await res.text();
      setSitemapXml(xml);
      setShowSitemap(true);
    } catch {
      toast({ title: "Error al cargar sitemap", variant: "destructive" });
    } finally {
      setSitemapLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return <BlogAdminLogin />;
  }

  const inputClass = "w-full bg-card border border-foreground/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-foreground/20 transition-colors";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex items-center justify-between mb-10">
            <h1 className="font-display text-3xl font-bold text-foreground">Blog Admin</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors"
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-foreground/40 mb-2 uppercase tracking-wide">Título</label>
                <input
                  required
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); if (!editing) setSlug(generateSlug(e.target.value)); }}
                  className={inputClass}
                  placeholder="Título del artículo"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/40 mb-2 uppercase tracking-wide">Slug</label>
                <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} placeholder="url-del-articulo" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/40 mb-2 uppercase tracking-wide">Extracto</label>
                <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className={inputClass} placeholder="Breve descripción..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/40 mb-2 uppercase tracking-wide">Contenido (HTML)</label>
                <textarea required value={content} onChange={(e) => setContent(e.target.value)} rows={10} className={inputClass} placeholder="<p>Contenido del artículo...</p>" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/40 mb-2 uppercase tracking-wide">URL de imagen</label>
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={inputClass} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/40 mb-2 uppercase tracking-wide">Categoría</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} placeholder="desarrollo, saas, automatización..." />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="accent-foreground" />
                <span className="text-sm text-foreground/70">Publicar</span>
              </label>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="bg-foreground text-background px-6 py-3 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50">
                  {editing ? "Actualizar" : "Crear artículo"}
                </button>
                {editing && (
                  <button type="button" onClick={resetForm} className="text-sm text-foreground/50 hover:text-foreground px-4">
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-3">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Artículos ({posts.length})</h2>
              {posts.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">No hay artículos aún.</p>
              )}
              {posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-foreground/[0.06] hover:border-foreground/[0.10] transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                    <p className="text-xs text-foreground/30">{post.category} · {post.published ? "publicado" : "borrador"}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => togglePublish(post)} className="p-2 text-foreground/30 hover:text-foreground transition-colors" title={post.published ? "Despublicar" : "Publicar"}>
                      {post.published ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button onClick={() => loadPost(post)} className="p-2 text-foreground/30 hover:text-foreground transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => deletePost(post.id)} className="p-2 text-foreground/30 hover:text-destructive transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogAdmin;
