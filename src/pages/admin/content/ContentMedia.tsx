import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, Search, Edit, Trash2, Image, Loader2, Upload, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import MediaModal from "./MediaModal";

interface MediaAsset {
  id: string;
  name: string;
  path: string;
  url: string;
  kind: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_by: string | null;
  created_at: string;
}

const ContentMedia = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);

  const fetchAssets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAssets(data as MediaAsset[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const filtered = assets.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.path.toLowerCase().includes(search.toLowerCase()) ||
    a.kind.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, path: string) => {
    if (!confirm("¿Eliminar este archivo?")) return;
    const { error: storageError } = await supabase.storage.from("media").remove([path]);
    if (storageError) {
      toast({ title: "Error", description: storageError.message, variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("media_assets").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Archivo eliminado" });
      fetchAssets();
    }
  };

  const openCreate = () => {
    setEditingAsset(null);
    setModalOpen(true);
  };

  const openEdit = (asset: MediaAsset) => {
    setEditingAsset(asset);
    setModalOpen(true);
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contenidos · Multimedia · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient">Multimedia</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona imágenes y archivos</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            <Upload size={16} />
            Subir archivo
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
              placeholder="Buscar archivos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Image className="mx-auto text-foreground/20 mb-4" size={48} />
              <p className="text-lg">No hay archivos</p>
              <p className="text-sm mt-1">Sube tu primer archivo</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
              {filtered.map((asset) => (
                <div key={asset.id} className="group relative glass-card rounded-xl overflow-hidden">
                  {asset.mime_type?.startsWith("image/") ? (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-foreground/[0.03]">
                      <Image className="text-foreground/30" size={32} />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm font-medium text-foreground truncate">{asset.name}</p>
                    <p className="text-xs text-foreground/40 truncate">{asset.path}</p>
                    <p className="text-xs text-foreground/30 mt-1">{formatSize(asset.size_bytes)} · {asset.kind}</p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 p-2">
                    <button
                      onClick={() => openEdit(asset)}
                      className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70"
                      title="Editar"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id, asset.path)}
                      className="p-2 rounded-lg bg-red-500/50 text-white hover:bg-red-500/70"
                      title="Eliminar"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {modalOpen && (
            <MediaModal
              asset={editingAsset}
              onClose={() => { setModalOpen(false); setEditingAsset(null); }}
              onSuccess={fetchAssets}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContentMedia;