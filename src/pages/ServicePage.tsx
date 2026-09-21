import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import CTASection from "@/components/CTASection";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe, Workflow, Cloud, Code, Brain, PlugZap, ArrowRight,
  Check, ChevronLeft, ExternalLink,
} from "lucide-react";
import { services, getService } from "@/data/services";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import BookingModal from "@/components/BookingModal";
import useSmoothScroll from "@/hooks/use-smooth-scroll";
import { analytics } from "@/lib/analytics";
import faztredLogo from "@/assets/clients/faztred.png.asset.json";
import offmarketLogo from "@/assets/clients/offmarket.png.asset.json";
import justaLogo from "@/assets/clients/justa.png.asset.json";
import icebergLogo from "@/assets/platforms/iceberg.svg.asset.json";
import analyticsLogo from "@/assets/brand/sigma-analytics.png.asset.json";
import trendLogo from "@/assets/brand/sigma-trend-engine.png.asset.json";
import capitanLogo from "@/assets/clients/capitan-2.png";
import solcitosLogo from "@/assets/clients/solcitos.png";
import preciosTandilLogo from "@/assets/clients/preciostandil.png";
import ClientsCarousel from "@/components/ClientsCarousel";
import { webClients } from "@/components/ProjectsSection";
import MobileCarousel from "@/components/MobileCarousel";

const ICONS = { globe: Globe, workflow: Workflow, cloud: Cloud, code: Code, brain: Brain, plug: PlugZap } as const;

const CASE_LOGOS: Record<string, { logo: string; theme: "light" | "dark" }> = {
  "Capitán Deportes": { logo: capitanLogo, theme: "dark" },
  "Solcitos": { logo: solcitosLogo, theme: "dark" },
  "Precios Tandil": { logo: preciosTandilLogo, theme: "dark" },
  "OffMarket": { logo: offmarketLogo.url, theme: "dark" },
  "Justa": { logo: justaLogo.url, theme: "light" },
  "Faztred": { logo: faztredLogo.url, theme: "dark" },
  "Sigma Analytics": { logo: analyticsLogo.url, theme: "dark" },
  "Sigma Trend Engine": { logo: trendLogo.url, theme: "dark" },
  "Iceberg": { logo: icebergLogo.url, theme: "dark" },
  "Integraciones de Sigma Analytics": { logo: analyticsLogo.url, theme: "dark" },
};

const caseLogoTileClass = (theme: "light" | "dark") =>
  theme === "light"
    ? "bg-white border-white/80 group-hover:border-white"
    : "bg-foreground/[0.04] border-foreground/[0.08] group-hover:border-foreground/[0.18] group-hover:bg-foreground/[0.06]";

interface FaqRow {
  question: string;
  answer: string;
}

