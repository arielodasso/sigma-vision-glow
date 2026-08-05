import { useState, useEffect, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Pencil, Eye, EyeOff, ExternalLink, Map, ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";

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
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSitemap, setShowSitemap] = useState(false);
  const [sitemapXml, setSitemapXml] = useState("");
  const [sitemapLoading, setSitemapLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const PAGE_SIZE = 6;
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [published, setPublished] = useState(false);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts((data as any) || []);
  };

  useEffect(() => { fetchPosts(); }, []);

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

  const fetchSitemap = async () => {
    setSitemapLoading(true);
    try {
      const res = await fetch("/sitemap.xml", { cache: "no-store" });
      const xml = await res.text();
      setSitemapXml(xml);
      setShowSitemap(true);
    } catch {
      toast({ title: "Error al cargar sitemap", variant: "destructive" });
    } finally {
      setSitemapLoading(false);
    }
  };

  const inputClass = "w-full bg-card border border-foreground/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-foreground/20 transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-3xl font-bold text-foreground">Blog</h1>
        <button
          onClick={fetchSitemap}
          disabled={sitemapLoading}
          className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors"
        >
          <Map size={14} />
          {sitemapLoading ? "Cargando..." : "Ver Sitemap"}
        </button>
      </div>

      {showSitemap && (
        <div className="mb-8 p-5 rounded-xl border border-foreground/[0.08] bg-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Sitemap actual (dinámico)</h3>
            <div className="flex gap-3">
              <button
                onClick={() => { navigator.clipboard.writeText(sitemapXml); toast({ title: "XML copiado al portapapeles" }); }}
                className="text-xs text-foreground/50 hover:text-foreground transition-colors"
              >
                Copiar XML
              </button>
              <button onClick={() => setShowSitemap(false)} className="text-xs text-foreground/50 hover:text-foreground transition-colors">
                Cerrar
              </button>
            </div>
          </div>
          <pre className="text-xs text-foreground/60 bg-background rounded-lg p-4 overflow-auto max-h-64 whitespace-pre-wrap">{sitemapXml}</pre>
        </div>
      )}

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
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Artículos publicados y borradores</h2>
            <span className="text-xs text-foreground/40">{posts.length} en total</span>
          </div>

          <div className="relative mb-4">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por título, slug o categoría"
              className={`${inputClass} pl-10`}
            />
          </div>

          {posts.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Todavía no creaste ningún artículo. Usá el formulario para publicar el primero.
            </p>
          )}
          {(() => {
            const q = search.trim().toLowerCase();
            const filtered = q
              ? posts.filter((p) =>
                  [p.title, p.slug, p.category || ""].some((v) => v.toLowerCase().includes(q))
                )
              : posts;
            const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
            const safePage = Math.min(page, totalPages);
            const start = (safePage - 1) * PAGE_SIZE;
            const visible = filtered.slice(start, start + PAGE_SIZE);
            return (
              <>
                {posts.length > 0 && filtered.length === 0 && (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No encontramos artículos que coincidan con "{search}".
                  </p>
                )}
                {visible.map((post) => (
                  <div
                    key={post.id}
                    className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${
                      editing?.id === post.id
                        ? "border-foreground/25 bg-foreground/[0.03]"
                        : "border-foreground/[0.06] hover:border-foreground/[0.12]"
                    }`}
                  >
                    <button onClick={() => loadPost(post)} className="min-w-0 text-left flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                            post.published
                              ? "border-foreground/20 text-foreground/70"
                              : "border-foreground/10 text-foreground/35"
                          }`}
                        >
                          {post.published ? "Publicado" : "Borrador"}
                        </span>
                        <span className="text-xs text-foreground/30 truncate">/blog/{post.slug}</span>
                      </div>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => togglePublish(post)}
                        className="p-2 text-foreground/30 hover:text-foreground transition-colors"
                        title={post.published ? "Pasar a borrador" : "Publicar ahora"}
                      >
                        {post.published ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-foreground/30 hover:text-foreground transition-colors"
                        title="Abrir artículo en el sitio"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button onClick={() => loadPost(post)} className="p-2 text-foreground/30 hover:text-foreground transition-colors" title="Editar artículo">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deletePost(post.id)} className="p-2 text-foreground/30 hover:text-destructive transition-colors" title="Eliminar artículo">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}


                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      className="flex items-center gap-1 text-xs text-foreground/50 hover:text-foreground disabled:opacity-30 disabled:hover:text-foreground/50 transition-colors"
                    >
                      <ChevronLeft size={14} /> Anterior
                    </button>
                    <span className="text-xs text-foreground/40">
                      Página {safePage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      className="flex items-center gap-1 text-xs text-foreground/50 hover:text-foreground disabled:opacity-30 disabled:hover:text-foreground/50 transition-colors"
                    >
                      Siguiente <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default BlogAdmin;
