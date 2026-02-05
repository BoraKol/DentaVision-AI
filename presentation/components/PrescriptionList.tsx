import React, { useState, useEffect } from 'react';
import {
    Plus, Trash2, Pill, Calendar,
    FileText, Sparkles, ChevronDown,
    ChevronUp, Download, Printer, X, AlertTriangle
} from 'lucide-react';
import { usePrescription, Drug } from '../context/PrescriptionContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { usePrescriptionAI } from '../hooks/usePrescriptionAI';
import { usePatient } from '../context/PatientContext';
import { useTreatment } from '../context/TreatmentContext';

interface PrescriptionListProps {
    patientId: string;
}

const PrescriptionList: React.FC<PrescriptionListProps> = ({ patientId }) => {
    const { prescriptions, loading, fetchPrescriptions, addPrescription, deletePrescription } = usePrescription();
    const { language } = useLanguage();
    const { addToast } = useToast();
    const { getPatientById } = usePatient();
    const { items: treatments } = useTreatment();
    const { suggestPrescription, loading: aiLoading } = usePrescriptionAI();

    const [isCreating, setIsCreating] = useState(false);
    const [expandedPrescription, setExpandedPrescription] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // Form state
    const [newDrugs, setNewDrugs] = useState<Drug[]>([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (patientId) {
            fetchPrescriptions(patientId);
        }
    }, [patientId, fetchPrescriptions]);

    const handleAISuggestion = async () => {
        const patient = getPatientById(patientId);
        const symptoms = patient?.symptoms || '';
        const latestTreatment = treatments.length > 0 ? treatments[0].procedureName : '';

        if (!symptoms && !latestTreatment) {
            addToast(language === 'tr' ? 'Öneri için hasta şikayeti veya tedavi kaydı bulunamadı.' : 'No patient symptoms or treatment records found for suggestion.', 'warning');
            return;
        }

        try {
            addToast(language === 'tr' ? 'AI Reçetesi hazırlanıyor...' : 'AI Prescription being prepared...', 'info');
            const suggestion = await suggestPrescription(symptoms, latestTreatment);

            if (suggestion && suggestion.drugs && suggestion.drugs.length > 0) {
                setNewDrugs(suggestion.drugs);
                setNotes(suggestion.notes || '');
                addToast(language === 'tr' ? 'AI önerileri başarıyla yüklendi.' : 'AI suggestions loaded successfully.', 'success');
            } else {
                addToast(language === 'tr' ? 'AI uygun bir reçete öneremedi.' : 'AI could not suggest a suitable prescription.', 'warning');
            }
        } catch (error) {
            console.error('AI Suggestion failed:', error);
            addToast(language === 'tr' ? 'AI önerisi alınamadı.' : 'Failed to get AI suggestion.', 'error');
        }
    };

    const handleAddDrugRow = () => {
        setNewDrugs([...newDrugs, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    };

    const handleRemoveDrugRow = (index: number) => {
        setNewDrugs(newDrugs.filter((_, i) => i !== index));
    };

    const handleDrugChange = (index: number, field: keyof Drug, value: string) => {
        const updated = [...newDrugs];
        updated[index] = { ...updated[index], [field]: value };
        setNewDrugs(updated);
    };

    const handleSavePrescription = async () => {
        const validDrugs = newDrugs.filter(d => d.name && d.dosage);
        if (validDrugs.length === 0) {
            addToast(language === 'tr' ? 'Lütfen en az bir ilaç ekleyin.' : 'Please add at least one drug.', 'warning');
            return;
        }

        try {
            await addPrescription({
                patientId,
                drugs: validDrugs,
                notes
            });
            addToast(language === 'tr' ? 'Reçete başarıyla oluşturuldu.' : 'Prescription created successfully.', 'success');
            setIsCreating(false);
            setNewDrugs([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
            setNotes('');
        } catch (error) {
            addToast(language === 'tr' ? 'Reçete kaydedilemedi.' : 'Failed to save prescription.', 'error');
        }
    };

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;
        try {
            await deletePrescription(confirmDeleteId);
            addToast(language === 'tr' ? 'Reçete silindi.' : 'Prescription deleted.', 'info');
            setConfirmDeleteId(null);
        } catch (error) {
            addToast(language === 'tr' ? 'Silme işlemi başarısız.' : 'Delete failed.', 'error');
        }
    };

    const handlePrint = (p: any) => {
        const patient = getPatientById(patientId);
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const drugsHtml = p.drugs.map((d: any) => `
            <div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                <div style="font-size: 18px; font-weight: bold;">${d.name} <span style="font-size: 14px; color: #666;">(${d.dosage})</span></div>
                <div style="margin-top: 5px; font-size: 14px;">
                    <strong>Frekans:</strong> ${d.frequency} | <strong>Süre:</strong> ${d.duration}
                </div>
                <div style="margin-top: 5px; font-style: italic; color: #444;">${d.instructions}</div>
            </div>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Reçete - ${patient?.name}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                        .header { text-align: center; border-bottom: 2px solid #2d3748; padding-bottom: 20px; margin-bottom: 30px; }
                        .clinic-name { font-size: 24px; font-weight: bold; color: #0d9488; margin-bottom: 5px; }
                        .patient-info { display: flex; justify-content: space-between; margin-bottom: 30px; padding: 15px; background: #f8fafc; border-radius: 8px; }
                        .footer { margin-top: 50px; text-align: right; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="clinic-name">DentaVision AI</div>
                        <div>Dijital Diş Hekimliği Çözümleri</div>
                    </div>
                    <div class="patient-info">
                        <div>
                            <strong>Hasta:</strong> ${patient?.name}<br>
                            <strong>Yaş:</strong> ${patient?.age}
                        </div>
                        <div style="text-align: right;">
                            <strong>Tarih:</strong> ${p.date.toLocaleDateString('tr-TR')}<br>
                            <strong>Reçete No:</strong> #${p.id.slice(-6).toUpperCase()}
                        </div>
                    </div>
                    <h3 style="color: #2d3748; border-bottom: 1px solid #2d3748; padding-bottom: 5px;">RX - İlaç Listesi</h3>
                    ${drugsHtml}
                    ${p.notes ? `
                        <div style="margin-top: 30px;">
                            <strong>Notlar:</strong><br>
                            <p style="white-space: pre-wrap;">${p.notes}</p>
                        </div>
                    ` : ''}
                    <div class="footer">
                        Bu belge elektronik ortamda oluşturulmuştur.<br>
                        ${new Date().toLocaleString('tr-TR')}
                    </div>
                    <script>
                        window.onload = function() { window.print(); };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="space-y-6 relative">
            {/* Delete Confirmation Modal */}
            {confirmDeleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                        <div className="p-6">
                            <div className="flex items-center gap-3 text-red-600 mb-4">
                                <div className="bg-red-50 p-2 rounded-full">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg font-bold">
                                    {language === 'tr' ? 'Reçeteyi Sil' : 'Delete Prescription'}
                                </h4>
                            </div>
                            <p className="text-slate-600">
                                {language === 'tr' ? 'Bu reçeteyi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.' : 'Are you sure you want to permanently delete this prescription? This action cannot be undone.'}
                            </p>
                        </div>
                        <div className="bg-slate-50 p-4 px-6 flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                {language === 'tr' ? 'Vazgeç' : 'Cancel'}
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md shadow-red-100 transition-all"
                            >
                                {language === 'tr' ? 'Evet, Sil' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-teal-600" />
                    {language === 'tr' ? 'Hasta Reçeteleri' : 'Patient Prescriptions'}
                </h3>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-sm font-medium ${isCreating
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                        }`}
                >
                    {isCreating ? (language === 'tr' ? 'Vazgeç' : 'Cancel') : (
                        <>
                            <Plus className="w-4 h-4" />
                            {language === 'tr' ? 'Yeni Reçete' : 'New Prescription'}
                        </>
                    )}
                </button>
            </div>

            {/* Create Prescription Form */}
            {isCreating && (
                <div className="bg-white p-6 rounded-xl border-2 border-teal-100 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-slate-700 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-teal-500" />
                            {language === 'tr' ? 'Reçete Detayları' : 'Prescription Details'}
                        </h4>
                        <button
                            className="flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors border border-purple-100 disabled:opacity-50"
                            onClick={handleAISuggestion}
                            disabled={aiLoading}
                        >
                            <Sparkles className={`w-3 h-3 ${aiLoading ? 'animate-pulse' : ''}`} />
                            {aiLoading ? (language === 'tr' ? 'Düşünüyor...' : 'Thinking...') : (language === 'tr' ? 'AI İle Öner' : 'Suggest with AI')}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {newDrugs.map((drug, idx) => (
                            <div key={idx} className="flex gap-3 group relative pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
                                    <input
                                        placeholder={language === 'tr' ? 'İlaç Adı' : 'Drug Name'}
                                        className="bg-slate-50 border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                        value={drug.name}
                                        onChange={(e) => handleDrugChange(idx, 'name', e.target.value)}
                                    />
                                    <input
                                        placeholder={language === 'tr' ? 'Doz (örn: 500mg)' : 'Dosage (e.g., 500mg)'}
                                        className="bg-slate-50 border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                        value={drug.dosage}
                                        onChange={(e) => handleDrugChange(idx, 'dosage', e.target.value)}
                                    />
                                    <input
                                        placeholder={language === 'tr' ? 'Frekans (örn: 2x1)' : 'Frequency (e.g., 2x1)'}
                                        className="bg-slate-50 border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                        value={drug.frequency}
                                        onChange={(e) => handleDrugChange(idx, 'frequency', e.target.value)}
                                    />
                                    <input
                                        placeholder={language === 'tr' ? 'Süre (örn: 5 gün)' : 'Duration (e.g., 5 days)'}
                                        className="bg-slate-50 border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                        value={drug.duration}
                                        onChange={(e) => handleDrugChange(idx, 'duration', e.target.value)}
                                    />
                                    <input
                                        placeholder={language === 'tr' ? 'Talimat (örn: Tok karnına)' : 'Instructions (e.g., After meals)'}
                                        className="bg-slate-50 border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none md:col-span-4"
                                        value={drug.instructions}
                                        onChange={(e) => handleDrugChange(idx, 'instructions', e.target.value)}
                                    />
                                </div>
                                {newDrugs.length > 1 && (
                                    <button
                                        onClick={() => handleRemoveDrugRow(idx)}
                                        className="text-slate-300 hover:text-red-500 transition-colors pt-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleAddDrugRow}
                        className="mt-4 text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" />
                        {language === 'tr' ? 'İlaç Ekle' : 'Add Drug'}
                    </button>

                    <div className="mt-6">
                        <textarea
                            placeholder={language === 'tr' ? 'Ek Notlar...' : 'Additional Notes...'}
                            className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none min-h-[80px]"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="px-4 py-2 text-slate-500 font-medium text-sm hover:bg-slate-50 rounded-lg"
                        >
                            {language === 'tr' ? 'İptal' : 'Cancel'}
                        </button>
                        <button
                            onClick={handleSavePrescription}
                            className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-teal-700 transition-all"
                        >
                            {language === 'tr' ? 'Reçeteyi Kaydet' : 'Save Prescription'}
                        </button>
                    </div>
                </div>
            )}

            {/* Prescriptions List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
                    </div>
                ) : prescriptions.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                        <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h4 className="text-slate-400 font-medium">
                            {language === 'tr' ? 'Henüz reçete kaydı bulunmuyor.' : 'No prescriptions recorded yet.'}
                        </h4>
                    </div>
                ) : (
                    prescriptions.map(p => (
                        <div key={p.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:border-teal-200 transition-colors">
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                                onClick={() => setExpandedPrescription(expandedPrescription === p.id ? null : p.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-teal-50 p-2 rounded-lg">
                                        <Calendar className="w-4 h-4 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">
                                            {p.date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {p.drugs.length} {language === 'tr' ? 'adet ilaç' : 'drugs'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handlePrint(p); }}
                                        className="p-2 text-slate-400 hover:text-teal-600 transition-colors"
                                        title={language === 'tr' ? 'Yazdır / İndir' : 'Print / Download'}
                                    >
                                        <Printer className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id); }}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    {expandedPrescription === p.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                </div>
                            </div>

                            {expandedPrescription === p.id && (
                                <div className="px-4 pb-4 pt-1 border-t border-slate-50 bg-slate-50/30 animate-in slide-in-from-top-2 duration-200">
                                    <div className="space-y-3 mt-3">
                                        {p.drugs.map((drug, dIdx) => (
                                            <div key={dIdx} className="bg-white p-3 rounded-lg border border-slate-100 flex items-start gap-3">
                                                <div className="mt-1">
                                                    <Pill className="w-4 h-4 text-teal-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <span className="font-bold text-slate-700">{drug.name}</span>
                                                        <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                                                            {drug.dosage}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-4 mt-1 text-xs text-slate-500">
                                                        <span><strong>{language === 'tr' ? 'Frekans:' : 'Freq:'}</strong> {drug.frequency}</span>
                                                        <span><strong>{language === 'tr' ? 'Süre:' : 'Duration:'}</strong> {drug.duration}</span>
                                                    </div>
                                                    {drug.instructions && (
                                                        <p className="text-xs text-slate-400 mt-2 italic">
                                                            {drug.instructions}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {p.notes && (
                                        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800">
                                            <strong>{language === 'tr' ? 'Notlar:' : 'Notes:'}</strong> {p.notes}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PrescriptionList;
