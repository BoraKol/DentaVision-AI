import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { notificationService } from '../../infrastructure/services/NotificationService';
import { useAppointment } from './AppointmentContext';

interface NotificationSettings {
    enabled: boolean;
    appointmentReminders: boolean;
    reminderMinutes: number;
    followUpReminders: boolean;
}

interface NotificationContextType {
    settings: NotificationSettings;
    updateSettings: (settings: Partial<NotificationSettings>) => void;
    requestPermission: () => Promise<boolean>;
    permissionStatus: 'granted' | 'denied' | 'default' | 'unsupported';
    sendTestNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'dentavision_notification_settings';

const defaultSettings: NotificationSettings = {
    enabled: false,
    appointmentReminders: true,
    reminderMinutes: 30,
    followUpReminders: true
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
    const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');

    // Load settings from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setSettings({ ...defaultSettings, ...JSON.parse(stored) });
            }
            setPermissionStatus(notificationService.getPermissionStatus());
        } catch (e) {
            console.error('Failed to load notification settings', e);
        }
    }, []);

    // Save settings to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error('Failed to save notification settings', e);
        }
    }, [settings]);

    const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    }, []);

    const requestPermission = useCallback(async (): Promise<boolean> => {
        const granted = await notificationService.requestPermission();
        setPermissionStatus(notificationService.getPermissionStatus());
        if (granted) {
            updateSettings({ enabled: true });
        }
        return granted;
    }, [updateSettings]);

    const sendTestNotification = useCallback(() => {
        notificationService.show('DentaVision AI', {
            body: 'Bildirimler başarıyla etkinleştirildi! 🦷',
            tag: 'test-notification'
        });
    }, []);

    return (
        <NotificationContext.Provider value={{
            settings,
            updateSettings,
            requestPermission,
            permissionStatus,
            sendTestNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
