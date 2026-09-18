import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Loader2, MessageCircle, Calendar, AlertCircle } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import BookingModal from "./BookingModal";
import { services } from "@/data/services";
import { analytics } from "@/lib/analytics";

const WHATSAPP_URL = "https://wa.me/5492494556374?text=Hola%2C%20vengo%20del%20sitio%20y%20quiero%20escribirles%20directamente.";

type Errors = Partial<Record<"name" | "email" | "whatsapp" | "need", string>>;

const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [sendFailed, setSendFailed] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validate = (data: Record<string, string>): Errors => {
    const e: Errors = {};
    if (!data.name?.trim()) e.name = "Ingresá tu nombre";
    else if (data.name.trim().length > 100) e.name = "Máximo 100 caracteres";
    if (!data.email?.trim()) e.email = "Ingresá tu email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) e.email = "Email inválido";
    if (data.whatsapp?.trim() && !/^[+0-9 ()-]{6,20}$/.test(data.whatsapp.trim())) e.whatsapp = "WhatsApp inválido";
    if (!data.need?.trim()) e.need = "Elegí qué necesitás";
    return e;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: (formData.get("name") as string) || "",
      email: (formData.get("email") as string) || "",
      company: (formData.get("company") as string) || "",
      whatsapp: (formData.get("whatsapp") as string) || "",
      service: (formData.get("need") as string) || "",
      message: (formData.get("message") as string) || "",
    };

    const validationErrors = validate(payload);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSendFailed(false);
    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-contact", { body: payload });
      if (error) throw error;
      if (data && (data as { error?: string }).error) throw new Error((data as { error: string }).error);
      setSubmitted(true);
      analytics.submitContacto({ service: payload.service });
      toast({
        title: t.contact.successTitle,
        description: t.contact.successMessage,
      });
      navigate("/agradecimiento");
    } catch (err) {
      console.error("[ContactSection] send-contact failed:", err);
      setSendFailed(true);
      toast({
        title: t.contact.errorTitle,
        description: t.contact.errorMessage,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const inputBase = "w-full glass-input rounded-xl px-5 py-3.5 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none transition-colors";
  const errorRing = "ring-1 ring-red-500/40 focus:ring-red-500/60";

  return (
    <section id="contacto" className="section-padding bg-surface-elevated border-t border-foreground/[0.04] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-[25%] w-px h-[200px] bg-gradient-to-b from-foreground/[0.05] to-transparent" />
        <div className="absolute bottom-0 left-[35%] w-px h-[150px] bg-gradient-to-t from-foreground/[0.04] to-transparent" />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[10%] w-10 h-10 border border-foreground/[0.03] rounded-lg rotate-12"
        />
      </div>

      <div className="container mx-auto px-6 max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-gradient mb-4">{t.contact.title}</h2>
          <p className="text-sm sm:text-lg text-muted-foreground">{t.contact.subtitle}</p>
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
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground/60 mb-2">{t.contact.name}</label>
                  <input
                    required
                    name="name"
                    type="text"
                    maxLength={100}
                    className={`${inputBase} ${errors.name ? errorRing : ""}`}
                    placeholder={t.contact.namePlaceholder}
                    onChange={() => errors.name && setErrors((p) => ({ ...p, name: undefined }))}
                  />
                  {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/60 mb-2">{t.contact.company}</label>
                  <input
                    name="company"
                    type="text"
                    maxLength={100}
                    className={inputBase}
                    placeholder={t.contact.companyPlaceholder}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground/60 mb-2">{t.contact.email}</label>
                  <input
                    required
                    name="email"
                    type="email"
                    maxLength={255}
                    className={`${inputBase} ${errors.email ? errorRing : ""}`}
                    placeholder={t.contact.emailPlaceholder}
                    onChange={() => errors.email && setErrors((p) => ({ ...p, email: undefined }))}
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/60 mb-2">{t.contact.whatsapp}</label>
                  <input
                    name="whatsapp"
                    type="tel"
                    maxLength={20}
                    className={`${inputBase} ${errors.whatsapp ? errorRing : ""}`}
                    placeholder={t.contact.whatsappPlaceholder}
                    onChange={() => errors.whatsapp && setErrors((p) => ({ ...p, whatsapp: undefined }))}
                  />
                  {errors.whatsapp && <p className="mt-1.5 text-xs text-red-400">{errors.whatsapp}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">{t.contact.need}</label>
                <select
                  required
                  name="need"
                  defaultValue=""
                  className={`${inputBase} ${errors.need ? errorRing : ""} bg-card`}
                  onChange={() => errors.need && setErrors((p) => ({ ...p, need: undefined }))}
                >
                  <option value="" disabled>{t.contact.needPlaceholder}</option>
                  {services.map((s) => (
                    <option key={s.slug} value={s.slug}>{s.name}</option>
                  ))}
                  <option value="otro">Otro</option>
                </select>
                {errors.need && <p className="mt-1.5 text-xs text-red-400">{errors.need}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">{t.contact.additional}</label>
                <textarea
                  name="message"
                  rows={4}
                  maxLength={4000}
                  className={`${inputBase} resize-none`}
                  placeholder={t.contact.additionalPlaceholder}
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

              {/* Fallback when sending fails */}
              <AnimatePresence>
                {sendFailed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.08]">
                      <div className="flex items-start gap-2.5 mb-3">
                        <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground/70 leading-relaxed">
                          No pudimos enviar tu mensaje ahora mismo. Probá una de estas alternativas — te respondemos enseguida.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <a
                          href={WHATSAPP_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-foreground/[0.05] hover:bg-foreground/[0.1] border border-foreground/[0.08] text-sm text-foreground/85 transition-colors"
                        >
                          <MessageCircle size={14} />
                          WhatsApp
                        </a>
                        <button
                          type="button"
                          onClick={() => setBookingOpen(true)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-foreground/[0.05] hover:bg-foreground/[0.1] border border-foreground/[0.08] text-sm text-foreground/85 transition-colors"
                        >
                          <Calendar size={14} />
                          Reservar reunión
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          )}
        </motion.div>
      </div>

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </section>
  );
};

export default ContactSection;