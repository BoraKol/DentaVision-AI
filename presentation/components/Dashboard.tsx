import React, { useEffect, useState, useMemo } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useAppointment } from '../context/AppointmentContext';
import { Clock, Calendar, Sparkles, Briefcase, AlertCircle } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

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

    // Update greeting when language changes or every minute
    useEffect(() => {
        const updateGreeting = () => {
            setGreeting(getTimeBasedGreeting(t));
        };

        updateGreeting();
        const interval = setInterval(updateGreeting, 60000); // Update every minute

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
            <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl p-6 md:p-8 text-white shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{greeting}, {user.title} {user.name}</h1>
                        <p className="text-teal-100 opacity-90">{today}</p>
                    </div>
                    {user.avatarUrl && (
                        <div className="hidden sm:block w-16 h-16 rounded-full border-4 border-white/20 overflow-hidden shadow-sm">
                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                {status === 'SUCCESS' && briefing && (
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center text-xs bg-teal-700/30 px-3 py-1.5 rounded-lg border border-teal-500/30">
                            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                            {language === 'tr' ? 'AI Brifingi Önbellekten Yüklendi' : 'AI Briefing Loaded from Cache'}
                        </div>
                        <button
                            onClick={() => fetchBriefing(true, getTodaysAppointments())}
                            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors border border-white/20 font-medium"
                        >
                            {language === 'tr' ? 'Yeniden Oluştur' : 'Regenerate'}
                        </button>
                    </div>
                )}
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Briefing Card */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-teal-600" />
                            {t('dashboard.todaySchedule')}
                        </h2>
                    </div>

                    {status === 'SUCCESS' && briefing ? (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border-l-4 border-teal-500 italic">
                                "{briefing?.summary?.replace(/^(Günaydın|İyi Günler|İyi Akşamlar|İyi Geceler)[!,.]?\s*/i, '') || ''}"
                            </p>
                            <div className="divide-y divide-slate-100">
                                {(briefing?.patients || []).map((patient: any, idx: number) => (
                                    <div key={idx} className="py-4 flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-900">{patient.time}</span>
                                                <span className="text-slate-900 font-bold">{patient.name}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1 break-words">{patient.procedure}</p>
                                            <div className="flex gap-2 mt-2">
                                                {(patient?.required_supplies || []).map((supply: string, i: number) => (
                                                    <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                                        {supply}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${patient.urgency === 5 ? 'bg-red-100 text-red-700' :
                                            patient.urgency >= 3 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {t('dashboard.urgency')}: {patient.urgency}
                                        </div>
                                    </div>
                                ))}
                                {(!briefing?.patients || briefing.patients.length === 0) && (
                                    <div className="py-8 text-center text-slate-400 italic">
                                        {t('dashboard.noPatientsToday')}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : status === 'LOADING' ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-20 bg-slate-100 rounded-lg"></div>
                            <div className="h-16 bg-slate-100 rounded-lg"></div>
                            <div className="h-16 bg-slate-100 rounded-lg"></div>
                        </div>
                    ) : null}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">{t('dashboard.quickActions')}</h2>
                    <div className="space-y-3">
                        <button
                            onClick={() => onViewChange('INTAKE' as any)}
                            className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition-all text-left group"
                        >
                            <span className="font-medium text-slate-700 group-hover:text-teal-700">{t('dashboard.newPatientEntry')}</span>
                            <Clock className="w-4 h-4 text-slate-400 group-hover:text-teal-500" />
                        </button>
                        <button
                            onClick={() => onViewChange('IMAGING' as any)}
                            className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition-all text-left group"
                        >
                            <span className="font-medium text-slate-700 group-hover:text-teal-700">{t('dashboard.uploadXray')}</span>
                            <AlertCircle className="w-4 h-4 text-slate-400 group-hover:text-teal-500" />
                        </button>
                        <button
                            onClick={() => onViewChange('TREATMENT' as any)}
                            className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition-all text-left group"
                        >
                            <span className="font-medium text-slate-700 group-hover:text-teal-700">{t('dashboard.treatmentPlan')}</span>
                            <Briefcase className="w-4 h-4 text-slate-400 group-hover:text-teal-500" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

const Dashboard: React.FC<DashboardProps> = (props) => (
    <ErrorBoundary>
        <DashboardContent {...props} />
    </ErrorBoundary>
);

export default Dashboard;

