import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Inicio", href: "#" },
    { label: "Soluciones", href: "#servicios" },
    { label: "Productos", href: "#productos" },
    { label: "Contacto", href: "#contacto" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3 animate-fade-in">
      <div className="glass-strong rounded-full max-w-5xl w-full flex items-center justify-between px-4 py-2.5">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 pl-2">
          <div className="w-10 h-10 rounded-xl bg-foreground/10 border border-foreground/10 flex items-center justify-center">
            <span className="text-foreground font-bold text-base">Σ</span>
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            Sigma<span className="font-normal text-foreground/70">Tecnologías</span>
          </span>
        </a>

        {/* Center links — desktop */}
        <div className="hidden md:flex items-center gap-2">
          {links.map((l) => (
            <a
              key={l.href + l.label}
              href={l.href}
              className="text-sm text-foreground/60 hover:text-foreground px-5 py-2 rounded-full transition-colors font-medium"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right CTA — desktop */}
        <div className="hidden md:flex items-center">
          <a
            href="#contacto"
            className="btn-primary-neutral text-sm px-6 py-2.5 rounded-full"
          >
            Contactar
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="fixed top-[76px] left-4 right-4 glass-strong rounded-2xl p-5 space-y-3 md:hidden animate-fade-in">
          {links.map((l) => (
            <a
              key={l.href + l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm text-foreground/60 hover:text-foreground transition-colors py-2 px-3 rounded-lg font-medium"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contacto"
            onClick={() => setOpen(false)}
            className="block btn-primary-neutral text-sm px-5 py-2.5 rounded-full text-center mt-2"
          >
            Contactar
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
