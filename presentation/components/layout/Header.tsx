import React from 'react';
import { Menu, ArrowLeft } from 'lucide-react';
import LanguageToggle from '../LanguageToggle';
import ThemeToggle from '../ThemeToggle';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import { View } from './Sidebar';

interface HeaderProps {
    currentView: View;
    onViewChange: (view: View) => void;
    toggleSidebar: () => void;
    toggleCollapse: () => void;
    t: (key: string) => string;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, toggleSidebar, toggleCollapse, t }) => {
    const { user } = useUser();
    const { language } = useLanguage();

    const getViewTitle = () => {
        switch (currentView) {
            case View.DASHBOARD: return t('app.dashboard');
            case View.PATIENTS: return t('app.patients');
            case View.CALENDAR: return t('app.calendar');
            case View.INTAKE: return t('app.intake');
            case View.IMAGING: return t('app.imaging');
            case View.TREATMENT: return t('app.treatment');
            case View.FINANCIALS: return language === 'tr' ? 'Mali Raporlar' : 'Financials';
            case View.INVENTORY: return language === 'tr' ? 'Stok Yönetimi' : 'Inventory Management';
            case View.LAB_TRACKING: return language === 'tr' ? 'Laboratuvar Takibi' : 'Laboratory Tracking';
            case View.SETTINGS: return t('app.settings');
            default: return t('app.dashboard');
        }
    };

    return (
        <header className="flex items-center justify-between min-h-[4rem] px-4 bg-white border-b border-slate-200 lg:px-8 sticky top-0 z-30 pt-[env(safe-area-inset-top)] transition-all">
            <div className="flex items-center space-x-3 py-2">
                <button
                    onClick={() => {
                        if (window.innerWidth >= 1024) {
                            toggleCollapse();
                        } else {
                            toggleSidebar();
                        }
                    }}
                    className="p-2 -ml-2 text-slate-500 rounded-md hover:bg-slate-100 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                {currentView !== View.DASHBOARD && (
                    <button
                        onClick={() => onViewChange(View.DASHBOARD)}
                        className="hidden lg:flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        {t('app.dashboard')}
                    </button>
                )}
                <h1 className="text-lg font-semibold text-slate-800 truncate max-w-[150px] sm:max-w-none">
                    {getViewTitle()}
                </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 py-2">
                <ThemeToggle />
                <LanguageToggle />
                <span className="hidden sm:inline-block px-3 py-1 text-xs font-medium text-teal-700 bg-teal-50 rounded-full border border-teal-100">
                    {user.clinicName}
                </span>
            </div>
        </header>
    );
};

export default Header;
