import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Disclaimer from '../Disclaimer';
import { ErrorBoundary } from '../ErrorBoundary';
import { NetworkStatus } from '../NetworkStatus';
import { useLanguage } from '../../context/LanguageContext';
import { notificationService } from '../../services/PushNotificationService';

const RootLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        notificationService.init();
    }, []);

    return (
        <div className="flex h-screen h-dvh overflow-hidden bg-slate-50">
            <NetworkStatus />

            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isCollapsed}
            />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                    t={t}
                />

                <div className="flex-1 overflow-y-auto p-2 md:p-4 lg:p-8 pb-8 lg:pb-8 mb-[env(safe-area-inset-bottom)]">
                    <ErrorBoundary>
                        <div className="max-w-7xl mx-auto space-y-6">
                            <Outlet />
                        </div>
                    </ErrorBoundary>
                    <Disclaimer />
                </div>
            </main>
        </div>
    );
};

export default RootLayout;
