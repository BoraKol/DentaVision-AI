import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const NetworkStatus: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const { language } = useLanguage();

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="bg-amber-500 text-white px-4 py-2 text-sm font-medium flex items-center justify-center animate-in slide-in-from-top-full fixed bottom-0 left-0 right-0 z-[100] lg:static lg:z-auto">
            <WifiOff className="w-4 h-4 mr-2" />
            {language === 'tr'
                ? 'İnternet bağlantısı yok. Çevrimdışı moddasınız.'
                : 'No internet connection. You are in offline mode.'}
        </div>
    );
};
