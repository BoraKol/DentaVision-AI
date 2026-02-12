import React, { useEffect, useState, useMemo } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useAppointment } from '../context/AppointmentContext';
import { Clock, Calendar, Sparkles, Briefcase, AlertCircle, ArrowUpRight } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';
import GlassCard from './ui/GlassCard';

interface DashboardProps {
    onViewChange: (view: any) => void;
}

// Get Turkey timezone time and determine greeting
const getTimeBasedGreeting = (t: (key: string) => string): string => {
    // Get current time in Turkey timezone (UTC+3)
    const now = new Date();
    const turkeyTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
    const hour = turkeyTime.getHours();

    if (hour >= 5 && hour < 12) {
        return t('dashboard.goodMorning');
    } else if (hour >= 12 && hour < 18) {
        return t('dashboard.goodAfternoon');
    } else if (hour >= 18 && hour < 22) {
        return t('dashboard.goodEvening');
    } else {
        return t('dashboard.goodNight');
    }
};

const DashboardContent: React.FC<DashboardProps> = React.memo(({ onViewChange }) => {
    const { data: briefing, status, error, fetchBriefing } = useDashboard();
    const { user } = useUser();
    const { t, language } = useLanguage();
    const { getTodaysAppointments } = useAppointment();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const appointments = getTodaysAppointments();
        fetchBriefing(false, appointments);
    }, [getTodaysAppointments]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const updateGreeting = () => {
            setGreeting(getTimeBasedGreeting(t));
        };

        updateGreeting();
        const interval = setInterval(updateGreeting, 60000);

        return () => clearInterval(interval);
    }, [t, language]);

    const today = useMemo(() => {
        return new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }, [language]);

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <GlassCard vibrant="teal" hoverable={false} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center space-x-2 mb-2 text-teal-100/80">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">{t('dashboard.aiStatus') || 'AI COMPANION READY'}</span>
                        </div>
                        <h1 className="text-4xl font-extrabold mb-2 tracking-tight">{greeting}, {user.title} {user.name}</h1>
                        <p className="text-teal-50 font-medium opacity-90 text-lg flex items-center">
                            <Calendar className="w-5 h-5 mr-2 opacity-70" />
                            {today}
                        </p>
                    </div>
                    {user.avatarUrl && (
                        <div className="hidden sm:block w-20 h-20 rounded-2xl rotate-3 border-4 border-white/20 overflow-hidden shadow-2xl transition-transform hover:rotate-0">
                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                {status === 'SUCCESS' && briefing && (
                    <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center text-sm bg-black/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 animate-pulse-soft">
                            <Clock className="w-4 h-4 mr-2 text-teal-200" />
                            <span className="font-medium">
                                {language === 'tr' ? 'Bugün ' + (briefing?.patients?.length || 0) + ' randevunuz var' : 'You have ' + (briefing?.patients?.length || 0) + ' appointments today'}
                            </span>
                        </div>
                        <button
                            onClick={() => fetchBriefing(true, getTodaysAppointments())}
                            className="bg-white text-teal-700 hover:bg-teal-50 px-5 py-2 rounded-xl transition-all font-bold shadow-lg flex items-center group"
                        >
                            <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                            {language === 'tr' ? 'AI Analizini Yenile' : 'Refresh AI Analysis'}
                        </button>
                    </div>
                )}
            </GlassCard>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Schedule Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            <Calendar className="w-6 h-6 mr-2 text-teal-600" />
                            {t('dashboard.todaySchedule')}
                        </h2>
                    </div>

                    {status === 'SUCCESS' && briefing ? (
                        <div className="space-y-4">
                            {/* Summary Card */}
                            <div className="glass-effect p-4 rounded-2xl border-l-4 border-teal-500 shadow-sm">
                                <p className="text-slate-700 font-medium leading-relaxed italic">
                                    "{briefing?.summary?.replace(/^(Günaydın|İyi Günler|İyi Akşamlar|İyi Geceler)[!,.]?\s*/i, '') || ''}"
                                </p>
                            </div>

                            {/* Appointment List */}
                            <div className="grid gap-4">
                                {(briefing?.patients || []).map((patient: any, idx: number) => (
                                    <GlassCard key={idx} className="!p-0 overflow-hidden border border-slate-200/50">
                                        <div className="flex flex-col sm:flex-row sm:items-center p-5 gap-4">
                                            <div className="flex-none w-16 h-16 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 flex flex-col items-center justify-center border border-teal-200 shadow-sm">
                                                <span className="text-lg font-bold text-teal-700">{patient.time.split(':')[0]}</span>
                                                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-tighter">{patient.time.split(':')[1]}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-slate-900 text-lg truncate">{patient.name}</h3>
                                                    <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${patient.urgency >= 4 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                        {patient.urgency >= 4 ? 'CRITICAL' : 'ROUTINE'}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-600 font-medium">{patient.procedure}</p>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {(patient?.required_supplies || []).map((supply: string, i: number) => (
                                                        <span key={i} className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-lg border border-slate-200">
                                                            {supply}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button className="flex-none p-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors">
                                                <ArrowUpRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </GlassCard>
                                ))}
                                {(!briefing?.patients || briefing.patients.length === 0) && (
                                    <div className="py-20 text-center glass-card rounded-2xl border-dashed">
                                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 font-medium">{t('dashboard.noPatientsToday')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : status === 'LOADING' ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : null}
                </div>

                {/* Quick Actions Side */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 px-2">{t('dashboard.quickActions')}</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <GlassCard
                            vibrant="none"
                            className="group !p-5 border border-slate-200/50"
                            onClick={() => onViewChange('INTAKE' as any)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">{t('dashboard.newPatientEntry')}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Quickly register new arrivals</p>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard
                            vibrant="none"
                            className="group !p-5 border border-slate-200/50"
                            onClick={() => onViewChange('IMAGING' as any)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600 group-hover:scale-110 transition-transform">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">{t('dashboard.uploadXray')}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">AI-powered imaging analysis</p>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard
                            vibrant="none"
                            className="group !p-5 border border-slate-200/50"
                            onClick={() => onViewChange('TREATMENT' as any)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 group-hover:scale-110 transition-transform">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">{t('dashboard.treatmentPlan')}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Review active treatment paths</p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Pro Tip Card */}
                    <div className="bg-vibrant-indigo rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                        <Sparkles className="absolute -bottom-2 -right-2 w-24 h-24 text-white/10 rotate-12" />
                        <h4 className="font-bold mb-2 flex items-center">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Pro Tip
                        </h4>
                        <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                            Use the AI analysis to identify common patterns in patient treatments this month to optimize inventory orders.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

// ... rest of the file ...

const Dashboard: React.FC<DashboardProps> = (props) => (
    <ErrorBoundary>
        <DashboardContent {...props} />
    </ErrorBoundary>
);

export default Dashboard;

