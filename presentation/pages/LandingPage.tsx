import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Stethoscope,
    ShieldCheck,
    Zap,
    BrainCircuit,
    ChevronRight,
    ArrowRight,
    Sparkles,
    CalendarCheck,
    LineChart,
    Menu,
    X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isTr = language === 'tr';

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-200 selection:text-teal-900">
            {/* Header / Navbar */}
            <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-200/50">
                            <Stethoscope className="w-7 h-7" />
                        </div>
                        <div>
                            <span className="block text-xl font-bold tracking-tight text-slate-800 leading-none">DentaVision</span>
                            <span className="text-sm text-teal-600 font-bold tracking-widest uppercase">AI PLATFORM</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-4">
                            <a href="/portal/login" className="text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors">
                                {isTr ? 'Hasta Portalı' : 'Patient Portal'}
                            </a>
                            <button
                                onClick={() => navigate('/login')}
                                className="text-sm font-semibold text-slate-700 hover:text-teal-600 px-4 py-2 transition-colors"
                            >
                                {isTr ? 'Giriş Yap' : 'Login'}
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-slate-900 hover:bg-teal-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 group"
                            >
                                {isTr ? 'Hemen Başla' : 'Get Started'}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Sidebar/Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
                        <div className="px-4 py-6 flex flex-col gap-4">
                            <a
                                href="/portal/login"
                                className="flex items-center w-full px-4 py-3 text-base font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {isTr ? 'Hasta Portalı' : 'Patient Portal'}
                            </a>
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center w-full px-4 py-3 text-base font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-colors"
                            >
                                {isTr ? 'Giriş Yap' : 'Login'}
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-slate-900 hover:bg-teal-600 text-white text-base font-semibold px-4 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                            >
                                {isTr ? 'Hemen Başla' : 'Get Started'}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-50/50 via-slate-50 to-white -z-10" />
                <div className="absolute top-1/4 right-0 w-96 h-96 bg-teal-400/10 blur-[100px] rounded-full mix-blend-multiply" />
                <div className="absolute bottom-1/4 left-10 w-72 h-72 bg-indigo-400/10 blur-[80px] rounded-full mix-blend-multiply" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100/50 text-teal-700 text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <Sparkles className="w-4 h-4" />
                        <span>{isTr ? 'Yeni Nesil Klinik Asistanı' : 'Next Generation Clinical Assistant'}</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
                        {isTr ? 'Geleceğin Diş Kliniği ' : 'The Future of Dental Clinics '}
                        <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-500">
                            {isTr ? 'Yapay Zeka ile Tanışıyor' : 'Meets Artificial Intelligence'}
                        </span>
                    </h1>

                    <p className="mt-4 max-w-2xl text-lg md:text-xl text-slate-500 mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        {isTr
                            ? 'Hasta kayıtlarından yapay zeka destekli röntgen analizine, stok takibinden akıllı randevu sistemine kadar kliniğinizin tüm ihtiyaçları tek bir platformda.'
                            : 'From patient records to AI-powered x-ray analysis, inventory tracking to smart appointments. All your clinic needs in one platform.'}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-teal-600/20 hover:shadow-teal-600/40 hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            {isTr ? 'Kliniğini Dijitalleştir' : 'Digitize Your Clinic'}
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <button
                            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-lg transition-all border border-slate-200 hover:border-slate-300 flex items-center justify-center gap-2 shadow-sm"
                        >
                            <BrainCircuit className="w-5 h-5 text-indigo-500" />
                            {isTr ? 'AI Demosunu İncele' : 'View AI Demo'}
                        </button>
                    </div>
                </div>

                {/* Dashboard Mockup Showcase */}
                <div className="mt-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative animate-in fade-in slide-in-from-bottom-24 duration-1200 delay-700">
                    <div className="relative rounded-2xl bg-slate-900/5 p-2 ring-1 ring-inset ring-slate-900/10 lg:-m-4 lg:rounded-3xl lg:p-4 shadow-2xl overflow-hidden backdrop-blur-3xl transform perspective-1000 rotate-x-12 scale-95 hover:rotate-x-0 hover:scale-100 transition-all duration-700">
                        {/* Actual Generated App Screenshot */}
                        <div className="bg-slate-100 rounded-xl border border-slate-200/50 shadow-inner overflow-hidden relative">
                            <img
                                src="/dashboard-preview.png"
                                alt="DentaVision AI Dashboard Interface"
                                className="w-full h-auto object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/40 to-transparent p-6 sm:p-10 pointer-events-none">
                                <p className="text-white text-lg sm:text-2xl font-bold tracking-tight shadow-sm drop-shadow-md">
                                    Modern UI / UX ve Akıllı Analiz Paneli
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white border-t border-slate-100 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            {isTr ? 'Her Şey Tek Bir Platformda' : 'Everything in One Platform'}
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                            {isTr
                                ? 'Modern diş hekimliğinin gereksinimi olan tüm modüller entegre ve AI destekli olarak kullanımınıza hazır.'
                                : 'All modules required by modern dentistry are integrated and AI-supported ready for your use.'}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<BrainCircuit className="w-6 h-6 text-indigo-500" />}
                            title={isTr ? "Evidenced-Based AI Analizi" : "Evidenced-Based AI Analysis"}
                            description={isTr
                                ? "Panoramik röntgenleri yapay zeka ile analiz edin. Çürük, kemik kaybı ve implant planlaması saniyeler içinde ekranınızda."
                                : "Analyze panoramic x-rays with AI. Caries, bone loss, and implant planning on your screen in seconds."}
                            color="indigo"
                        />
                        <FeatureCard
                            icon={<CalendarCheck className="w-6 h-6 text-teal-500" />}
                            title={isTr ? "Akıllı Randevu Yönetimi" : "Smart Appointment Management"}
                            description={isTr
                                ? "Sürükle bırak takvim, otomatik SMS hatırlatıcıları ve hasta portalı entegrasyonu ile boşlukları minimize edin."
                                : "Minimize gaps with drag-and-drop calendar, automatic SMS reminders, and patient portal integration."}
                            color="teal"
                        />
                        <FeatureCard
                            icon={<LineChart className="w-6 h-6 text-rose-500" />}
                            title={isTr ? "Finans & Klinik Performansı" : "Finance & Clinic Performance"}
                            description={isTr
                                ? "Gelir-gider tabloları, doktor hak edişleri (komisyon), laboratuvar masrafları ve karlılık analizleri."
                                : "Income-expense tables, doctor commissions, lab expenses, and profitability analysis."}
                            color="rose"
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 border-t border-slate-800 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 text-white">
                        <Stethoscope className="w-6 h-6 text-teal-500" />
                        <span className="text-lg font-bold tracking-tight">DentaVision <span className="text-teal-500">AI</span></span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} DentaVision Platform. B2B HealthTech SaaS.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Gizlilik</a>
                        <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Şartlar</a>
                        <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">İletişim</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: 'indigo' | 'teal' | 'rose' }) => {
    const colorStyles = {
        indigo: 'bg-indigo-50 border-indigo-100 group-hover:border-indigo-300',
        teal: 'bg-teal-50 border-teal-100 group-hover:border-teal-300',
        rose: 'bg-rose-50 border-rose-100 group-hover:border-rose-300',
    };

    return (
        <div className="group p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${colorStyles[color]}`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
                {description}
            </p>
        </div>
    );
};

export default LandingPage;