const ServicePage = () => {
  const { slug } = useParams();
  const service = getService(slug);
  const [dbFaqs, setDbFaqs] = useState<FaqRow[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  useSmoothScroll();

  useEffect(() => {
    if (!service) return;
    let alive = true;
    supabase
      .from("faqs")
      .select("question, answer")
      .eq("published", true)
      .eq("category", service.slug)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (alive && data) setDbFaqs(data as FaqRow[]);
      }, () => {});
    return () => { alive = false; };
  }, [service]);

  if (!service) return <Navigate to="/servicios" replace />;

  const Icon = ICONS[service.icon];
  const faqs = dbFaqs.length > 0 ? dbFaqs : service.faqs;
  const cases = service.cases;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": service.hero,
    "serviceType": service.category,
    "provider": {
      "@type": "Organization",
      "name": "Sigma Tecnologías",
      "url": "https://www.sigmatecnologiasarg.com",
    },
    "areaServed": "AR",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Tandil",
      "addressRegion": "Buenos Aires",
      "addressCountry": "AR",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.sigmatecnologiasarg.com/" },
      { "@type": "ListItem", "position": 2, "name": "Servicios", "item": "https://www.sigmatecnologiasarg.com/servicios" },
      { "@type": "ListItem", "position": 3, "name": service.title, "item": `https://www.sigmatecnologiasarg.com/servicios/${service.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{service.metaTitle}</title>
        <meta name="description" content={service.metaDescription} />
        <link rel="canonical" href={`https://www.sigmatecnologiasarg.com/servicios/${service.slug}`} />
        <meta property="og:title" content={service.metaTitle} />
        <meta property="og:description" content={service.metaDescription} />
        <meta property="og:url" content={`https://www.sigmatecnologiasarg.com/servicios/${service.slug}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>

      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-32 lg:pt-36">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex items-center gap-2 text-xs text-foreground/40"
            aria-label="Breadcrumb"
          >
            <Link to="/" className="hover:text-foreground/70 transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/servicios" className="hover:text-foreground/70 transition-colors">Servicios</Link>
            <span>/</span>
            <span className="text-foreground/70">{service.name}</span>
          </motion.nav>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden pt-8 pb-20 lg:pb-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.02)_0%,transparent_65%)]" />
          <div className="absolute -bottom-60 -left-40 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.02)_0%,transparent_65%)]" />
          <div className="absolute top-[20%] right-[15%] w-px h-[200px] bg-gradient-to-b from-transparent via-foreground/[0.05] to-transparent" />
          <div className="absolute bottom-[20%] left-[5%] w-px h-[150px] bg-gradient-to-t from-transparent via-foreground/[0.04] to-transparent" />
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center">
                <Icon size={22} className="text-foreground/60" />
              </div>
              <span className="text-xs font-medium uppercase tracking-widest text-foreground/40">{service.category}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-gradient leading-[1.1] mb-5 max-w-4xl">
              {service.title}
            </h1>
            <p className="font-display text-lg sm:text-xl text-foreground/80 mb-4">{service.tagline}</p>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10">{service.hero}</p>
            <div className="flex flex-col sm:flex-row items-stretch gap-4">
              <button
                type="button"
                onClick={() => { setBookingOpen(true); analytics.agendaReunion(service.slug); }}
                className="flex items-center justify-center gap-2.5 bg-foreground text-background px-8 py-4 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors w-full sm:w-auto"
              >
                Agendar reunión
                <ArrowRight size={16} />
              </button>
              <a
                href="#casos-reales"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("casos-reales")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center justify-center gap-2.5 text-foreground/80 border border-foreground/10 px-8 py-4 rounded-full text-sm font-medium hover:bg-foreground/[0.04] hover:border-foreground/20 transition-all w-full sm:w-auto"
              >
                Ver casos de éxito
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="section-padding bg-surface-elevated border-y border-foreground/[0.04]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-5 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-gradient mb-3">El problema que resolvemos</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Seguramente estás lidiando con alguno de estos escenarios hoy mismo.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-3 space-y-4"
            >
              {service.problem.map((p, i) => (
                <div key={i} className="flex gap-4 p-5 rounded-xl border border-foreground/[0.04] hover:border-foreground/[0.10] hover:bg-foreground/[0.02] transition-all">
                  <div className="w-8 h-8 rounded-lg bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center shrink-0">
                    <span className="text-foreground/60 text-sm font-semibold">{i + 1}</span>
                  </div>
                  <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">{p}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* QUÉ INCLUYE */}
      <section className="section-padding">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="mb-14"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gradient mb-3">Qué incluye</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">{service.includesNote}</p>
          </motion.div>
          <MobileCarousel
            items={service.includes}
            renderItem={(inc) => (
              <div className="glass-card rounded-2xl p-6 flex gap-3">
                <Check size={18} className="text-foreground/60 shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80 leading-relaxed">{inc}</p>
              </div>
            )}
            itemClassName="min-w-[280px]"
          />
        </div>
      </section>

      {/* PARA QUIÉN */}
      <section className="section-padding bg-surface-elevated border-y border-foreground/[0.04]">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gradient mb-3">Para quién es</h2>
          </motion.div>
          <MobileCarousel
            items={service.audience}
            renderItem={(a) => (
              <div className="flex items-start gap-4 p-6 rounded-xl border border-foreground/[0.04] hover:border-foreground/[0.10] hover:bg-foreground/[0.02] transition-all">
                <div className="w-2 h-2 rounded-full bg-foreground/60 mt-2 shrink-0" />
                <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">{a}</p>
              </div>
            )}
            itemClassName="min-w-[280px]"
          />
        </div>
      </section>

      {/* CÓMO TRABAJAMOS */}
      <section className="section-padding">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="mb-14"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gradient mb-3">Cómo trabajamos</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              {service.processNote}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.howWeWork.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                <div className="h-full glass-card rounded-2xl p-7">
                  <div className="text-foreground/25 font-display text-5xl font-bold mb-4">{String(i + 1).padStart(2, "0")}</div>
                  <h3 className="font-display text-base font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CASOS */}
      {cases.length > 0 && (
        <section id="casos-reales" className="section-padding bg-surface-elevated border-y border-foreground/[0.04] scroll-mt-24">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-gradient mb-3">Casos reales</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                {service.casesNote}
              </p>
            </motion.div>
            {slug === "desarrollo-web" ? (
              <ClientsCarousel clients={webClients} />
            ) : (
            <div className="grid md:grid-cols-3 gap-5">
              {cases.map((c, i) => {
                const meta = CASE_LOGOS[c.name];
                const body = (
                  <>
                    {meta && (
                      <div className={`h-20 w-full rounded-xl border flex items-center justify-center px-6 mb-5 ${caseLogoTileClass(meta.theme)}`}>
                        <img
                          loading="lazy"
                          decoding="async"
                          src={meta.logo}
                          alt={c.name}
                          className="max-h-12 max-w-full object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display text-base font-semibold text-foreground">{c.name}</h3>
                      {c.url && <ExternalLink size={14} className="text-foreground/25 group-hover:text-foreground/60 transition-colors shrink-0 mt-1" />}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
                  </>
                );
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    onClick={() => analytics.caso(c.name)}
                  >
                    {c.url ? (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-full glass-card rounded-2xl p-7 group"
                      >
                        {body}
                      </a>
                    ) : (
                      <div className="h-full glass-card rounded-2xl p-7 group">
                        {body}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            )}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="section-padding">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gradient mb-3">Preguntas frecuentes</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Respuestas rápidas para las dudas más comunes.</p>
          </motion.div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="glass-card rounded-2xl px-6 border border-foreground/[0.04]">
                <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-foreground hover:no-underline">
                  {f.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center">
            <Link
              to="/contacto"
              onClick={() => analytics.contacto(`faq-${service.slug}`)}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              <ChevronLeft size={14} className="rotate-180" />
              Tenés otra duda · Escribinos
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
      <FooterSection />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
};

export default ServicePage;