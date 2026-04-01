import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useState } from "react";

const categories = [
  "Todas",
  "Apps",
  "Portfolio",
  "Servicios",
  "E-commerce",
  "Eventos",
  "Editorial",
  "Landing Page",
  "Música",
];

const templates = [
  // Apps - Internal Tools
  {
    title: "Lovable Slides",
    subtitle: "Code-powered presentation builder",
    category: "Apps",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/lovable-slides-final.webp",
    href: "https://lovable.dev/templates/apps/saas/lovable-slides",
    featured: true,
  },
  {
    title: "Dealflow",
    subtitle: "Visual pipeline board with drag-and-drop deals, activity logging, forecasting, and CSV import/export",
    category: "Apps",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/https://storage.googleapis.com/lovable-assets/templates/dealflow.webp",
    href: "https://lovable.dev/templates/apps/internal-tools/dealflow-visual-crm-pipeline-tracker-template",
    featured: true,
  },
  {
    title: "Roadmapper",
    subtitle: "Visual canvas and list view for planning features organized by quarter, status, or priority",
    category: "Apps",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/https://storage.googleapis.com/lovable-assets/templates/roadmapper.webp",
    href: "https://lovable.dev/templates/apps/product-management/roadmapper-product-roadmap-planner-template",
  },
  {
    title: "Retrofly",
    subtitle: "Asynchronous team retrospective and postmortem tool",
    category: "Apps",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/https://storage.googleapis.com/lovable-assets/templates/retrofly.webp",
    href: "https://lovable.dev/templates/apps/project-management/retrofly-sprint-retrospective-board-template",
  },
  {
    title: "ExpenseDesk",
    subtitle: "Centralized expense submission, approval workflows, and reimbursement tracking",
    category: "Apps",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/https://storage.googleapis.com/lovable-assets/templates/expense_deck.webp",
    href: "https://lovable.dev/templates/apps/internal-tools/expensedesk-expense-reporting-approval-tool-template",
  },
  {
    title: "QuoteKit",
    subtitle: "Create branded proposals with AI-assisted content, reusable templates, and secure sharing",
    category: "Apps",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/https://storage.googleapis.com/lovable-assets/templates/quote_kit.webp",
    href: "https://lovable.dev/templates/apps/internal-tools/quotekit-proposal-quote-generator-template",
  },
  {
    title: "Stackwise",
    subtitle: "Full-featured inventory management with AI-powered demand forecasting",
    category: "Apps",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/https://storage.googleapis.com/lovable-assets/templates/stackwise.webp",
    href: "https://lovable.dev/templates/apps/internal-tools/stackwise-inventory-management-system-template",
  },
  {
    title: "Triage",
    subtitle: "Standardized bug submission form with severity tracking and status dashboard",
    category: "Apps",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/https://storage.googleapis.com/lovable-assets/templates/bugtrackr.webp",
    href: "https://lovable.dev/templates/apps/developer-tools/triage-bug-report-form-tracker-template",
  },
  {
    title: "SignatureCrafter",
    subtitle: "Professional email signature generator",
    category: "Apps",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/signaturecrafter-email-signature-qr-code-generator-template-screenshot.webp",
    href: "https://lovable.dev/templates/apps/saas/signaturecrafter-email-signature-qr-code-generator-template",
  },
  {
    title: "ClipCraft",
    subtitle: "Browser-based video editing platform",
    category: "Apps",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/clipcraft-browser-based-video-editor-saas-template-screenshot.webp",
    href: "https://lovable.dev/templates/apps/saas/clipcraft-browser-based-video-editor-saas-template",
  },
  {
    title: "HireFlow",
    subtitle: "Complete hiring workflow system",
    category: "Apps",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/hireflow-full-stack-applicant-tracking-system-template-screenshot.webp",
    href: "https://lovable.dev/templates/apps/internal-tools/hireflow-full-stack-applicant-tracking-system-template",
  },
  {
    title: "Rentely",
    subtitle: "Complete vacation rental marketplace platform",
    category: "Apps",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/rentely-full-stack-vacation-rental-platform-template-screenshot.webp",
    href: "https://lovable.dev/templates/apps/saas/rentely-full-stack-vacation-rental-platform-template",
  },
  {
    title: "FinanceFlow",
    subtitle: "Business financial tracking dashboard",
    category: "Apps",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/financeflow-financial-analytics-dashboard-template-screenshot.webp",
    href: "https://lovable.dev/templates/apps/internal-tools/financeflow-financial-analytics-dashboard-template",
  },
  {
    title: "Scout",
    subtitle: "Startup funding intelligence platform",
    category: "Apps",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/scout-startup-funding-tracker-news-platform-template-screenshot.webp",
    href: "https://lovable.dev/templates/apps/saas/scout-startup-funding-tracker-news-platform-template",
  },
  // EventSpark
  {
    title: "EventSpark",
    subtitle: "Full-stack event management with branded registration pages, attendee tracking and analytics",
    category: "Eventos",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/https://storage.googleapis.com/lovable-assets/templates/event-spark.webp",
    href: "https://lovable.dev/templates/websites/events/eventspark-event-registration-platform-template",
    featured: true,
  },
  // Portfolio
  {
    title: "Obsidian",
    subtitle: "Cinematic dark photography portfolio",
    category: "Portfolio",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/obsidian-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/portfolio/obsidian-template",
  },
  {
    title: "Vesper",
    subtitle: "Cinematic, elegant wedding photography showcase",
    category: "Portfolio",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/vesper-cinematic-wedding-photography-portfolio-screenshot.webp",
    href: "https://lovable.dev/templates/websites/portfolio/vesper-cinematic-wedding-photography-portfolio",
  },
  {
    title: "Verdure",
    subtitle: "Professional case study portfolio",
    category: "Portfolio",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/verdure-designer-portfolio-case-study-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/portfolio/verdure-designer-portfolio-case-study-template",
  },
  {
    title: "Atelier",
    subtitle: "Professional creative work showcase",
    category: "Portfolio",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/atelier-designer-portfolio-case-study-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/portfolio/atelier-designer-portfolio-case-study-template",
  },
  {
    title: "Folio",
    subtitle: "Editorial accordion portfolio layout",
    category: "Portfolio",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/folio-minimal-designer-portfolio-screenshot.webp",
    href: "https://lovable.dev/templates/websites/portfolio/folio-minimal-designer-portfolio",
  },
  {
    title: "Serif Editorial",
    subtitle: "Minimalist editorial portfolio design",
    category: "Portfolio",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/serif-editorial-designer-portfolio-screenshot.webp",
    href: "https://lovable.dev/templates/websites/portfolio/serif-editorial-designer-portfolio",
  },
  {
    title: "Inkwell",
    subtitle: "Bold, high-contrast creative portfolio",
    category: "Portfolio",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/inkwell-brutalist-copywriter-portfolio-screenshot.webp",
    href: "https://lovable.dev/templates/websites/portfolio/inkwell-brutalist-copywriter-portfolio",
  },
  {
    title: "Terminal Dev Portfolio",
    subtitle: "Terminal-inspired developer showcase",
    category: "Portfolio",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/terminal-developer-portfolio-website-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/portfolio/terminal-developer-portfolio-website-template",
  },
  // Servicios
  {
    title: "MindBridge",
    subtitle: "Professional telehealth practice platform",
    category: "Servicios",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/mindbridge-remote-therapy-counseling-platform-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/services/mindbridge-remote-therapy-counseling-platform-template",
  },
  {
    title: "Apex",
    subtitle: "Complete multi-page law firm site",
    category: "Servicios",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/apex-personal-injury-law-firm-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/services/apex-personal-injury-law-firm-template",
  },
  {
    title: "Evergreen",
    subtitle: "Community organization with event listings",
    category: "Servicios",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/evergreen-community-garden-local-organization-website-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/services/evergreen-community-garden-local-organization-website-template",
  },
  {
    title: "Luminara",
    subtitle: "Premium cocktail bar website",
    category: "Servicios",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/luminara-premium-cocktail-bar-lounge-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/services/luminara-premium-cocktail-bar-lounge-template",
  },
  {
    title: "Bellanova",
    subtitle: "Italian restaurant website showcase",
    category: "Servicios",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/bellanova-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/services/bellanova-template",
  },
  {
    title: "TrimSync",
    subtitle: "Premium barbershop with booking system",
    category: "Servicios",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/trimsync-premium-barbershop-booking-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/services/trimsync-premium-barbershop-booking-template",
  },
  {
    title: "BuildRight",
    subtitle: "Interactive construction cost calculator",
    category: "Servicios",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/buildright-interactive-construction-cost-estimator-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/services/buildright-interactive-construction-cost-estimator-template",
  },
  {
    title: "Lingua Bridge",
    subtitle: "Complete language school enrollment system",
    category: "Servicios",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/lingua-bridge-language-school-enrollment-platform-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/services/lingua-bridge-language-school-enrollment-platform-template",
  },
  // E-commerce
  {
    title: "Wax",
    subtitle: "Brutalist vinyl store with animations",
    category: "E-commerce",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/wax-vinyl-record-store-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/ecommerce/wax-vinyl-record-store-template",
  },
  {
    title: "Obsidian Audio",
    subtitle: "Cinematic dark luxury product showcase",
    category: "E-commerce",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/obsidian-premium-audio-product-showcase-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/ecommerce/obsidian-premium-audio-product-showcase-template",
  },
  {
    title: "Maven",
    subtitle: "Editorial fashion pre-launch site",
    category: "E-commerce",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/maven-luxury-fashion-coming-soon-lookbook-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/ecommerce/maven-luxury-fashion-coming-soon-lookbook-template",
  },
  {
    title: "Loom",
    subtitle: "Refined artisan fashion storefront",
    category: "E-commerce",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/loom-artisan-fashion-e-commerce-storefront-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/ecommerce/loom-artisan-fashion-e-commerce-storefront-template",
  },
  {
    title: "Maison",
    subtitle: "Editorial home goods storefront",
    category: "E-commerce",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/maison-artisan-home-lifestyle-store-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/ecommerce/maison-artisan-home-lifestyle-store-template",
  },
  // Landing Page
  {
    title: "Velocity",
    subtitle: "Dark polished workshop landing page",
    category: "Landing Page",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/velocity-product-growth-workshop-landing-page-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/landing-page/velocity-product-growth-workshop-landing-page-template",
  },
  {
    title: "Inkwell Newsletter",
    subtitle: "Editorial bento-grid newsletter page",
    category: "Landing Page",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/inkwell-newsletter-landing-page-for-creators-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/landing-page/inkwell-newsletter-landing-page-for-creators-template",
  },
  {
    title: "Prism",
    subtitle: "Professional product announcement page",
    category: "Landing Page",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/prism-product-launch-landing-page-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/landing-page/prism-product-launch-landing-page-template",
  },
  // Eventos
  {
    title: "Nexus",
    subtitle: "Dark-themed professional event site",
    category: "Eventos",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/nexus-tech-conference-developer-event-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/events/nexus-tech-conference-developer-event-template",
  },
  {
    title: "Summit",
    subtitle: "Professional multi-page conference site",
    category: "Eventos",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/summit-tech-conference-event-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/events/summit-tech-conference-event-template",
  },
  {
    title: "BidForGood",
    subtitle: "Professional online charity auction platform",
    category: "Eventos",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/bidforgood-charity-auction-platform-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/events/bidforgood-charity-auction-platform-template",
  },
  // Editorial
  {
    title: "Wanderlust",
    subtitle: "Magazine-style travel content platform",
    category: "Editorial",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/wanderlust-editorial-travel-blog-destination-guide-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/blog/wanderlust-editorial-travel-blog-destination-guide-template",
  },
  {
    title: "Stone Paper",
    subtitle: "Warm serif editorial magazine",
    category: "Editorial",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/stone-paper-editorial-news-magazine-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/editorial/stone-paper-editorial-news-magazine-template",
  },
  {
    title: "Vellum",
    subtitle: "Magazine-inspired writer portfolio",
    category: "Editorial",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/vellum-editorial-writer-portfolio-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/resume/vellum-editorial-writer-portfolio-template",
  },
  // Música
  {
    title: "Sonora",
    subtitle: "Multi-platform music showcase",
    category: "Música",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/sonora-musician-portfolio-streaming-hub-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/music/sonora-musician-portfolio-streaming-hub-template",
  },
  {
    title: "Goldlight",
    subtitle: "Dark portfolio for musicians",
    category: "Música",
    image: "https://lovable.dev/cdn-cgi/image/width=800,f=auto,fit=scale-down/templates/goldlight-artist-musician-portfolio-template-screenshot.webp",
    href: "https://lovable.dev/templates/websites/music/goldlight-artist-musician-portfolio-template",
  },
];

