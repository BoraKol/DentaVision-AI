import React, { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Mail, Building, FileBadge, Save, Camera, Check, LogOut, Key, Eye, EyeOff, X } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';
import NotificationSettings from './NotificationSettings';

const ProfileSettingsContent: React.FC = () => {
    const { user, updateUser } = useUser();
    const { logout } = useAuth();
    const { t, language } = useLanguage();
    const [formData, setFormData] = useState(user);
    const [isSaved, setIsSaved] = useState(false);
    const [apiKey, setApiKey] = useState(user.geminiApiKey || '');
    const [showKey, setShowKey] = useState(false);
    const [keySaved, setKeySaved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);



    const handleSaveKey = async () => {
        try {
            await updateUser({ geminiApiKey: apiKey.trim() } as any);
            // Clean up old insecure storage if it exists
            localStorage.removeItem('denta_vision_gemini_key');
            setKeySaved(true);
            setTimeout(() => setKeySaved(false), 3000);
        } catch (error) {
            console.error('Failed to save API key:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsSaved(false);
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
                setIsSaved(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateUser(formData);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    const handleDeleteAvatar = async () => {
        const updatedData = { ...formData, avatarUrl: '' };
        setFormData(updatedData);
        try {
            await updateUser({ avatar: '' } as any);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (error) {
            console.error('Failed to delete avatar:', error);
        }
    };

    // Labels based on language
    const labels = {
        title: language === 'tr' ? 'Unvan' : 'Title',
        name: language === 'tr' ? 'Ad Soyad' : 'Full Name',
        specialty: language === 'tr' ? 'Uzmanlık' : 'Specialty',
        clinicName: language === 'tr' ? 'Klinik Adı' : 'Clinic Name',
        email: language === 'tr' ? 'E-posta Adresi' : 'Email Address',
        changePhoto: language === 'tr' ? 'Fotoğrafı Değiştir' : 'Change Photo',
        savedSuccess: language === 'tr' ? 'Başarıyla Kaydedildi' : 'Successfully Saved',
        saveSettings: language === 'tr' ? 'Ayarları Kaydet' : 'Save Settings'
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{t('settings.title')}</h2>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header / Avatar */}
                <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-3xl font-bold overflow-hidden border-4 border-white shadow-sm">
                            {formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span>{formData.name.charAt(0)}</span>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 shadow-md transition-colors"
                                title={labels.changePhoto}
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            {formData.avatarUrl && (
                                <button
                                    type="button"
                                    onClick={handleDeleteAvatar}
                                    className="absolute -top-1 -right-1 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 shadow-sm border border-white transition-colors"
                                    title={language === 'tr' ? 'Fotoğrafı Sil' : 'Delete Photo'}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                        />
                    </div>
                    <div className="text-center sm:text-left">
                        <h3 className="text-xl font-bold text-slate-800">{formData.title} {formData.name}</h3>
                        <p className="text-slate-500">{formData.specialty}</p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="p-6 sm:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{labels.title}</label>
                            <div className="relative">
                                <select
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none appearance-none bg-white"
                                >
                                    <option value="Dr.">Dr.</option>
                                    <option value="Dt.">Dt.</option>
                                    <option value="Prof. Dr.">Prof. Dr.</option>
                                    <option value="Doç. Dr.">Doç. Dr.</option>
                                    <option value="Uzm. Dt.">Uzm. Dt.</option>
                                </select>
                                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{labels.name}</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                />
                                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{labels.specialty}</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="specialty"
                                    value={formData.specialty}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                />
                                <FileBadge className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{labels.clinicName}</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="clinicName"
                                    value={formData.clinicName}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                />
                                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{labels.email}</label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            />
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                    <button
                        type="submit"
                        className={`flex items-center px-6 py-2 rounded-lg text-white font-medium transition-all transform ${isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-teal-600 hover:bg-teal-700 hover:-translate-y-0.5'
                            }`}
                    >
                        {isSaved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {isSaved ? labels.savedSuccess : labels.saveSettings}
                    </button>
                </div>
            </form>

            {/* AI Configuration */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-lg font-medium text-slate-800 flex items-center">
                        <Key className="w-5 h-5 mr-2 text-teal-600" />
                        {language === 'tr' ? 'Yapay Zeka Konfigürasyonu' : 'AI Configuration'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        {language === 'tr'
                            ? 'Kendi Gemini API anahtarınızı kullanarak AI özelliklerini etkinleştirin.'
                            : 'Enable AI features using your own Gemini API key.'}
                    </p>
                </div>
                <div className="p-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Gemini API Key
                    </label>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full pl-10 pr-12 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                placeholder="AIzaSy..."
                            />
                            <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleSaveKey}
                            className={`px-4 py-2 rounded-lg text-white font-medium transition-all flex items-center ${keySaved ? 'bg-green-600' : 'bg-teal-600 hover:bg-teal-700'
                                }`}
                        >
                            {keySaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            <span className="ml-2 hidden sm:inline">{language === 'tr' ? 'Kaydet' : 'Save'}</span>
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        {language === 'tr'
                            ? 'Anahtarınız kullanıcı profilinizde güvenli bir şekilde saklanır ve sadece sizin oturumunuzda kullanılır.'
                            : 'Your key is securely stored in your user profile and only used within your session.'}
                    </p>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="mt-6">
                <NotificationSettings />
            </div>

            {/* Session / Danger Zone */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-slate-800">
                            {language === 'tr' ? 'Oturum' : 'Session'}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {language === 'tr'
                                ? 'Mevcut oturumunuzu güvenli bir şekilde sonlandırın.'
                                : 'Securely end your current session.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={logout}
                        className="flex items-center px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        {language === 'tr' ? 'Çıkış Yap' : 'Sign Out'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProfileSettings: React.FC = () => (
    <ErrorBoundary>
        <ProfileSettingsContent />
    </ErrorBoundary>
);

export default ProfileSettings;
