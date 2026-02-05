import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';

const LanguageToggle: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'tr' ? 'en' : 'tr');
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title={language === 'tr' ? 'Switch to English' : 'Türkçe\'ye Geç'}
        >
            <Globe className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">
                {language === 'tr' ? 'TR' : 'EN'}
            </span>
        </button>
    );
};

export default LanguageToggle;
