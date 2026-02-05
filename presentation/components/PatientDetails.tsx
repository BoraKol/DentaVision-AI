import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Image as ImageIcon, FileText, Activity, Pill, Check, Clock, Wallet } from 'lucide-react';
import PhotoGallery from './PhotoGallery';
import { useLanguage } from '../context/LanguageContext';
import { useTreatment } from '../context/TreatmentContext';
import { PrescriptionProvider } from '../context/PrescriptionContext';
import { FinancialProvider } from '../context/FinancialContext';
import PrescriptionList from './PrescriptionList';
import PatientFinancials from './PatientFinancials';

interface PatientDetailsProps {
    patient: any;
    onBack: () => void;
}

const PatientDetails: React.FC<PatientDetailsProps> = ({ patient, onBack }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'treatment' | 'recipes' | 'financial'>('treatment');
    const { t } = useLanguage();
    const { items, loading, fetchTreatments, updateItemStatus } = useTreatment();
    const patientId = patient.id || patient._id;

    useEffect(() => {
        if (activeTab === 'treatment' && patientId) {
            fetchTreatments(patientId);
        }
    }, [activeTab, patientId, fetchTreatments]);

    const tabs = [
        { id: 'info', label: 'Genel Bilgiler', icon: User },
        { id: 'photos', label: 'Fotoğraf Galerisi', icon: ImageIcon },
        { id: 'treatment', label: 'Tedavi Geçmişi', icon: Activity },
        { id: 'recipes', label: t('app.recipes'), icon: Pill },
        { id: 'financial', label: 'Finansal Durum', icon: Wallet },
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{patient.name}</h1>
                        <p className="text-sm text-slate-500">
                            {patient.age} yaş, {patient.gender?.toLowerCase() === 'male' ? 'Erkek' : 'Kadın'} • {patient.phone}
                        </p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 text-sm font-medium rounded-full border border-teal-100">
                    Aktif Hasta
                </span>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-6 border-b border-slate-200 bg-white">
                <div className="flex gap-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-all ${activeTab === tab.id
                                ? 'border-teal-600 text-teal-600 font-medium'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-7xl mx-auto">
                    {activeTab === 'info' && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-in fade-in zoom-in duration-300">
                            <h3 className="text-lg font-semibold mb-4">Hasta Bilgileri</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-slate-400 font-medium uppercase">Şikayet</label>
                                        <p className="text-slate-700">{patient.symptoms || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 font-medium uppercase">Özgeçmiş</label>
                                        <p className="text-slate-700">{patient.history || '-'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-slate-400 font-medium uppercase">Alışkanlıklar</label>
                                        <p className="text-slate-700">{patient.habits || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 font-medium uppercase">İletişim</label>
                                        <p className="text-slate-700">{patient.email || '-'}</p>
                                        <p className="text-slate-700">{patient.phone || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'photos' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <PhotoGallery patientId={patientId} />
                        </div>
                    )}

                    {activeTab === 'treatment' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
                                <h3 className="font-semibold text-slate-800">Tedavi Zaman Çizelgesi</h3>
                                <div className="flex gap-4 text-xs">
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /> Tamamlandı</div>
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> Devam Ediyor</div>
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-300" /> Beklemede</div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
                                </div>
                            ) : items.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
                                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">Bu hasta için henüz tedavi kaydı bulunmuyor.</p>
                                </div>
                            ) : (
                                <div className="relative border-l-2 border-slate-200 ml-4 pl-8 space-y-8">
                                    {items.map((item) => (
                                        <div key={item.id} className="relative group">
                                            <div className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${item.status === 'completed' ? 'bg-green-500' :
                                                item.status === 'in_progress' ? 'bg-amber-500' : 'bg-slate-300'
                                                }`}>
                                                {item.status === 'completed' ? <Check className="w-3 h-3 text-white" /> : <Clock className="w-3 h-3 text-white" />}
                                            </div>

                                            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:border-teal-200 transition-colors group-hover:shadow-md">
                                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">
                                                            {item.toothNumber || 'Genel'}
                                                        </span>
                                                        <h4 className="font-bold text-slate-800 text-lg">{item.procedureName}</h4>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-mono font-medium text-slate-500">
                                                            {new Date((item as any).date || (item as any).createdAt).toLocaleDateString('tr-TR')}
                                                        </span>
                                                        <select
                                                            value={item.status}
                                                            onChange={(e) => updateItemStatus(item.id, e.target.value)}
                                                            className={`text-xs font-bold px-2 py-1 rounded-full border-0 ring-1 ring-inset ${item.status === 'completed' ? 'bg-green-50 ring-green-200 text-green-700' :
                                                                item.status === 'in_progress' ? 'bg-amber-50 ring-amber-200 text-amber-700' :
                                                                    'bg-slate-50 ring-slate-200 text-slate-600'
                                                                }`}
                                                        >
                                                            <option value="pending">Beklemede</option>
                                                            <option value="in_progress">Devam Ediyor</option>
                                                            <option value="completed">Tamamlandı</option>
                                                            <option value="cancelled">İptal</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                {item.notes && <p className="text-slate-600 text-sm mb-3 italic">"{item.notes}"</p>}
                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                                                    <div className="flex gap-2 text-xs font-medium text-slate-400 capitalize">
                                                        <span>Faz: {item.phase}</span>
                                                    </div>
                                                    {item.cost && (
                                                        <div className="text-slate-800 font-bold">
                                                            ₺{item.cost.toLocaleString('tr-TR')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'recipes' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <PrescriptionProvider>
                                <PrescriptionList patientId={patientId} />
                            </PrescriptionProvider>
                        </div>
                    )}

                    {activeTab === 'financial' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <FinancialProvider>
                                <PatientFinancials patientId={patientId} />
                            </FinancialProvider>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientDetails;
