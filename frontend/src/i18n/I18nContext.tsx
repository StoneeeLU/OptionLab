import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from './en.json';
import zh from './zh.json';

export type Language = 'en' | 'zh';

type Dict = Record<string, unknown>;

const translations: Record<Language, Dict> = {
  en: en as unknown as Dict,
  zh: zh as unknown as Dict,
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('optionlab-language');
    return (saved === 'en' || saved === 'zh') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('optionlab-language', language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState(prev => prev === 'en' ? 'zh' : 'en');
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');

    const getTranslation = (data: Dict, path: string[]) => {
      let current: unknown = data;
      for (const k of path) {
        if (current && typeof current === 'object' && k in (current as Record<string, unknown>)) {
          current = (current as Record<string, unknown>)[k];
        } else {
          return undefined;
        }
      }
      return typeof current === 'string' ? current : undefined;
    };

    // Try current language
    let result = getTranslation(translations[language], keys);
    
    // Fallback to English if not found
    if (result === undefined && language !== 'en') {
      result = getTranslation(translations['en'], keys);
    }

    // Return key if still not found
    return result !== undefined ? result : key;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
