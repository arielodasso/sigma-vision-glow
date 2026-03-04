import { useEffect, useRef, useState } from "react";

const FooterSection = () => {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={ref} className={`border-t border-foreground/[0.06] py-14 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-lg font-bold text-foreground">
              Sigma <span className="font-normal text-foreground/60">Tecnologías</span>
            </p>
            <p className="text-sm text-secondary-soft mt-1">
              Productos de IA y automatización
            </p>
          </div>

          <div className="flex items-center gap-8 text-base text-secondary-soft">
            <a href="#productos" className="hover:text-foreground transition-colors">
              Productos
            </a>
            <a href="#contacto" className="hover:text-foreground transition-colors">
              Contacto
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-foreground/[0.06] text-center">
          <p className="text-sm text-secondary-soft">
            Desarrollado por{" "}
            <a
              href="https://arielodasso.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/80 hover:text-foreground hover:underline transition-colors"
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
