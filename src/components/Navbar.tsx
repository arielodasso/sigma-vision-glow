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
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
      <div className="glass-strong rounded-full max-w-5xl w-full flex items-center justify-between px-3 py-2">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 pl-3">
          <div className="w-9 h-9 rounded-lg bg-foreground/10 border border-foreground/10 flex items-center justify-center">
            <span className="text-foreground font-bold text-sm">Σ</span>
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">
            Sigma<span className="font-normal text-foreground/70">Tecnologías</span>
          </span>
        </a>

        {/* Center links — desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href + l.label}
              href={l.href}
              className="text-[13px] text-foreground/60 hover:text-foreground px-4 py-1.5 rounded-full transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right buttons — desktop */}
        <div className="hidden md:flex items-center gap-2">
          <a
            href="#contacto"
            className="btn-glass-outline text-[13px] px-5 py-2 rounded-full"
          >
            Iniciar sesión
          </a>
          <a
            href="#contacto"
            className="btn-primary-neutral text-[13px] px-5 py-2 rounded-full"
          >
            Solicitar demo
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="fixed top-[72px] left-4 right-4 glass-strong rounded-2xl p-5 space-y-3 md:hidden">
          {links.map((l) => (
            <a
              key={l.href + l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm text-foreground/60 hover:text-foreground transition-colors py-2 px-3 rounded-lg"
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <a
              href="#contacto"
              onClick={() => setOpen(false)}
              className="btn-glass-outline text-sm px-5 py-2.5 rounded-full text-center"
            >
              Iniciar sesión
            </a>
            <a
              href="#contacto"
              onClick={() => setOpen(false)}
              className="btn-primary-neutral text-sm px-5 py-2.5 rounded-full text-center"
            >
              Solicitar demo
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
