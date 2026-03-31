import { motion } from "framer-motion";
import { ArrowRight, Cloud, Shield, CreditCard, Brain, Palette, FileText, Globe, GitBranch, MessageCircle, AlertTriangle } from "lucide-react";

const topics = [
  {
    title: "Infraestructura cloud",
    desc: "Backend, base de datos, almacenamiento y funciones serverless — todo lo que necesitás para lógica del lado del servidor.",
    icon: Cloud,
    href: "#",
  },
  {
    title: "Autenticación de usuarios",
    desc: "Registro, login, proveedores OAuth como Google y GitHub, y rutas protegidas — todo configurado.",
    icon: Shield,
    href: "#",
  },
  {
    title: "Integración de pagos",
    desc: "Aceptá pagos, gestioná suscripciones y configurá portales de cliente con las herramientas de pago más populares.",
    icon: CreditCard,
    href: "#",
  },
  {
    title: "IA en tu aplicación",
    desc: "Construí interfaces de chat, generación de contenido y funcionalidades inteligentes con modelos de lenguaje.",
    icon: Brain,
    href: "#",
  },
  {
    title: "Diseño y UI avanzado",
    desc: "Usá herramientas de diseño visual, creá layouts responsivos y construí interfaces pulidas con librerías de componentes.",
    icon: Palette,
    href: "#",
  },
  {
    title: "Archivos de conocimiento",
    desc: "Dale a la IA contexto personalizado sobre tu proyecto — guías de marca, specs de API o conocimiento de dominio.",
    icon: FileText,
    href: "#",
  },
  {
    title: "Dominio personalizado",
    desc: "Poné en producción con tu propia URL. Conectá un dominio, configurá DNS y publicá en minutos.",
    icon: Globe,
    href: "#",
  },
  {
    title: "Control de versiones",
    desc: "Versionado completo y ownership del código. Push a GitHub, pull de cambios y colaborá con tu equipo.",
    icon: GitBranch,
    href: "#",
  },
];

const troubleshooting = [
  {
    title: "¿Tenés un error?",
    desc: "Compartí la captura de pantalla o el mensaje de error. La IA puede diagnosticar la mayoría de problemas comunes al instante.",
    icon: AlertTriangle,
  },
  {
    title: "¿Necesitás ayuda?",
    desc: "Contactanos directamente. Nuestro equipo puede ayudarte a resolver problemas técnicos y guiarte en tu proyecto.",
    icon: MessageCircle,
  },
];

const AcademyAdvanced = () => {
  return (
    <div className="space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-3xl lg:text-5xl font-bold text-foreground tracking-tight">
          Profundizá.
        </h1>
        <p className="mt-4 text-muted-foreground max-w-lg text-lg">
          Funcionalidades listas para producción, un tema a la vez.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4">
        {topics.map((topic, i) => (
          <motion.div
            key={topic.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="rounded-xl border border-border bg-secondary/20 p-6 hover:bg-secondary/40 transition-colors group cursor-pointer"
          >
            <topic.icon size={20} className="text-muted-foreground mb-3" />
            <h3 className="font-display font-bold text-foreground text-sm">{topic.title}</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{topic.desc}</p>
            <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-foreground/50 group-hover:text-foreground">
              → Explorar
            </span>
          </motion.div>
        ))}
      </div>

      <section className="space-y-6">
        <h2 className="font-display text-xl font-bold text-foreground">Cuando te trabás</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {troubleshooting.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border bg-secondary/30 p-6"
            >
              <item.icon size={20} className="text-muted-foreground mb-3" />
              <h3 className="font-display font-bold text-foreground text-sm">{item.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-secondary/30 p-10 text-center">
        <h2 className="font-display text-xl font-bold text-foreground">¿Querés construir algo?</h2>
        <p className="mt-3 text-muted-foreground text-sm max-w-md mx-auto">
          Si tenés una idea, podemos ayudarte a hacerla realidad. Desde el concepto hasta la producción.
        </p>
        <a
          href="/contacto"
          className="inline-flex items-center gap-2 mt-6 bg-foreground text-background font-semibold px-6 py-3 rounded-full hover:bg-foreground/90 transition-colors text-sm"
        >
          Contactanos <ArrowRight size={14} />
        </a>
      </section>
    </div>
  );
};

export default AcademyAdvanced;
