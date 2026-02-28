import React from 'react';
import { Menu, ArrowLeft, HeartPulse } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import LanguageToggle from '../LanguageToggle';
import ThemeToggle from '../ThemeToggle';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import { View } from './Sidebar';

interface HeaderProps {
    toggleSidebar: () => void;
    toggleCollapse: () => void;
    t: (key: string) => string;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, toggleCollapse, t }) => {
    const { user } = useUser();
    const { language } = useLanguage();
    const location = useLocation();

    const getViewFromPath = (path: string): View => {
        if (path.includes('/patients/')) return View.PATIENT_DETAILS;
        if (path.includes('/patients')) return View.PATIENTS;
        if (path.includes('/calendar')) return View.CALENDAR;
        if (path.includes('/intake')) return View.INTAKE;
        if (path.includes('/imaging')) return View.IMAGING;
        if (path.includes('/treatment')) return View.TREATMENT;
        if (path.includes('/financials')) return View.FINANCIALS;
        if (path.includes('/inventory')) return View.INVENTORY;
        if (path.includes('/lab-tracking')) return View.LAB_TRACKING;
        if (path.includes('/tasks')) return View.TASKS;
        if (path.includes('/settings')) return View.SETTINGS;
        return View.DASHBOARD;
    };

    const currentView = getViewFromPath(location.pathname);

    const getViewTitle = () => {
        switch (currentView) {
            case View.DASHBOARD: return t('app.dashboard');
            case View.PATIENTS: return t('app.patients');
            case View.PATIENT_DETAILS: return language === 'tr' ? 'Hasta Detayları' : 'Patient Details';
            case View.CALENDAR: return t('app.calendar');
            case View.INTAKE: return t('app.intake');
            case View.IMAGING: return t('app.imaging');
            case View.TREATMENT: return t('app.treatment');
            case View.FINANCIALS: return language === 'tr' ? 'Mali Raporlar' : 'Financials';
            case View.INVENTORY: return language === 'tr' ? 'Stok Yönetimi' : 'Inventory Management';
            case View.LAB_TRACKING: return language === 'tr' ? 'Laboratuvar Takibi' : 'Laboratory Tracking';
            case View.TASKS: return language === 'tr' ? 'Görev Takibi' : 'Task Tracking';
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
                    <Link
                        to="/"
                        className="hidden lg:flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        {t('app.dashboard')}
                    </Link>
                )}
                <h1 className="text-lg font-semibold text-slate-800 truncate max-w-[150px] sm:max-w-none">
                    {getViewTitle()}
                </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 py-2">
                <div className="flex items-center px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold animate-pulse-slow border border-red-100 mr-2 shadow-sm">
                    <HeartPulse className="w-3.5 h-3.5 mr-1.5" />
                    LIVE
                </div>
                <ThemeToggle />
                <LanguageToggle />
                <span className="hidden lg:inline-block px-3 py-1 text-xs font-medium text-teal-700 bg-teal-50 rounded-full border border-teal-100 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                    {user.clinicName}
                </span>
            </div>
        </header>
    );
};

export default Header;
