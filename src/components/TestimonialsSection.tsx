import { useEffect, useState } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number | null;
  sort_order: number;
  image_url: string | null;
}

const TestimonialsSection = () => {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('id, name, role, company, content, rating, sort_order, image_url')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data) setTestimonials(data as Testimonial[]);
        setLoading(false);
      }, () => {
        setLoading(false);
      });
  }, []);

  if (loading || testimonials.length === 0) return null;

  return (
    <section className="section-padding bg-surface-elevated border-y border-foreground/[0.04] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-[20%] w-px h-[200px] bg-gradient-to-b from-foreground/[0.05] to-transparent" />
        <div className="absolute bottom-0 left-[30%] w-px h-[150px] bg-gradient-to-t from-foreground/[0.04] to-transparent" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Quote size={20} className="text-foreground/40" />
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-gradient mb-3">
              {t.testimonials?.title || 'Lo que dicen nuestros clientes'}
            </h2>
            <Quote size={20} className="text-foreground/40" />
          </div>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.testimonials?.subtitle || 'Experiencias reales de empresas que confiaron en nosotros.'}
          </p>
        </motion.div>

        <TestimonialsCarousel testimonials={testimonials} speed={60} />
      </div>
    </section>
  );
};

export default TestimonialsSection;