const AcademyTemplates = () => {
  const [activeCategory, setActiveCategory] = useState("Todas");

  const filtered = activeCategory === "Todas"
    ? templates
    : templates.filter((t) => t.category === activeCategory);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-secondary/50 border border-border p-10 lg:p-16 text-center"
      >
        <h1 className="font-display text-3xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight">
          Empezá desde algo
          <br />
          que funciona
        </h1>
        <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
          Plantillas reales de la comunidad Lovable. Elegí una, personalizala y lanzala.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                activeCategory === cat
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.section>

      {/* Featured */}
      <div className="space-y-6">
        {filtered.filter((t) => t.featured).map((t) => (
          <motion.a
            key={t.title}
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-secondary/30 p-4 lg:p-6 flex flex-col lg:flex-row gap-6 hover:bg-secondary/50 transition-colors group block"
          >
            <div className="lg:w-1/2 rounded-xl overflow-hidden bg-secondary/60 h-48 lg:h-auto">
              <img src={t.image} alt={t.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="lg:w-1/2 flex flex-col justify-center">
              <span className="text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase">{t.category}</span>
              <h3 className="font-display text-xl font-bold text-foreground mt-1">{t.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
              <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-foreground/70 group-hover:text-foreground">
                Ver plantilla <ExternalLink size={14} />
              </span>
            </div>
          </motion.a>
        ))}

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.filter((t) => !t.featured).map((t) => (
            <motion.a
              key={t.title}
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-xl border border-border bg-secondary/20 p-3 hover:bg-secondary/40 transition-colors group block"
            >
              <div className="w-full h-36 rounded-lg overflow-hidden bg-secondary/50 mb-3">
                <img src={t.image} alt={t.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <span className="text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase">{t.category}</span>
              <h3 className="font-display font-bold text-foreground mt-1 text-sm">{t.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{t.subtitle}</p>
            </motion.a>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="rounded-2xl border border-border bg-secondary/30 p-10 text-center">
        <h2 className="font-display text-xl font-bold text-foreground">¿Querés ver todas las plantillas?</h2>
        <p className="mt-3 text-muted-foreground text-sm max-w-md mx-auto">
          Explorá el catálogo completo de templates en Lovable.
        </p>
        <a
          href="https://lovable.dev/templates"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-6 bg-foreground text-background font-semibold px-6 py-3 rounded-full hover:bg-foreground/90 transition-colors text-sm"
        >
          Ver todas en Lovable <ExternalLink size={14} />
        </a>
      </section>
    </div>
  );
};

export default AcademyTemplates;
