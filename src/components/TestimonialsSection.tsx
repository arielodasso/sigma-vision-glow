import { useEffect, useState } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number | null;
  sort_order: number;
}

const TestimonialsSection = () => {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('id, name, role, company, content, rating, sort_order')
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
            <Quote size={20} className="text-sigma-yellow" />
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-gradient mb-3">
              {t.testimonials?.title || 'Lo que dicen nuestros clientes'}
            </h2>
            <Quote size={20} className="text-sigma-yellow" />
          </div>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.testimonials?.subtitle || 'Experiencias reales de empresas que confiaron en nosotros.'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-7 flex flex-col"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, star) => (
                  <Star
                    key={star}
                    size={16}
                    className={
                      testimonial.rating && star < testimonial.rating
                        ? 'fill-sigma-yellow text-sigma-yellow'
                        : 'text-foreground/15'
                    }
                  />
                ))}
              </div>
              <blockquote className="flex-1 text-foreground/80 text-sm leading-relaxed mb-6">
                "{testimonial.content}"
              </blockquote>
              <footer className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center">
                  <Quote size={14} className="text-foreground/30" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-foreground/40">
                    {testimonial.role && testimonial.company
                      ? `${testimonial.role} · ${testimonial.company}`
                      : testimonial.role || testimonial.company || ''}
                  </p>
                </div>
              </footer>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;