import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { useParams } from "react-router-dom";

const BlogPost = () => {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-36 pb-20 lg:pt-44 lg:pb-28">
        <div className="container mx-auto px-6 max-w-3xl">
          <p className="text-muted-foreground text-center py-20">
            Artículo "{slug}" — próximamente.
          </p>
        </div>
      </section>
      <FooterSection />
    </div>
  );
};

export default BlogPost;
