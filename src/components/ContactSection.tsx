import { useState, FormEvent, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string,
      message: formData.get("message") as string,
    };

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!projectId || !anonKey) {
        throw new Error("Missing config");
      }

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/send-contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) throw new Error("Failed");

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
    <section id="contacto" className="py-28 lg:py-36" ref={ref}>
      <div className="container mx-auto px-6 max-w-2xl">
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl sm:text-5xl font-bold text-gradient mb-5">
            {t.contact.title}
          </h2>
          <p className="text-lg text-secondary-soft leading-relaxed">
            {t.contact.subtitle}
          </p>
        </div>

        <div className={`glass-card rounded-2xl p-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: visible ? '200ms' : '0ms' }}>
          {submitted ? (
            <div className="text-center py-10">
              <p className="text-foreground font-semibold text-xl mb-3">{t.contact.successTitle}</p>
              <p className="text-secondary-soft text-base">{t.contact.successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-soft mb-2">{t.contact.name}</label>
                <input
                  required
                  name="name"
                  type="text"
                  className="w-full glass-input rounded-xl px-5 py-3 text-base text-foreground placeholder:text-foreground/30 focus:outline-none"
                  placeholder={t.contact.namePlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-soft mb-2">{t.contact.email}</label>
                <input
                  required
                  name="email"
                  type="email"
                  className="w-full glass-input rounded-xl px-5 py-3 text-base text-foreground placeholder:text-foreground/30 focus:outline-none"
                  placeholder={t.contact.emailPlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-soft mb-2">{t.contact.company}</label>
                <input
                  name="company"
                  type="text"
                  className="w-full glass-input rounded-xl px-5 py-3 text-base text-foreground placeholder:text-foreground/30 focus:outline-none"
                  placeholder={t.contact.companyPlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-soft mb-2">{t.contact.message}</label>
                <textarea
                  required
                  name="message"
                  rows={4}
                  className="w-full glass-input rounded-xl px-5 py-3 text-base text-foreground placeholder:text-foreground/30 focus:outline-none resize-none"
                  placeholder={t.contact.messagePlaceholder}
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full btn-primary-neutral flex items-center justify-center gap-2.5 py-3.5 rounded-full text-base font-semibold hover-scale disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {t.contact.sending}
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {t.contact.submit}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
