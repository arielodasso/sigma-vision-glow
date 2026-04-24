import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ManifestoSection from "@/components/ManifestoSection";
import ServicesSection from "@/components/ServicesSection";
import ProjectsSection from "@/components/ProjectsSection";
import ProductsSection from "@/components/ProductsSection";
import CTASection from "@/components/CTASection";
import FooterSection from "@/components/FooterSection";
import useSmoothScroll from "@/hooks/use-smooth-scroll";

const Index = () => {
  useSmoothScroll();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ManifestoSection />
      <ServicesSection />
      <ProjectsSection />
      <ProductsSection />
      <CTASection />
      <FooterSection />
    </div>
  );
};

export default Index;
