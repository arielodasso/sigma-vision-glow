import { useTranslation } from "@/i18n/useTranslation";
import type { Language } from "@/i18n/LanguageContext";
import { Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FloatingLanguageSelector = () => {
  const { language, setLanguage } = useTranslation();

  const toggle = () => setLanguage(language === "es" ? "en" : "es" as Language);

  return (
    <motion.button
      onClick={toggle}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1, duration: 0.4, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.08, boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-card border border-border/50 shadow-lg backdrop-blur-sm text-sm font-medium text-foreground"
      aria-label="Change language"
    >
      <motion.div
        animate={{ rotate: language === "es" ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        <Globe className="w-4 h-4 text-muted-foreground" />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.span
          key={language}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
          className="text-base leading-none"
        >
          {language === "es" ? "🇪🇸" : "🇬🇧"}
        </motion.span>
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.span
          key={language + "-label"}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 4 }}
          transition={{ duration: 0.15 }}
          className="text-xs font-semibold"
        >
          {language === "es" ? "ES" : "EN"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};

export default FloatingLanguageSelector;
