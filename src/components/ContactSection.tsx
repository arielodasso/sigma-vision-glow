import { useState, FormEvent } from "react";
import { Send } from "lucide-react";

const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contacto" className="py-24 lg:py-32">
      <div className="container mx-auto px-6 max-w-xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gradient mb-4">
            Contacto
          </h2>
          <p className="text-secondary-soft">
            ¿Tenés un proyecto o una idea? Escribinos y te respondemos rápido.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {submitted ? (
            <div className="text-center py-8">
              <p className="text-foreground font-semibold text-lg mb-2">¡Mensaje enviado!</p>
              <p className="text-secondary-soft text-sm">Te responderemos lo antes posible.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-secondary-soft mb-1.5">Nombre</label>
                <input
                  required
                  type="text"
                  className="w-full glass-input rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm text-secondary-soft mb-1.5">Email</label>
                <input
                  required
                  type="email"
                  className="w-full glass-input rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm text-secondary-soft mb-1.5">Empresa</label>
                <input
                  type="text"
                  className="w-full glass-input rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none"
                  placeholder="Tu empresa (opcional)"
                />
              </div>
              <div>
                <label className="block text-sm text-secondary-soft mb-1.5">Mensaje</label>
                <textarea
                  required
                  rows={4}
                  className="w-full glass-input rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none resize-none"
                  placeholder="Contanos sobre tu proyecto..."
                />
              </div>
              <button
                type="submit"
                className="w-full btn-primary-neutral flex items-center justify-center gap-2 py-3 rounded-full text-sm"
              >
                <Send size={16} />
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
