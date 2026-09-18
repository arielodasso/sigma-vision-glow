import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, Search, Edit, Trash2, FolderKanban, Loader2, Upload, Download, Eye, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import DocumentModal from "./DocumentModal";

interface Document {
  id: string;
  name: string;
  description: string | null;
  path: string;
  url: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  client_id: string | null;
  created_by: string | null;
  created_at: string;
  client?: { name: string; company: string | null };
}

const ClientDocuments = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("documents")
      .select(`
        *,
        client:clients!documents_client_id_fkey(name, company)
      `)
      .order("created_at", { ascending: false });
    if (data) setDocuments(data as Document[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.client?.name.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, path: string) => {
    if (!confirm("¿Eliminar este documento?")) return;
    const { error: storageError } = await supabase.storage.from("documents").remove([path]);
    if (storageError) {
      toast({ title: "Error", description: storageError.message, variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Documento eliminado" });
      fetchDocuments();
    }
  };

  const openCreate = () => {
    setEditingDoc(null);
    setModalOpen(true);
  };

  const openEdit = (doc: Document) => {
    setEditingDoc(doc);
    setModalOpen(true);
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mime: string | null) => {
    if (!mime) return FileText;
    if (mime.startsWith("image/")) return Eye;
    if (mime.startsWith("application/pdf")) return FileText;
    if (mime.startsWith("video/")) return Eye;
    return FileText;
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Clientes · Documentos · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient">Documentos</h1>
            <p className="text-sm text-muted-foreground mt-1">Drive interno de documentos de clientes</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            <Upload size={16} />
            Subir documento
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
              placeholder="Buscar documentos..."
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
              <FolderKanban className="mx-auto text-foreground/20 mb-4" size={48} />
              <p className="text-lg">No hay documentos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/[0.06] text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    <th className="p-4">Documento</th>
                    <th className="p-4 hidden md:table-cell">Cliente</th>
                    <th className="p-4 hidden lg:table-cell">Tipo</th>
                    <th className="p-4">Tamaño</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {filtered.map((doc) => (
                    <tr key={doc.id} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {(() => { const FileIcon = getFileIcon(doc.mime_type); return <FileIcon size={18} className="text-foreground/40 shrink-0" />; })()}
                          <div>
                            <p className="font-medium text-foreground">{doc.name}</p>
                            {doc.description && <p className="text-sm text-foreground/50 truncate max-w-xs">{doc.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="text-sm">
                          <p className="text-foreground/70">{doc.client?.name || "Sin cliente"}</p>
                          {doc.client?.company && <p className="text-foreground/40">{doc.client.company}</p>}
                        </div>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm text-foreground/50">
                        {doc.mime_type || "—"}
                      </td>
                      <td className="p-4 text-sm text-foreground/50">{formatSize(doc.size_bytes)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(doc)}
                            className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id, doc.path)}
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
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {modalOpen && (
            <DocumentModal
              document={editingDoc}
              onClose={() => { setModalOpen(false); setEditingDoc(null); }}
              onSuccess={fetchDocuments}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mime: string | null) {
  if (!mime) return FileText;
  if (mime.startsWith("image/")) return Eye;
  if (mime.startsWith("application/pdf")) return FileText;
  if (mime.startsWith("video/")) return Eye;
  return FileText;
}

export default ClientDocuments;