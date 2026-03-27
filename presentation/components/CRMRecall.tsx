import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, Phone, Send, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, Users, TrendingUp } from 'lucide-react';
import api from '../../infrastructure/services/ApiService';
import { useToast } from '../context/ToastContext';

interface RecallCandidate {
    patientId: string;
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    lastTreatmentDate: string;
    lastProcedure: string;
    totalTreatments: number;
    daysSinceLastVisit: number;
}

interface RecallStats {
    pending: number;
    contacted: number;
    appointment_booked: number;
    no_response: number;
    declined: number;
    total: number;
}

const CRMRecall: React.FC = () => {
    const [candidates, setCandidates] = useState<RecallCandidate[]>([]);
    const [stats, setStats] = useState<RecallStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [sendingTo, setSendingTo] = useState<string | null>(null);
    const [thresholdDays, setThresholdDays] = useState(180);
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [candidatesRes, statsRes] = await Promise.all([
                api.get(`/recall/candidates?days=${thresholdDays}`),
                api.get('/recall/stats')
            ]);
            setCandidates(candidatesRes.data || []);
            setStats(statsRes.data || null);
        } catch (err) {
            console.error('CRM Recall fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [thresholdDays]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSendReminder = async (candidate: RecallCandidate) => {
        setSendingTo(candidate.patientId);
        try {
            const res = await api.post('/recall/send-reminder', {
                patientId: candidate.patientId,
                phone: candidate.patientPhone,
                patientName: candidate.patientName,
                daysSince: candidate.daysSinceLastVisit
            });
            if (res.data.success) {
                addToast(`${candidate.patientName} hastasına hatırlatma gönderildi ✓`, 'success');
                fetchData();
            } else {
                addToast('Mesaj gönderilemedi', 'error');
            }
        } catch (err) {
            addToast('WhatsApp hatırlatma gönderilemedi', 'error');
        } finally {
            setSendingTo(null);
        }
    };

    const getDaysColor = (days: number) => {
        if (days > 365) return 'text-red-600 bg-red-50 border-red-200';
        if (days > 270) return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-amber-600 bg-amber-50 border-amber-200';
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <div className="p-2 bg-violet-100 rounded-xl">
                            <UserCheck className="w-6 h-6 text-violet-600" />
                        </div>
                        Hasta Takip & CRM
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Periyodik kontrol hatırlatmaları ve hasta sadakati yönetimi
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={thresholdDays}
                        onChange={(e) => setThresholdDays(Number(e.target.value))}
                        className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    >
                        <option value={90}>90+ Gün</option>
                        <option value={180}>180+ Gün (6 Ay)</option>
                        <option value={270}>270+ Gün (9 Ay)</option>
                        <option value={365}>365+ Gün (1 Yıl)</option>
                    </select>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                        <RefreshCw className="w-4 h-4" /> Yenile
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatCard icon={Clock} label="Bekleyen" value={stats.pending} color="text-amber-600" bg="bg-amber-50" />
                    <StatCard icon={Phone} label="İletişim Kuruldu" value={stats.contacted} color="text-blue-600" bg="bg-blue-50" />
                    <StatCard icon={CheckCircle} label="Randevu Aldı" value={stats.appointment_booked} color="text-green-600" bg="bg-green-50" />
                    <StatCard icon={AlertCircle} label="Yanıt Yok" value={stats.no_response} color="text-orange-600" bg="bg-orange-50" />
                    <StatCard icon={XCircle} label="Reddetti" value={stats.declined} color="text-red-600" bg="bg-red-50" />
                </div>
            )}

            {/* Candidates Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-violet-500" />
                        Hatırlatma Bekleyen Hastalar
                    </h3>
                    <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                        {candidates.length} hasta
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
                    </div>
                ) : candidates.length === 0 ? (
                    <div className="text-center py-16 px-6">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">Tüm Hastalar Aktif! 🎉</h3>
                        <p className="text-slate-500 text-sm max-w-md mx-auto">
                            Son {thresholdDays} gün içinde tüm hastalarınız en az bir kez kontrol için gelmiş. Harika bir hasta sadakati!
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 text-left">
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Hasta</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Son Tedavi</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Geçen Süre</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Toplam Tedavi</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Aksiyon</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {candidates.map((c) => (
                                    <tr key={c.patientId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                                                    {c.patientName?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{c.patientName}</p>
                                                    <p className="text-xs text-slate-400">{c.patientPhone || 'Telefon yok'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm text-slate-700">{c.lastProcedure}</p>
                                            <p className="text-xs text-slate-400">
                                                {new Date(c.lastTreatmentDate).toLocaleDateString('tr-TR')}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getDaysColor(c.daysSinceLastVisit)}`}>
                                                {c.daysSinceLastVisit} gün
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-medium text-slate-600">{c.totalTreatments}</span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={() => handleSendReminder(c)}
                                                disabled={sendingTo === c.patientId || !c.patientPhone}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
                                                title={!c.patientPhone ? 'Telefon numarası bulunamadı' : 'WhatsApp hatırlatma gönder'}
                                            >
                                                {sendingTo === c.patientId ? (
                                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Send className="w-3.5 h-3.5" />
                                                )}
                                                WhatsApp
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// Small stat card component
const StatCard = ({ icon: Icon, label, value, color, bg }: { icon: React.ElementType; label: string; value: number; color: string; bg: string }) => (
    <div className={`${bg} rounded-xl p-4 border border-slate-100 flex items-center gap-3`}>
        <div className={`p-2 bg-white rounded-lg shadow-sm`}>
            <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
        </div>
    </div>
);

export default CRMRecall;
