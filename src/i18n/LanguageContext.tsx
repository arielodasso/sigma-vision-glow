import { createContext, useState, useEffect, ReactNode } from "react";
import es from "./locales/es";
import en from "./locales/en";

export type Language = "es" | "en";

type Translations = typeof es;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "es",
  setLanguage: () => {},
  t: es,
});

const locales: Record<Language, Translations> = { es, en: en as unknown as Translations };

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("sigma-tech-lang");
    if (stored === "en" || stored === "es") return stored;
    return navigator.language.startsWith("en") ? "en" : "es";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("sigma-tech-lang", lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: locales[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};
