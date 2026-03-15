import React, { createContext, useContext, useState } from 'react';
import { LanguageCode, translations, LANGUAGES } from '@/lib/translations';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('language') as LanguageCode;
      return (saved && saved in translations) ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const handleSetLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    // Notify legacy listeners (e.g. Home.tsx uses window event)
    window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
  };

  const t = (key: string): string => {
    const keys = key.split('.');

    // Try current language first
    let value: any = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    if (typeof value === 'string') return value;

    // Fallback to English if key not found in current language
    let fallback: any = translations['en'];
    for (const k of keys) {
      fallback = fallback?.[k];
    }
    return typeof fallback === 'string' ? fallback : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export { LANGUAGES };
