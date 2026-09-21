import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import { HelmetProvider } from "react-helmet-async";
import FloatingLanguageSelector from "@/components/FloatingLanguageSelector";
import CursorHalo from "@/components/CursorHalo";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";

// Rutas no críticas: se cargan bajo demanda para acelerar la primera carga.
const About = lazy(() => import("./pages/About"));
const Nosotros = lazy(() => import("./pages/Nosotros"));
const ServicesIndex = lazy(() => import("./pages/ServicesIndex"));
const ServicePage = lazy(() => import("./pages/ServicePage"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogAdmin = lazy(() => import("./pages/BlogAdmin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const BudgetsList = lazy(() => import("./pages/admin/BudgetsList"));
const BudgetEditor = lazy(() => import("./pages/admin/BudgetEditor"));
const ContactSubmissions = lazy(() => import("./pages/admin/ContactSubmissions"));
const Quoter = lazy(() => import("./pages/admin/Quoter"));
const Media = lazy(() => import("./pages/admin/Media"));
const SeoDashboard = lazy(() => import("./pages/admin/SeoDashboard"));
const BudgetView = lazy(() => import("./pages/BudgetView"));
const AcademyLayout = lazy(() => import("./pages/AcademyLayout"));
const AcademyHome = lazy(() => import("./pages/academy/AcademyHome"));
const AcademyGuides = lazy(() => import("./pages/academy/AcademyGuides"));
const AcademyVideos = lazy(() => import("./pages/academy/AcademyVideos"));
const AcademyTemplates = lazy(() => import("./pages/academy/AcademyTemplates"));
const AcademyUseCases = lazy(() => import("./pages/academy/AcademyUseCases"));
const AcademyAdvanced = lazy(() => import("./pages/academy/AcademyAdvanced"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent"));
const ThankYou = lazy(() => import("./pages/ThankYou"));

// Admin - Dashboard
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
// Admin - Tareas
const TasksAdmin = lazy(() => import("./pages/admin/tasks/TasksAdmin"));
// Admin - Contenidos
const ContentBlog = lazy(() => import("./pages/admin/content/ContentBlog"));
const ContentTestimonials = lazy(() => import("./pages/admin/content/ContentTestimonials"));
const ContentFaqs = lazy(() => import("./pages/admin/content/ContentFaqs"));
const ContentMedia = lazy(() => import("./pages/admin/content/ContentMedia"));
// Admin - Agenda
const AgendaAdmin = lazy(() => import("./pages/admin/agenda/AgendaAdmin"));
// Admin - Clientes
const ClientsAdmin = lazy(() => import("./pages/admin/clients/ClientsAdmin"));
const ClientDocuments = lazy(() => import("./pages/admin/clients/ClientDocuments"));
const ClientInvites = lazy(() => import("./pages/admin/clients/ClientInvites"));
const ClientPortal = lazy(() => import("./pages/admin/clients/ClientPortal"));
// Admin - Equipo
const TeamDirectory = lazy(() => import("./pages/admin/team/TeamDirectory"));
const TeamRoles = lazy(() => import("./pages/admin/team/TeamRoles"));
const TeamInvites = lazy(() => import("./pages/admin/team/TeamInvites"));
const TeamOrgChart = lazy(() => import("./pages/admin/team/TeamOrgChart"));
// Admin - Chat
const TeamChat = lazy(() => import("./pages/admin/chat/TeamChat"));
// Admin - Conocimiento
const KnowledgeDocs = lazy(() => import("./pages/admin/knowledge/KnowledgeDocs"));
const KnowledgeHelp = lazy(() => import("./pages/admin/knowledge/KnowledgeHelp"));
const KnowledgePortal = lazy(() => import("./pages/admin/knowledge/KnowledgePortal"));
// Admin - Configuración
const SettingsAdmin = lazy(() => import("./pages/admin/settings/SettingsAdmin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, gcTime: 30 * 60 * 1000, refetchOnWindowFocus: false, retry: 1 },
  },
});

const RouteFallback = () => <div className="min-h-screen bg-background" aria-hidden="true" />;

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <FloatingLanguageSelector />
          <CursorHalo />
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/contacto" element={<About />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/servicios" element={<ServicesIndex />} />
            <Route path="/servicios/:slug" element={<ServicePage />} />
            <Route path="/confirmacion" element={<ThankYou variant="booking" />} />
            <Route path="/confirmación" element={<ThankYou variant="booking" />} />
            <Route path="/agradecimiento" element={<ThankYou variant="contact" />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/presupuesto/:slug" element={<BudgetView />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="blog" element={<BlogAdmin />} />
              <Route path="tareas" element={<TasksAdmin />} />
              <Route path="contenidos" element={<ContentBlog />} />
              <Route path="contenidos/blog" element={<ContentBlog />} />
              <Route path="contenidos/testimonios" element={<ContentTestimonials />} />
              <Route path="contenidos/faqs" element={<ContentFaqs />} />
              <Route path="contenidos/multimedia" element={<ContentMedia />} />
              <Route path="contenidos/seo" element={<SeoDashboard />} />
              <Route path="agenda" element={<AgendaAdmin />} />
              <Route path="clientes" element={<ClientsAdmin />} />
              <Route path="clientes/documentos" element={<ClientDocuments />} />
              <Route path="clientes/invitaciones" element={<ClientInvites />} />
              <Route path="clientes/portal" element={<ClientPortal />} />
              <Route path="equipo" element={<TeamDirectory />} />
              <Route path="equipo/roles" element={<TeamRoles />} />
              <Route path="equipo/invitaciones" element={<TeamInvites />} />
              <Route path="equipo/organigrama" element={<TeamOrgChart />} />
              <Route path="chat" element={<TeamChat />} />
              <Route path="conocimiento" element={<KnowledgeDocs />} />
              <Route path="conocimiento/documentos" element={<KnowledgeDocs />} />
              <Route path="conocimiento/ayuda" element={<KnowledgeHelp />} />
              <Route path="conocimiento/portal" element={<KnowledgePortal />} />
              <Route path="configuracion" element={<SettingsAdmin />} />
              <Route path="presupuestos" element={<BudgetsList />} />
              <Route path="presupuestos/nuevo" element={<BudgetEditor />} />
              <Route path="presupuestos/:id" element={<BudgetEditor />} />
              <Route path="contactos" element={<ContactSubmissions />} />
              <Route path="cotizador" element={<Quoter />} />
              <Route path="multimedia" element={<Media />} />
              <Route path="seo" element={<SeoDashboard />} />
            </Route>
            <Route path="/academy" element={<AcademyLayout />}>
              <Route index element={<AcademyHome />} />
              <Route path="guias" element={<AcademyGuides />} />
              <Route path="videos" element={<AcademyVideos />} />
              <Route path="plantillas" element={<AcademyTemplates />} />
              <Route path="casos-de-uso" element={<AcademyUseCases />} />
              <Route path="avanzado" element={<AcademyAdvanced />} />
            </Route>
            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
