import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Building2, Stethoscope, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, register } = useAuth();
    const { language } = useLanguage();

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [title, setTitle] = useState('Dt.');
    const [specialty, setSpecialty] = useState('');
    const [clinicName, setClinicName] = useState('');

    const labels = {
        title: language === 'tr' ? 'DentaVision AI' : 'DentaVision AI',
        subtitle: language === 'tr' ? 'Diş Hekimleri için Yapay Zeka Destekli Klinik Asistan' : 'AI-Powered Clinical Assistant for Dentists',
        login: language === 'tr' ? 'Giriş Yap' : 'Sign In',
        register: language === 'tr' ? 'Kayıt Ol' : 'Sign Up',
        email: language === 'tr' ? 'E-posta' : 'Email',
        password: language === 'tr' ? 'Şifre' : 'Password',
        name: language === 'tr' ? 'Ad Soyad' : 'Full Name',
        titleLabel: language === 'tr' ? 'Unvan' : 'Title',
        specialty: language === 'tr' ? 'Uzmanlık' : 'Specialty',
        clinicName: language === 'tr' ? 'Klinik Adı' : 'Clinic Name',
        noAccount: language === 'tr' ? 'Hesabınız yok mu?' : "Don't have an account?",
        hasAccount: language === 'tr' ? 'Zaten hesabınız var mı?' : 'Already have an account?',
        signingIn: language === 'tr' ? 'Giriş yapılıyor...' : 'Signing in...',
        registering: language === 'tr' ? 'Kayıt yapılıyor...' : 'Registering...',
        generalDentist: language === 'tr' ? 'Genel Diş Hekimi' : 'General Dentist'
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register({
                    email,
                    password,
                    name,
                    title,
                    specialty: specialty || labels.generalDentist,
                    clinicName
                });
            }
            onLoginSuccess();
        } catch (err: any) {
            setError(err.message);
            // Debug for Android
            if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
                alert(`Debug Error:\nURL: ${import.meta.env.VITE_API_URL || 'FALLBACK_URL'}\nMessage: ${err.message}\nStack: ${err.stack}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 p-4">
            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                        <Stethoscope className="w-8 h-8 text-teal-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">{labels.title}</h1>
                    <p className="text-teal-100 mt-2">{labels.subtitle}</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Tabs */}
                    <div className="flex mb-6 bg-slate-100 rounded-lg p-1">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${isLogin
                                ? 'bg-white text-teal-600 shadow'
                                : 'text-slate-600 hover:text-slate-800'
                                }`}
                        >
                            {labels.login}
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${!isLogin
                                ? 'bg-white text-teal-600 shadow'
                                : 'text-slate-600 hover:text-slate-800'
                                }`}
                        >
                            {labels.register}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Register-only fields */}
                        {!isLogin && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {labels.name}
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required={!isLogin}
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            placeholder="Dr. John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            {labels.titleLabel}
                                        </label>
                                        <select
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        >
                                            <option value="Dt.">Dt.</option>
                                            <option value="Dr.">Dr.</option>
                                            <option value="Prof. Dr.">Prof. Dr.</option>
                                            <option value="Doç. Dr.">Doç. Dr.</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            {labels.specialty}
                                        </label>
                                        <input
                                            type="text"
                                            value={specialty}
                                            onChange={(e) => setSpecialty(e.target.value)}
                                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                                            placeholder={labels.generalDentist}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {labels.clinicName}
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={clinicName}
                                            onChange={(e) => setClinicName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                                            placeholder="DentaVision Clinic"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {labels.email}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    placeholder="doctor@clinic.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {labels.password}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-12 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                            {isLoading
                                ? (isLogin ? labels.signingIn : labels.registering)
                                : (isLogin ? labels.login : labels.register)
                            }
                        </button>
                    </form>

                    {/* Toggle Login/Register */}
                    <p className="mt-6 text-center text-sm text-slate-600">
                        {isLogin ? labels.noAccount : labels.hasAccount}{' '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-teal-600 font-medium hover:text-teal-700"
                        >
                            {isLogin ? labels.register : labels.login}
                        </button>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-teal-100 text-sm mt-6">
                    © 2026 DentaVision AI - AI-Powered Dental Assistant (v2.1 Mobile)
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
