import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { HelmetProvider } from "react-helmet-async";
import FloatingLanguageSelector from "@/components/FloatingLanguageSelector";
import Index from "./pages/Index";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogAdmin from "./pages/BlogAdmin";
import AcademyLayout from "./pages/AcademyLayout";
import AcademyHome from "./pages/academy/AcademyHome";
import AcademyGuides from "./pages/academy/AcademyGuides";
import AcademyVideos from "./pages/academy/AcademyVideos";
import AcademyTemplates from "./pages/academy/AcademyTemplates";
import AcademyUseCases from "./pages/academy/AcademyUseCases";
import AcademyAdvanced from "./pages/academy/AcademyAdvanced";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <FloatingLanguageSelector />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/contacto" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/admin/blog" element={<BlogAdmin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
