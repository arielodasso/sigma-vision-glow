import { useContext } from "react";
import { LanguageContext } from "./LanguageContext";

export const useTranslation = () => useContext(LanguageContext);
