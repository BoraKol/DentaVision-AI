import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Import translation files
import trTranslations from '../i18n/tr.json';
import enTranslations from '../i18n/en.json';

export type Language = 'tr' | 'en';

type TranslationKeys = typeof trTranslations;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    translations: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'dentavision_language';

const translationsMap: Record<Language, TranslationKeys> = {
    tr: trTranslations,
    en: enTranslations
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('tr');

    // Load language preference from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && (stored === 'tr' || stored === 'en')) {
                setLanguageState(stored as Language);
            }
        } catch (e) {
            console.error('Failed to load language preference', e);
        }
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {
            console.error('Failed to save language preference', e);
        }
    }, []);

    // Translation function with nested key support (e.g., "patient.name")
    const t = useCallback((key: string): string => {
        const keys = key.split('.');
        let value: any = translationsMap[language];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Return key if translation not found
                return key;
            }
        }

        return typeof value === 'string' ? value : key;
    }, [language]);

    const translations = translationsMap[language];

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            t,
            translations
        }}>
            {children}
        </LanguageContext.Provider>
    );
};
