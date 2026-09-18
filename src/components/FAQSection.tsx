import { useEffect, useState } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
}

const FAQSection = () => {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('faqs')
      .select('id, category, question, answer, sort_order')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data) setFaqs(data as FAQ[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || faqs.length === 0) return null;

  // Group FAQs by category
  const grouped = faqs.reduce((acc, faq) => {
    const category = faq.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-[25%] w-px h-[200px] bg-gradient-to-b from-foreground/[0.05] to-transparent" />
        <div className="absolute bottom-0 left-[35%] w-px h-[150px] bg-gradient-to-t from-foreground/[0.04] to-transparent" />
      </div>

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-gradient mb-3">
            {t.faqs?.title || 'Preguntas frecuentes'}
          </h2>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.faqs?.subtitle || 'Respuestas rápidas para las dudas más comunes sobre nuestros servicios y proceso.'}
          </p>
        </motion.div>

        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items], catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: catIndex * 0.1 }}
            >
              <h3 className="font-display text-lg font-semibold text-foreground mb-4 capitalize">
                {category === 'general' ? (t.faqs?.generalCategory || 'General') : category}
              </h3>
              <Accordion type="single" collapsible className="space-y-3">
                {items.map((faq, i) => (
                  <AccordionItem key={faq.id} value={`faq-${faq.id}`} className="glass-card rounded-2xl px-6 border border-foreground/[0.04]">
                    <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-foreground hover:no-underline py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;