import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ProjectsSection from "@/components/ProjectsSection";
import ProductsSection from "@/components/ProductsSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import FooterSection from "@/components/FooterSection";
import useSmoothScroll from "@/hooks/use-smooth-scroll";

const Index = () => {
  useSmoothScroll();
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Sigma Tecnologías | Menos promesas. Más soluciones.</title>
        <meta name="description" content="Desarrollamos software a medida, plataformas digitales, automatizaciones con IA y productos tecnológicos propios. Menos promesas. Más soluciones." />
        <link rel="canonical" href="https://www.sigmatecnologiasarg.com/" />
        <meta property="og:url" content="https://www.sigmatecnologiasarg.com/" />
      </Helmet>
      <Navbar />
      <HeroSection />
      
      <ServicesSection />
      <ProjectsSection />
      <TestimonialsSection />
      <ProductsSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </div>
  );
};

export default Index;

