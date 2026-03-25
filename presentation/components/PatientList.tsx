import React, { useState, useMemo } from 'react';
import { Search, Plus, User, Trash2, Edit2, FileText, X, Lock, ChevronDown } from 'lucide-react';
import { usePatient } from '../context/PatientContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import ConfirmDialog from './ConfirmDialog';

interface PatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingPatient?: any;
}

const PatientModal: React.FC<PatientModalProps> = React.memo(({ isOpen, onClose, editingPatient }) => {
    const { addPatient, updatePatient } = usePatient();
    const { addToast } = useToast();
    const { t, language } = useLanguage();

    const [formData, setFormData] = useState({
        name: editingPatient?.name || '',
        age: editingPatient?.age || 30,
        gender: editingPatient?.gender || 'male',
        history: editingPatient?.history || '',
        symptoms: editingPatient?.symptoms || '',
        habits: editingPatient?.habits || '',
        phone: editingPatient?.phone || '',
        email: editingPatient?.email || '',
        password: '' // Only for setting new password
    });

    React.useEffect(() => {
        if (editingPatient) {
            setFormData({
                name: editingPatient.name || '',
                age: editingPatient.age || 30,
                gender: editingPatient.gender || 'male',
                history: editingPatient.history || '',
                symptoms: editingPatient.symptoms || '',
                habits: editingPatient.habits || '',
                phone: editingPatient.phone || '',
                email: editingPatient.email || '',
                password: ''
            });
        } else {
            setFormData({
                name: '',
                age: 30,
                gender: 'male',
                history: '',
                symptoms: '',
                habits: '',
                phone: '',
                email: '',
                password: ''
            });
        }
    }, [editingPatient, isOpen]);

    // i18n labels
    const labels = {
        addPatient: language === 'tr' ? 'Yeni Hasta Ekle' : 'Add New Patient',
        editPatient: language === 'tr' ? 'Hasta Düzenle' : 'Edit Patient',
        name: language === 'tr' ? 'Ad Soyad' : 'Full Name',
        age: language === 'tr' ? 'Yaş' : 'Age',
        gender: language === 'tr' ? 'Cinsiyet' : 'Gender',
        male: language === 'tr' ? 'Erkek' : 'Male',
        female: language === 'tr' ? 'Kadın' : 'Female',
        other: language === 'tr' ? 'Diğer' : 'Other',
        phone: language === 'tr' ? 'Telefon' : 'Phone',
        email: language === 'tr' ? 'E-posta' : 'Email',
        history: language === 'tr' ? 'Medikal Geçmiş' : 'Medical History',
        historyPlaceholder: language === 'tr' ? 'Kronik hastalıklar, alerjiler...' : 'Chronic diseases, allergies...',
        symptoms: language === 'tr' ? 'Semptomlar' : 'Symptoms',
        symptomsPlaceholder: language === 'tr' ? 'Mevcut şikayetler...' : 'Current complaints...',
        habits: language === 'tr' ? 'Alışkanlıklar' : 'Habits',
        habitsPlaceholder: language === 'tr' ? 'Sigara, diş sıkma...' : 'Smoking, teeth grinding...',
        cancel: language === 'tr' ? 'İptal' : 'Cancel',
        save: language === 'tr' ? 'Kaydet' : 'Save',
        update: language === 'tr' ? 'Güncelle' : 'Update',
        enterName: language === 'tr' ? 'Lütfen hasta adı girin.' : 'Please enter patient name.',
        patientCreated: language === 'tr' ? 'Hasta kaydı oluşturuldu.' : 'Patient record created.',
        patientUpdated: language === 'tr' ? 'Hasta bilgileri güncellendi.' : 'Patient information updated.',
        password: language === 'tr' ? 'Portal Şifresi' : 'Portal Password',
        passwordPlaceholder: language === 'tr' ? 'Erişim şifresi belirleyin' : 'Set access password'
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            addToast(labels.enterName, 'warning');
            return;
        }

        // Prepare data for API
        const apiData: any = {
            ...formData,
            medicalHistory: formData.history, // Map history to backend field
            // password: only include if not empty
        };

        if (!apiData.password) {
            delete apiData.password;
        }

        // Remove email if empty to avoid validation error
        if (!apiData.email) {
            delete apiData.email;
        }

        // Remove frontend-only fields
        delete apiData.history;

        try {
            if (editingPatient) {
                await updatePatient(editingPatient.id, apiData);
                addToast(labels.patientUpdated, 'success');
            } else {
                await addPatient(apiData);
                addToast(labels.patientCreated, 'success');
            }
            onClose();
        } catch (error: any) {
            console.error("Patient Operation Error:", error);
            const errorMessage = error.response?.data?.message || error.message || (language === 'tr' ? 'İşlem başarısız.' : 'Operation failed.');
            addToast(errorMessage, 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">
                        {editingPatient ? labels.editPatient : labels.addPatient}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Section 1: Personal Information */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-4 py-2.5 bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-slate-200">
                            <h4 className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                {language === 'tr' ? 'Kişisel Bilgiler' : 'Personal Information'}
                            </h4>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {labels.name} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    placeholder={labels.name}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{labels.age}</label>
                                    <input
                                        type="number"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{labels.gender}</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="male">{labels.male}</option>
                                        <option value="female">{labels.female}</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{labels.phone}</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        placeholder="+90 5XX XXX XX XX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{labels.email}</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        placeholder="email@domain.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                                    <Lock className="w-3 h-3 mr-1 text-slate-400" />
                                    {labels.password}
                                </label>
                                <input
                                    type="text"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    placeholder={labels.passwordPlaceholder}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Clinical Information */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" />
                                {language === 'tr' ? 'Klinik Bilgiler' : 'Clinical Information'}
                            </h4>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{labels.history}</label>
                                <textarea
                                    value={formData.history}
                                    onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    placeholder={labels.historyPlaceholder}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{labels.symptoms}</label>
                                <textarea
                                    value={formData.symptoms}
                                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    placeholder={labels.symptomsPlaceholder}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{labels.habits}</label>
                                <textarea
                                    value={formData.habits}
                                    onChange={(e) => setFormData({ ...formData, habits: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    placeholder={labels.habitsPlaceholder}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                        >
                            {labels.cancel}
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200"
                        >
                            {editingPatient ? labels.update : labels.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

PatientModal.displayName = 'PatientModal';

interface PatientListProps {
    onSelectPatient?: (patient: any) => void;
}

const PatientListItem = React.memo<{
    patient: any;
    isSelected: boolean;
    isExpanded: boolean;
    onSelectToggle: () => void;
    onExpandToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
    getGenderLabel: (g: string) => string;
    labels: any;
    language: string;
    t: any;
}>((props) => {
    const { patient, isSelected, isExpanded, onSelectToggle, onExpandToggle, onEdit, onDelete, getGenderLabel, labels, language, t } = props;
    return (
        <div
            className={`bg-white rounded-xl border-2 transition-all duration-200 ${isSelected
                ? 'border-teal-500 shadow-md shadow-teal-500/10'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
        >
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div
                        className="flex items-center space-x-4 cursor-pointer flex-1 min-w-0"
                        onClick={onSelectToggle}
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                            {patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">{patient.name}</h3>
                            <div className="flex items-center space-x-3 text-sm text-slate-500">
                                <span>{patient.age} {labels.yearsOld}</span>
                                <span>•</span>
                                <span>{getGenderLabel(patient.gender)}</span>
                                {patient.userId && (
                                    <>
                                        <span>•</span>
                                        <span className="text-slate-400 text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                                            {language === 'tr' ? 'Ekleyen:' : 'Added by:'} {patient.userId.title} {patient.userId.name}
                                        </span>
                                    </>
                                )}
                                {patient.analysisHistory && patient.analysisHistory.length > 0 && (
                                    <>
                                        <span>•</span>
                                        <span className="text-teal-600">{patient.analysisHistory.length} {labels.analysisCount}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={onEdit}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={labels.edit}
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={labels.delete}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onExpandToggle}
                            className={`p-2 rounded-lg transition-all duration-200 ${isExpanded ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'}`}
                            title={t('common.details') || labels.details}
                        >
                            <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                        {/* Patient Info Grid */}
                        {(patient.history || patient.symptoms || patient.habits) && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {patient.history && (
                                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{labels.history}</span>
                                        <p className="text-sm text-slate-700 mt-1 leading-relaxed">{patient.history}</p>
                                    </div>
                                )}
                                {patient.symptoms && (
                                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{labels.symptoms}</span>
                                        <p className="text-sm text-slate-700 mt-1 leading-relaxed">{patient.symptoms}</p>
                                    </div>
                                )}
                                {patient.habits && (
                                    <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                                            {language === 'tr' ? 'Alışkanlıklar' : 'Habits'}
                                        </span>
                                        <p className="text-sm text-slate-700 mt-1 leading-relaxed">{patient.habits}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Analysis History - Timeline Style */}
                        {patient.analysisHistory && patient.analysisHistory.length > 0 && (
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{labels.analysisHistory}</span>
                                <div className="mt-2 space-y-1.5">
                                    {patient.analysisHistory.slice(-3).map((analysis: any) => {
                                        const isError = analysis.diagnosis?.includes('Hata') || analysis.diagnosis?.includes('Error') || analysis.diagnosis?.includes('Limit');
                                        return (
                                            <div key={analysis.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${isError ? 'bg-red-50 border border-red-100' : 'bg-teal-50 border border-teal-100'}`}>
                                                <div className={`w-2 h-2 rounded-full shrink-0 ${isError ? 'bg-red-400' : 'bg-teal-500'}`} />
                                                <span className="text-slate-400 text-xs font-mono whitespace-nowrap">
                                                    {analysis && analysis.date
                                                        ? new Date(analysis.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })
                                                        : '—'}
                                                </span>
                                                <span className={`font-medium truncate ${isError ? 'text-red-600' : 'text-slate-700'}`}>
                                                    {analysis.diagnosis}
                                                </span>
                                                {isError && (
                                                    <span className="ml-auto text-[10px] font-bold text-red-400 bg-red-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                        {language === 'tr' ? 'Hata' : 'Error'}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Footer timestamps */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                            <span>{labels.registered}: {new Date(patient.createdAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            <span>•</span>
                            <span>{labels.lastUpdate}: {new Date(patient.updatedAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

const PatientList: React.FC<PatientListProps> = ({ onSelectPatient }) => {
    const { patients, deletePatient, selectPatient, selectedPatient } = usePatient();
    const { addToast } = useToast();
    const { t, language } = useLanguage();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<any>(null);
    const [expandedPatient, setExpandedPatient] = useState<string | null>(null);

    // Confirm Dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<{ id: string; name: string } | null>(null);

    // i18n labels - Memoized
    const labels = useMemo(() => ({
        title: language === 'tr' ? 'Hasta Kayıtları' : 'Patient Records',
        subtitle: language === 'tr' ? 'Kayıtlı hastalarınızı yönetin.' : 'Manage your registered patients.',
        newPatient: language === 'tr' ? 'Yeni Hasta' : 'New Patient',
        searchPlaceholder: language === 'tr' ? 'Hasta ara (isim veya semptom)...' : 'Search patient (name or symptom)...',
        noPatients: language === 'tr' ? 'Henüz hasta kaydı yok' : 'No patient records yet',
        addPatientHint: language === 'tr' ? 'Yeni hasta eklemek için yukarıdaki butonu kullanın.' : 'Use the button above to add a new patient.',
        yearsOld: language === 'tr' ? 'yaşında' : 'years old',
        analysisCount: language === 'tr' ? 'analiz' : 'analysis',
        male: language === 'tr' ? 'Erkek' : 'Male',
        female: language === 'tr' ? 'Kadın' : 'Female',
        other: language === 'tr' ? 'Diğer' : 'Other',
        details: language === 'tr' ? 'Detaylar' : 'Details',
        edit: language === 'tr' ? 'Düzenle' : 'Edit',
        delete: language === 'tr' ? 'Sil' : 'Delete',
        history: language === 'tr' ? 'Medikal Geçmiş' : 'Medical History',
        symptoms: language === 'tr' ? 'Semptomlar' : 'Symptoms',
        analysisHistory: language === 'tr' ? 'Analiz Geçmişi' : 'Analysis History',
        registered: language === 'tr' ? 'Kayıt' : 'Registered',
        lastUpdate: language === 'tr' ? 'Güncelleme' : 'Updated',
        deleteConfirmTitle: language === 'tr' ? 'Hastayı Sil' : 'Delete Patient',
        deleteConfirmMessage: language === 'tr' ? 'Bu hastayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.' : 'Are you sure you want to delete this patient? This action cannot be undone.',
        patientDeleted: language === 'tr' ? 'Hasta kaydı silindi.' : 'Patient record deleted.'
    }), [language]);

    const filteredPatients = useMemo(() => {
        if (!searchTerm.trim()) return patients;
        const term = searchTerm.toLowerCase();
        return patients.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.symptoms?.toLowerCase().includes(term)
        );
    }, [patients, searchTerm]);

    const handleDeleteClick = React.useCallback((id: string, name: string) => {
        setPatientToDelete({ id, name });
        setConfirmOpen(true);
    }, []);

    const handleConfirmDelete = React.useCallback(() => {
        if (patientToDelete) {
            deletePatient(patientToDelete.id);
            addToast(`"${patientToDelete.name}" ${labels.patientDeleted}`, 'info');
            setPatientToDelete(null);
            setConfirmOpen(false);
        }
    }, [patientToDelete, deletePatient, addToast, labels.patientDeleted]);

    const handleEdit = React.useCallback((patient: any) => {
        setEditingPatient(patient);
        setIsModalOpen(true);
    }, []);

    const handleAddNew = React.useCallback(() => {
        setEditingPatient(null);
        setIsModalOpen(true);
    }, []);

    const getGenderLabel = React.useCallback((gender: string) => {
        if (!gender) return labels.other;
        const g = gender.toLowerCase();
        if (g === 'male') return labels.male;
        if (g === 'female') return labels.female;
        return labels.other;
    }, [labels]);

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{labels.title}</h2>
                    <p className="text-slate-500 text-sm">{labels.subtitle}</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center justify-center px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm w-full sm:w-auto active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {labels.newPatient}
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder={labels.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
            </div>

            {/* Patient List */}
            <div className="flex-1 overflow-y-auto space-y-4">
                {filteredPatients.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">{labels.noPatients}</p>
                        <p className="text-sm">{labels.addPatientHint}</p>
                    </div>
                ) : (
                    filteredPatients.map((patient) => {
                        const isSelected = selectedPatient?.id === patient.id;
                        const isExpanded = expandedPatient === patient.id;

                        return (
                            <PatientListItem
                                key={patient.id}
                                patient={patient}
                                isSelected={isSelected}
                                isExpanded={isExpanded}
                                onSelectToggle={() => {
                                    selectPatient(isSelected ? null : patient.id);
                                    if (onSelectPatient) {
                                        onSelectPatient(patient);
                                    }
                                }}
                                onExpandToggle={() => {
                                    setExpandedPatient(isExpanded ? null : patient.id);
                                }}
                                onEdit={() => handleEdit(patient)}
                                onDelete={() => handleDeleteClick(patient.id, patient.name)}
                                getGenderLabel={getGenderLabel}
                                labels={labels}
                                language={language}
                                t={t}
                            />
                        );
                    })
                )}
            </div>

            <PatientModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingPatient(null);
                }}
                editingPatient={editingPatient}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setPatientToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title={labels.deleteConfirmTitle}
                message={patientToDelete
                    ? (language === 'tr'
                        ? `"${patientToDelete.name}" adlı hastayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
                        : `Are you sure you want to delete "${patientToDelete.name}"? This action cannot be undone.`)
                    : labels.deleteConfirmMessage
                }
                confirmText={labels.delete}
                cancelText={language === 'tr' ? 'İptal' : 'Cancel'}
                variant="danger"
            />
        </div>
    );
};

export default PatientList;
