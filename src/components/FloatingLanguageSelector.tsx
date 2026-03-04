import { useTranslation } from "@/i18n/useTranslation";
import type { Language } from "@/i18n/LanguageContext";
import { Globe } from "lucide-react";

const FloatingLanguageSelector = () => {
  const { language, setLanguage } = useTranslation();

  const toggle = () => setLanguage(language === "es" ? "en" : "es" as Language);

  return (
    <button
      onClick={toggle}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-card border border-border/50 shadow-lg backdrop-blur-sm text-sm font-medium text-foreground hover:bg-secondary/80 transition-all hover:scale-105 active:scale-95"
      aria-label="Change language"
    >
      <Globe className="w-4 h-4 text-muted-foreground" />
      <span className="text-base leading-none">{language === "es" ? "🇪🇸" : "🇬🇧"}</span>
      <span className="text-xs font-semibold">{language === "es" ? "ES" : "EN"}</span>
    </button>
  );
};

export default FloatingLanguageSelector;
