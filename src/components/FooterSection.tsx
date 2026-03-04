const FooterSection = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-bold text-foreground">
              <span className="text-primary">Sigma</span> Tecnologías
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Productos de IA y automatización
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#productos" className="hover:text-foreground transition-colors">
              Productos
            </a>
            <a href="#contacto" className="hover:text-foreground transition-colors">
              Contacto
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Desarrollado por{" "}
            <a
              href="https://arielodasso.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Ariel Odasso
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
