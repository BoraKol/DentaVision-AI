import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { portalAPI } from '../../../infrastructure/services/ApiService';
import { useToast } from '../../context/ToastContext';
import { LogOut, User, FileText, Activity, Calendar, Clock } from 'lucide-react';
import Odontogram from '../../components/odontogram/Odontogram';

const PatientDashboard: React.FC = () => {
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'xrays' | 'analysis' | 'plan' | 'appointment'>('plan');
    const navigate = useNavigate();
    const { addToast } = useToast();

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const token = localStorage.getItem('patientToken');
                if (!token) {
                    navigate('/portal/login');
                    return;
                }

                // Ensure headers are set if needed, though interceptor should handle it if token is in localStorage
                // But for portal, we might be storing it differently or need to be explicit
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                const res = await api.get('/portal/me', config);
                if (res.data.success) {
                    setPatient(res.data.data);
                }
            } catch (err) {
                console.error(err);
                navigate('/portal/login');
            } finally {
                setLoading(false);
            }
        };

        fetchPatientData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('patientToken');
        localStorage.removeItem('patientUser');
        navigate('/portal/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-800 text-lg leading-tight">{patient?.name}</h1>
                            <p className="text-xs text-slate-500">{patient?.clinicName}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Mobile Tabs */}
            <div className="max-w-4xl mx-auto p-4">
                <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-6 sticky top-20 z-20 overflow-x-auto">
                    <TabButton
                        active={activeTab === 'plan'}
                        onClick={() => setActiveTab('plan')}
                        icon={<FileText className="w-4 h-4" />}
                        label="Tedavi Planı"
                    />
                    <TabButton
                        active={activeTab === 'xrays'}
                        onClick={() => setActiveTab('xrays')}
                        icon={<Activity className="w-4 h-4" />}
                        label="Röntgenler"
                    />
                    <TabButton
                        active={activeTab === 'analysis'}
                        onClick={() => setActiveTab('analysis')}
                        icon={<Activity className="w-4 h-4" />}
                        label="AI Analiz"
                    />
                    <TabButton
                        active={activeTab === 'appointment'}
                        onClick={() => setActiveTab('appointment')}
                        icon={<Calendar className="w-4 h-4" />}
                        label="Yeni Randevu"
                    />
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {activeTab === 'plan' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 animate-in fade-in">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-slate-800">Tedavi Planım</h2>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Aktif</span>
                            </div>

                            <div className="mb-6 overflow-x-auto">
                                <div className="min-w-[300px] scale-90 origin-top-left md:scale-100">
                                    <Odontogram patientId={patient?._id} readOnly={true} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm text-slate-500 italic text-center">
                                    Detaylı tedavi planınız için lütfen hekiminize danışın.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'xrays' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                            {patient?.analyses?.map((analysis: any) => (
                                <div key={analysis._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <img
                                        src={analysis.imageUrl}
                                        alt="X-Ray"
                                        className="w-full h-48 object-cover bg-black"
                                    />
                                    <div className="p-3">
                                        <p className="text-sm font-medium text-slate-700">
                                            {new Date(analysis.createdAt).toLocaleDateString('tr-TR')}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Panoramik Röntgen
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {(!patient?.analyses || patient.analyses.length === 0) && (
                                <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Henüz kayıtlı röntgen bulunmuyor.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="space-y-4 animate-in fade-in">
                            {patient?.analyses && patient.analyses.length > 0 ? (
                                <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Yapay Zeka Raporu</h3>
                                            <p className="text-indigo-100 text-sm mb-4">
                                                Diş sağlığınızın yapay zeka destekli detaylı analizi.
                                            </p>
                                        </div>
                                        <Activity className="w-8 h-8 text-indigo-200" />
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                                        <p className="text-sm">
                                            Genel Ağız Sağlığı Skoru: <span className="font-bold text-xl ml-1">85/100</span>
                                            <span className="block text-xs opacity-70 mt-1">(Temsili Skor)</span>
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            {(!patient?.analyses || patient.analyses.length === 0) && (
                                <div className="py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                                    <p>Henüz analiz raporu oluşturulmamış.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'appointment' && (
                        <AppointmentBookingTab />
                    )}
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${active
            ? 'bg-teal-600 text-white shadow-md'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
    >
        {icon}
        {label}
    </button>
);

const AppointmentBookingTab = () => {
    const [date, setDate] = useState('');
    const [slots, setSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [procedure, setProcedure] = useState('');
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [booking, setBooking] = useState(false);
    const { addToast } = useToast();

    // Set min date to tomorrow
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const minDateStr = minDate.toISOString().split('T')[0];

    useEffect(() => {
        if (date) {
            fetchSlots(date);
        } else {
            setSlots([]);
        }
    }, [date]);

    const fetchSlots = async (selectedDate: string) => {
        setLoadingSlots(true);
        setSelectedSlot(null);
        try {
            const res = await portalAPI.getAvailableSlots(selectedDate);
            if (res.data.success) {
                setSlots(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
            addToast('Müsait saatler alınamadı', 'error');
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleBook = async () => {
        if (!date || !selectedSlot) return;

        setBooking(true);
        try {
            const res = await portalAPI.bookAppointment({
                date,
                time: selectedSlot,
                procedure: procedure || 'Genel Muayene',
                notes: 'Portal üzerinden online randevu'
            });

            if (res.data.success) {
                addToast('Randevunuz başarıyla oluşturuldu! SMS ile bilgilendirileceksiniz.', 'success');
                // Reset form
                setDate('');
                setSlots([]);
                setSelectedSlot(null);
                setProcedure('');
            }
        } catch (error: any) {
            console.error('Booking error:', error);
            addToast(error.response?.data?.message || 'Randevu oluşturulamadı', 'error');
        } finally {
            setBooking(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-teal-600" />
                Yeni Randevu Oluştur
            </h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tarih Seçin</label>
                    <input
                        type="date"
                        min={minDateStr}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                </div>

                {date && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Saat Seçin</label>
                        {loadingSlots ? (
                            <div className="flex justify-center py-8">
                                <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : slots.length > 0 ? (
                            <div className="grid grid-cols-4 gap-3">
                                {slots.map(slot => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${selectedSlot === slot
                                            ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-300'
                                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                                            }`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                                <p>Seçilen tarihte müsait randevu bulunmamaktadır.</p>
                            </div>
                        )}
                    </div>
                )}

                {selectedSlot && (
                    <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                        <label className="block text-sm font-medium text-slate-700 mb-2">İşlem / Şikayetiniz (Opsiyonel)</label>
                        <textarea
                            value={procedure}
                            onChange={(e) => setProcedure(e.target.value)}
                            placeholder="Örn: Diş ağrısı, Dolgu, Kontrol..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            rows={3}
                        />

                        <button
                            onClick={handleBook}
                            disabled={booking}
                            className={`w-full mt-6 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${booking ? 'bg-slate-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:shadow-xl'
                                }`}
                        >
                            {booking ? 'İşleniyor...' : 'Randevuyu Onayla'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientDashboard;
