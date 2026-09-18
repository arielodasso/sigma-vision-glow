import { useEffect, useState, FormEvent } from "react";
import { X, Loader2, Upload, Image, Download, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";

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

interface MediaModalProps {
  asset: MediaAsset | null;
  onClose: () => void;
  onSuccess: () => void;
}

const MediaModal = ({ asset, onClose, onSuccess }: MediaModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    kind: "image",
    file: null as File | null,
    preview: "" as string,
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        kind: asset.kind,
        file: null,
        preview: asset.url,
      });
    } else {
      setFormData({
        name: "",
        kind: "image",
        file: null,
        preview: "",
      });
    }
  }, [asset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file, preview: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!asset && !formData.file) {
      toast({ title: "Error", description: "Selecciona un archivo", variant: "destructive" });
      return;
    }

    setLoading(true);
    setUploading(true);
    setUploadProgress(0);

    let finalPath = asset?.path;
    let finalUrl = asset?.url;
    let finalMimeType = asset?.mime_type;
    let finalSize = asset?.size_bytes;
    let finalKind = formData.kind;

    try {
      if (formData.file) {
        const fileExt = formData.file.name.split(".").pop();
        finalPath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        finalMimeType = formData.file.type;
        finalSize = formData.file.size;
        finalKind = formData.file.type.startsWith("image/") ? "image" : "file";

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(finalPath, formData.file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("media").getPublicUrl(finalPath);
        finalUrl = urlData.publicUrl;
      }

      const payload = {
        name: formData.name.trim() || (formData.file?.name || asset?.name),
        path: finalPath,
        url: finalUrl,
        kind: finalKind,
        mime_type: finalMimeType,
        size_bytes: finalSize,
      };

      if (asset) {
        const { error } = await supabase.from("media_assets").update(payload).eq("id", asset.id);
        if (error) throw error;
        toast({ title: "Archivo actualizado" });
      } else {
        const { error } = await supabase.from("media_assets").insert(payload);
        if (error) throw error;
        toast({ title: "Archivo subido" });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card border border-foreground/[0.08] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-foreground/[0.06]">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {asset ? "Editar archivo" : "Subir archivo"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {!asset && (
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">
                  Archivo <span className="text-red-400">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-foreground/[0.05] file:text-foreground hover:file:bg-foreground/[0.1]"
                />
              </div>
            )}

            {formData.preview && (
              <div className="relative">
                {formData.preview.startsWith("blob:") || formData.preview.startsWith("http") ? (
                  formData.file?.type.startsWith("image/") ? (
                    <img src={formData.preview} alt="Preview" className="w-full max-h-64 object-cover rounded-xl" />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-foreground/[0.03] rounded-xl">
                      <Link2 className="text-foreground/30" size={32} />
                    </div>
                  )
                ) : null}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Nombre</label>
              <input
                type="text"
                required
                maxLength={200}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                placeholder="Nombre del archivo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Tipo</label>
              <select
                value={formData.kind}
                onChange={(e) => setFormData({ ...formData, kind: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm bg-card border border-foreground/[0.08]"
              >
                <option value="image">Imagen</option>
                <option value="file">Archivo/Documento</option>
              </select>
            </div>

            {asset && (
              <div className="grid sm:grid-cols-3 gap-4 text-sm text-foreground/60">
                <div>
                  <p className="font-medium text-foreground">Tamaño</p>
                  <p>{formatSize(asset.size_bytes)}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Tipo MIME</p>
                  <p>{asset.mime_type || "—"}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Subido</p>
                  <p>{new Date(asset.created_at).toLocaleDateString("es-AR")}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-foreground/[0.06]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Guardando...
                  </>
                ) : uploading ? (
                  <>
                    <Upload size={16} />
                    Subiendo...
                  </>
                ) : (
                  <>
                    {asset ? <Download size={16} /> : <Upload size={16} />}
                    {asset ? "Actualizar" : "Subir"}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default MediaModal;