import React, { useState, useCallback, createContext, useContext, ReactNode, useEffect } from 'react';
import { Language, TranslationSet } from '../types';
import { LANGUAGES } from '../lib/constants';
import { translations } from '../lib/i18n';

interface LocaleContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    texts: TranslationSet;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export const useLocale = () => useContext(LocaleContext)!;

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('hsc-lang') as Language) || LANGUAGES.en);

    const handleSetLanguage = useCallback((lang: Language) => {
        localStorage.setItem('hsc-lang', lang);
        setLanguage(lang);
        document.documentElement.lang = lang;
    }, []);

    useEffect(() => { document.documentElement.lang = language; }, [language]);

    const value = { language, setLanguage: handleSetLanguage, texts: translations[language] };
    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};
