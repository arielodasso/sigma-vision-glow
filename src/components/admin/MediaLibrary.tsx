import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Copy, Check, Film, ImageIcon, Loader2 } from "lucide-react";

export interface MediaAsset {
  id: string;
  name: string;
  path: string;
  url: string;
  kind: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

const formatSize = (bytes: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface Props {
  onSelect?: (asset: MediaAsset) => void;
  compact?: boolean;
}

const MediaLibrary = ({ onSelect, compact = false }: Props) => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchAssets = useCallback(async () => {
    const { data } = await supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false });
    setAssets((data as unknown as MediaAsset[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "bin";
        const safe = file.name
          .replace(/\.[^.]+$/, "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
          .slice(0, 60);
        const path = `${new Date().getFullYear()}/${Date.now()}-${safe}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("media")
          .upload(path, file, { cacheControl: "31536000", upsert: false });
        if (upErr) throw upErr;

        const { data: signed, error: signErr } = await supabase.storage
          .from("media")
          .createSignedUrl(path, TEN_YEARS);
        if (signErr) throw signErr;

        const { error: insErr } = await supabase.from("media_assets").insert({
          name: file.name,
          path,
          url: signed!.signedUrl,
          kind: file.type.startsWith("video") ? "video" : "image",
          mime_type: file.type,
          size_bytes: file.size,
        } as never);
        if (insErr) throw insErr;
      }
      toast({ title: "Archivos subidos" });
      fetchAssets();
    } catch (err) {
      toast({ title: "Error al subir", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async (asset: MediaAsset) => {
    if (!confirm(`¿Eliminar "${asset.name}"?`)) return;
    await supabase.storage.from("media").remove([asset.path]);
    await supabase.from("media_assets").delete().eq("id", asset.id);
    setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    toast({ title: "Archivo eliminado" });
  };

  const copy = async (asset: MediaAsset) => {
    await navigator.clipboard.writeText(asset.url);
    setCopied(asset.id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="border border-dashed border-foreground/15 rounded-2xl p-6 text-center bg-foreground/[0.02]"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          {uploading ? "Subiendo..." : "Subir imágenes o videos"}
        </button>
        <p className="text-xs text-foreground/35 mt-3">
          Arrastrá archivos acá. Imágenes y videos hasta 50 MB.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-foreground/40">Cargando biblioteca...</p>
      ) : assets.length === 0 ? (
        <p className="text-sm text-foreground/40">Todavía no hay archivos en la biblioteca.</p>
      ) : (
        <div className={`grid gap-3 ${compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}>
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group relative rounded-xl overflow-hidden border border-foreground/[0.08] bg-card"
            >
              <div className="aspect-[4/3] bg-foreground/[0.04] flex items-center justify-center overflow-hidden">
                {asset.kind === "video" ? (
                  <video src={asset.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                ) : (
                  <img src={asset.url} alt={asset.name} loading="lazy" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-2.5">
                <p className="text-[11px] text-foreground/70 truncate flex items-center gap-1.5">
                  {asset.kind === "video" ? <Film size={11} /> : <ImageIcon size={11} />}
                  {asset.name}
                </p>
                <p className="text-[10px] text-foreground/30">{formatSize(asset.size_bytes)}</p>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-background/95 to-transparent pt-8">
                {onSelect && (
                  <button
                    type="button"
                    onClick={() => onSelect(asset)}
                    className="flex-1 text-[11px] bg-foreground text-background rounded-full py-1.5 font-semibold"
                  >
                    Usar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => copy(asset)}
                  className="p-1.5 rounded-full bg-foreground/10 text-foreground/70 hover:text-foreground"
                  title="Copiar URL"
                >
                  {copied === asset.id ? <Check size={13} /> : <Copy size={13} />}
                </button>
                <button
                  type="button"
                  onClick={() => remove(asset)}
                  className="p-1.5 rounded-full bg-foreground/10 text-foreground/70 hover:text-destructive"
                  title="Eliminar"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
