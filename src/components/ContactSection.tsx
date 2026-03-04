import { useState, FormEvent, useEffect, useRef } from "react";
import { Send } from "lucide-react";

const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contacto" className="py-28 lg:py-36" ref={ref}>
      <div className="container mx-auto px-6 max-w-2xl">
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl sm:text-5xl font-bold text-gradient mb-5">
            Contacto
          </h2>
          <p className="text-lg text-secondary-soft leading-relaxed">
            ¿Tenés un proyecto o una idea? Escribinos y te respondemos rápido.
          </p>
        </div>

        <div className={`glass-card rounded-2xl p-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: visible ? '200ms' : '0ms' }}>
          {submitted ? (
            <div className="text-center py-10">
              <p className="text-foreground font-semibold text-xl mb-3">¡Mensaje enviado!</p>
              <p className="text-secondary-soft text-base">Te responderemos lo antes posible.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-soft mb-2">Nombre</label>
                <input
                  required
                  type="text"
                  className="w-full glass-input rounded-xl px-5 py-3 text-base text-foreground placeholder:text-foreground/30 focus:outline-none"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-soft mb-2">Email</label>
                <input
                  required
                  type="email"
                  className="w-full glass-input rounded-xl px-5 py-3 text-base text-foreground placeholder:text-foreground/30 focus:outline-none"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-soft mb-2">Empresa</label>
                <input
                  type="text"
                  className="w-full glass-input rounded-xl px-5 py-3 text-base text-foreground placeholder:text-foreground/30 focus:outline-none"
                  placeholder="Tu empresa (opcional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-soft mb-2">Mensaje</label>
                <textarea
                  required
                  rows={4}
                  className="w-full glass-input rounded-xl px-5 py-3 text-base text-foreground placeholder:text-foreground/30 focus:outline-none resize-none"
                  placeholder="Contanos sobre tu proyecto..."
                />
              </div>
              <button
                type="submit"
                className="w-full btn-primary-neutral flex items-center justify-center gap-2.5 py-3.5 rounded-full text-base font-semibold hover-scale"
              >
                <Send size={18} />
                Iniciar conversación
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
