import { useState, FormEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string,
      message: formData.get("message") as string,
    };

    try {
      const { error } = await supabase.functions.invoke("send-contact", {
        body: payload,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      toast({
        title: t.contact.errorTitle,
        description: t.contact.errorMessage,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contacto" className="section-padding bg-surface-elevated border-t border-foreground/[0.04]">
      <div className="container mx-auto px-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gradient mb-4">
            {t.contact.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t.contact.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="glass-card rounded-2xl p-8 lg:p-10"
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-10"
            >
              <p className="text-foreground font-display font-semibold text-xl mb-3">{t.contact.successTitle}</p>
              <p className="text-muted-foreground">{t.contact.successMessage}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">{t.contact.name}</label>
                <input
                  required
                  name="name"
                  type="text"
                  className="w-full glass-input rounded-xl px-5 py-3.5 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none"
                  placeholder={t.contact.namePlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">{t.contact.email}</label>
                <input
                  required
                  name="email"
                  type="email"
                  className="w-full glass-input rounded-xl px-5 py-3.5 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none"
                  placeholder={t.contact.emailPlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">{t.contact.company}</label>
                <input
                  name="company"
                  type="text"
                  className="w-full glass-input rounded-xl px-5 py-3.5 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none"
                  placeholder={t.contact.companyPlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">{t.contact.message}</label>
                <textarea
                  required
                  name="message"
                  rows={4}
                  className="w-full glass-input rounded-xl px-5 py-3.5 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none resize-none"
                  placeholder={t.contact.messagePlaceholder}
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2.5 bg-foreground text-background py-3.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {t.contact.sending}
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    {t.contact.submit}
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
