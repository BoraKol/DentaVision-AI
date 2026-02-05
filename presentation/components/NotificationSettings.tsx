import React from 'react';
import { Bell, BellOff, Check, X, Clock } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

const NotificationSettings: React.FC = () => {
    const {
        settings,
        updateSettings,
        requestPermission,
        permissionStatus,
        sendTestNotification
    } = useNotification();
    const { addToast } = useToast();
    const { language } = useLanguage();

    // i18n labels
    const labels = {
        title: language === 'tr' ? 'Bildirim Ayarları' : 'Notification Settings',
        subtitle: language === 'tr' ? 'Hatırlatmalar ve uyarıları yönetin' : 'Manage reminders and alerts',
        notificationsActive: language === 'tr' ? 'Bildirimler Aktif' : 'Notifications Active',
        notificationsOff: language === 'tr' ? 'Bildirimler Kapalı' : 'Notifications Off',
        permissionGranted: language === 'tr' ? 'Tarayıcı izni verildi' : 'Browser permission granted',
        permissionDenied: language === 'tr' ? 'Tarayıcı izni reddedildi' : 'Browser permission denied',
        permissionDefault: language === 'tr' ? 'Henüz izin istenmedi' : 'Permission not requested yet',
        permissionUnsupported: language === 'tr' ? 'Bu tarayıcı desteklenmiyor' : 'This browser is not supported',
        disable: language === 'tr' ? 'Kapat' : 'Disable',
        enable: language === 'tr' ? 'Etkinleştir' : 'Enable',
        appointmentReminders: language === 'tr' ? 'Randevu Hatırlatmaları' : 'Appointment Reminders',
        appointmentRemindersDesc: language === 'tr' ? 'Randevulardan önce bildirim al' : 'Get notified before appointments',
        reminderTime: language === 'tr' ? 'Hatırlatma zamanı' : 'Reminder time',
        min15: language === 'tr' ? '15 dakika önce' : '15 minutes before',
        min30: language === 'tr' ? '30 dakika önce' : '30 minutes before',
        hour1: language === 'tr' ? '1 saat önce' : '1 hour before',
        hour2: language === 'tr' ? '2 saat önce' : '2 hours before',
        day1: language === 'tr' ? '1 gün önce' : '1 day before',
        followUpReminders: language === 'tr' ? 'Takip Hatırlatmaları' : 'Follow-up Reminders',
        followUpRemindersDesc: language === 'tr' ? 'Hasta takipleri için bildirim al' : 'Get notified for patient follow-ups',
        testNotification: language === 'tr' ? 'Test Bildirimi Gönder' : 'Send Test Notification',
        enabledToast: language === 'tr' ? 'Bildirimler etkinleştirildi!' : 'Notifications enabled!',
        deniedToast: language === 'tr' ? 'Bildirim izni reddedildi. Tarayıcı ayarlarından izin verebilirsiniz.' : 'Notification permission denied. You can enable it from browser settings.',
        disabledToast: language === 'tr' ? 'Bildirimler devre dışı bırakıldı.' : 'Notifications disabled.'
    };

    const handleEnableNotifications = async () => {
        const granted = await requestPermission();
        if (granted) {
            addToast(labels.enabledToast, 'success');
            sendTestNotification();
        } else {
            addToast(labels.deniedToast, 'warning');
        }
    };

    const handleDisableNotifications = () => {
        updateSettings({ enabled: false });
        addToast(labels.disabledToast, 'info');
    };

    const getPermissionText = () => {
        switch (permissionStatus) {
            case 'granted': return labels.permissionGranted;
            case 'denied': return labels.permissionDenied;
            case 'unsupported': return labels.permissionUnsupported;
            default: return labels.permissionDefault;
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">{labels.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{labels.subtitle}</p>
                </div>
            </div>

            {/* Permission Status */}
            <div className="mb-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {settings.enabled ? (
                            <Bell className="w-5 h-5 text-green-600" />
                        ) : (
                            <BellOff className="w-5 h-5 text-slate-400" />
                        )}
                        <div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">
                                {settings.enabled ? labels.notificationsActive : labels.notificationsOff}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {getPermissionText()}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={settings.enabled ? handleDisableNotifications : handleEnableNotifications}
                        disabled={permissionStatus === 'denied' || permissionStatus === 'unsupported'}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${settings.enabled
                                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-teal-600 text-white hover:bg-teal-700'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        {settings.enabled ? labels.disable : labels.enable}
                    </button>
                </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
                {/* Appointment Reminders */}
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                    <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300">{labels.appointmentReminders}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{labels.appointmentRemindersDesc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.appointmentReminders}
                            onChange={(e) => updateSettings({ appointmentReminders: e.target.checked })}
                            disabled={!settings.enabled}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                    </label>
                </div>

                {/* Reminder Time */}
                {settings.appointmentReminders && (
                    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 pl-6">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <p className="text-sm text-slate-600 dark:text-slate-400">{labels.reminderTime}</p>
                        </div>
                        <select
                            value={settings.reminderMinutes}
                            onChange={(e) => updateSettings({ reminderMinutes: Number(e.target.value) })}
                            disabled={!settings.enabled}
                            className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-teal-500"
                        >
                            <option value={15}>{labels.min15}</option>
                            <option value={30}>{labels.min30}</option>
                            <option value={60}>{labels.hour1}</option>
                            <option value={120}>{labels.hour2}</option>
                            <option value={1440}>{labels.day1}</option>
                        </select>
                    </div>
                )}

                {/* Follow-up Reminders */}
                <div className="flex items-center justify-between py-3">
                    <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300">{labels.followUpReminders}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{labels.followUpRemindersDesc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.followUpReminders}
                            onChange={(e) => updateSettings({ followUpReminders: e.target.checked })}
                            disabled={!settings.enabled}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                    </label>
                </div>
            </div>

            {/* Test Notification */}
            {settings.enabled && (
                <button
                    onClick={sendTestNotification}
                    className="mt-6 w-full py-2 text-sm text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                >
                    {labels.testNotification}
                </button>
            )}
        </div>
    );
};

export default NotificationSettings;
