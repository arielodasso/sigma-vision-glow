import MediaLibrary from "@/components/admin/MediaLibrary";

const Media = () => (
  <div>
    <div className="mb-8">
      <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Biblioteca multimedia</h1>
      <p className="text-sm text-foreground/40 mt-1.5">
        Subí, organizá y reutilizá imágenes y videos en los artículos del blog.
      </p>
    </div>
    <MediaLibrary />
  </div>
);

export default Media;
