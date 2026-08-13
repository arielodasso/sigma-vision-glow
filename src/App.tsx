import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { HelmetProvider } from "react-helmet-async";
import FloatingLanguageSelector from "@/components/FloatingLanguageSelector";
import CursorHalo from "@/components/CursorHalo";
import Index from "./pages/Index";

// Rutas no críticas: se cargan bajo demanda para acelerar la primera carga.
const About = lazy(() => import("./pages/About"));
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, gcTime: 30 * 60 * 1000, refetchOnWindowFocus: false, retry: 1 },
  },
});

const RouteFallback = () => <div className="min-h-screen bg-background" aria-hidden="true" />;

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <FloatingLanguageSelector />
          <CursorHalo />
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/contacto" element={<About />} />
            <Route path="/confirmacion" element={<ThankYou variant="booking" />} />
            <Route path="/confirmación" element={<ThankYou variant="booking" />} />
            <Route path="/agradecimiento" element={<ThankYou variant="contact" />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/presupuesto/:slug" element={<BudgetView />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<BlogAdmin />} />
              <Route path="blog" element={<BlogAdmin />} />
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
        </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
