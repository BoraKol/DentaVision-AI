import React, { useState, useCallback, useEffect } from 'react';
import { usePatientAnalysis } from '../hooks/usePatientAnalysis';
import { Patient } from '../../core/domain/entities/Patient';
import { useLanguage } from '../context/LanguageContext';
import RiskChart from './RiskChart';
import { Activity, CheckCircle2, FileJson, ChevronRight, AlertTriangle, Lock } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

const PatientIntakeContent: React.FC = () => {
    const { analyzePatient, reset, data: result, status, error } = usePatientAnalysis();
    const { t, language } = useLanguage();

    // Reset analysis when language changes
    useEffect(() => {
        reset();
    }, [language, reset]);

    const [formData, setFormData] = useState<Patient>({
        id: '',
        name: '',
        age: 30,
        gender: 'Male',
        history: '',
        symptoms: '',
        habits: '',
        password: '' // Optional password for portal access
    });

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const isValid = formData.history.trim().length > 0 ||
        formData.symptoms.trim().length > 0 ||
        formData.habits.trim().length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status === 'LOADING' || !isValid) return;
        await analyzePatient(formData, language);
    };

    const getUrgencyColor = (level: number) => {
        if (level >= 4) return 'bg-red-100 text-red-800 border-red-200';
        if (level === 3) return 'bg-orange-100 text-orange-800 border-orange-200';
        return 'bg-green-100 text-green-800 border-green-200';
    };

    // i18n labels
    const labels = {
        clinicalAssessment: language === 'tr' ? 'Klinik Değerlendirme' : 'Clinical Assessment',
        age: language === 'tr' ? 'Yaş' : 'Age',
        gender: language === 'tr' ? 'Cinsiyet' : 'Gender',
        male: language === 'tr' ? 'Erkek' : 'Male',
        female: language === 'tr' ? 'Kadın' : 'Female',
        other: language === 'tr' ? 'Diğer' : 'Other',
        medicalHistory: language === 'tr' ? 'Medikal Geçmiş (Anamnez)' : 'Medical History',
        historyPlaceholder: language === 'tr' ? 'Örn: Tip 2 Diyabet, Hipertansiyon, Penisilin Alerjisi' : 'E.g., Type 2 Diabetes, Hypertension, Penicillin Allergy',
        symptoms: language === 'tr' ? 'Mevcut Semptomlar' : 'Current Symptoms',
        symptomsPlaceholder: language === 'tr' ? 'Örn: Diş eti kanaması, 26 numaralı dişte ağrı, soğuk hassasiyeti' : 'E.g., Gum bleeding, pain in tooth 26, cold sensitivity',
        habits: language === 'tr' ? 'Alışkanlıklar' : 'Habits',
        habitsPlaceholder: language === 'tr' ? 'Örn: Sigara (10/gün), Asitli içecek tüketimi, Bruksizm' : 'E.g., Smoking (10/day), Acidic beverage consumption, Bruxism',
        processing: language === 'tr' ? 'İşleniyor...' : 'Processing...',
        generateProfile: language === 'tr' ? 'Risk Profili Oluştur' : 'Generate Risk Profile',
        riskVisualization: language === 'tr' ? 'Risk Görselleştirmesi' : 'Risk Visualization',
        clinicalFindings: language === 'tr' ? 'Klinik Bulgular' : 'Clinical Findings',
        urgencyLevel: language === 'tr' ? 'Aciliyet Seviyesi' : 'Urgency Level',
        diagnosis: language === 'tr' ? 'Tanı' : 'Diagnosis',
        patientNote: language === 'tr' ? 'Hasta İletişim Notu' : 'Patient Communication Note',
        treatmentPlan: language === 'tr' ? 'Önerilen Tedavi Planı' : 'Suggested Treatment Plan',
        shortTerm: language === 'tr' ? 'Acil / Kısa Vadeli' : 'Immediate / Short Term',
        longTerm: language === 'tr' ? 'Uzun Vadeli / Bakım' : 'Long Term / Maintenance',
        noAnalysis: language === 'tr' ? 'Analiz Oluşturulmadı' : 'No Analysis Generated',
        completeForm: language === 'tr' ? 'Risk profili oluşturmak için değerlendirme formunu doldurun.' : 'Complete the assessment form to generate a risk profile.',
        analysisError: language === 'tr' ? 'Analiz başarısız. Lütfen girdilerinizi kontrol edin ve tekrar deneyin.' : 'Analysis failed. Please check your inputs and try again.',
        password: language === 'tr' ? 'Portal Şifresi' : 'Portal Password',
        passwordPlaceholder: language === 'tr' ? 'Erişim şifresi belirleyin' : 'Set access password'
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 overflow-hidden">
            {/* Input Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-teal-600" />
                    {labels.clinicalAssessment}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{labels.age}</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{labels.gender}</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            >
                                <option value="male">{labels.male}</option>
                                <option value="female">{labels.female}</option>

                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{labels.medicalHistory}</label>
                        <textarea
                            name="history"
                            value={formData.history}
                            onChange={handleInputChange}
                            placeholder={labels.historyPlaceholder}
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{labels.symptoms}</label>
                        <textarea
                            name="symptoms"
                            value={formData.symptoms}
                            onChange={handleInputChange}
                            placeholder={labels.symptomsPlaceholder}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{labels.habits}</label>
                        <input
                            type="text"
                            name="habits"
                            value={formData.habits}
                            onChange={handleInputChange}
                            placeholder={labels.habitsPlaceholder}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                            <Lock className="w-4 h-4 mr-1 text-slate-400" />
                            {labels.password}
                        </label>
                        <input
                            type="text"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder={labels.passwordPlaceholder}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            {language === 'tr' ? 'Hastanın portal üzerinden sonuçlarına erişebilmesi için gereklidir.' : 'Required for patient to access their results via the portal.'}
                        </p>
                    </div>

                    {status === 'ERROR' && (
                        <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            {error?.message || labels.analysisError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'LOADING' || !isValid}
                        className={`w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {status === 'LOADING' ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {labels.processing}
                            </span>
                        ) : (
                            labels.generateProfile
                        )}
                    </button>
                </form>
            </div>

            {/* Results View */}
            <div className="space-y-6">
                {result ? (
                    <>
                        {/* Risk Chart Card */}
                        {result.risk_profile && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">{labels.riskVisualization}</h3>
                                <RiskChart data={result.risk_profile} />
                            </div>
                        )}

                        {/* Clinical Findings Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-slate-800">{labels.clinicalFindings}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getUrgencyColor(result.urgency)}`}>
                                    {labels.urgencyLevel}: {result.urgency}/5
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide">{labels.diagnosis}</h4>
                                    <ul className="mt-2 space-y-1">
                                        {result.diagnosis.map((d, i) => (
                                            <li key={i} className="flex items-start text-slate-700">
                                                <CheckCircle2 className="w-4 h-4 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                                                {d}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {result.icd_10_codes && (
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide">ICD-10</h4>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {result.icd_10_codes.map((code, i) => (
                                                <span key={i} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono border border-slate-200">
                                                    {code}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <h4 className="text-sm font-medium text-slate-800 mb-2 flex items-center">
                                        <FileJson className="w-4 h-4 mr-2 text-slate-500" />
                                        {labels.patientNote}
                                    </h4>
                                    <p className="text-sm text-slate-600 italic">"{result.patient_notes}"</p>
                                </div>
                            </div>
                        </div>

                        {/* Treatment Plan Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">{labels.treatmentPlan}</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-teal-700 mb-2 flex items-center">
                                        <ChevronRight className="w-4 h-4 mr-1" />
                                        {labels.shortTerm}
                                    </h4>
                                    <ul className="list-disc list-inside text-sm text-slate-700 pl-5">
                                        {result.treatment_plan?.short_term?.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-slate-600 mb-2 flex items-center">
                                        <ChevronRight className="w-4 h-4 mr-1" />
                                        {labels.longTerm}
                                    </h4>
                                    <ul className="list-disc list-inside text-sm text-slate-700 pl-5">
                                        {result.treatment_plan?.long_term?.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300">
                        <Activity className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium">{labels.noAnalysis}</p>
                        <p className="text-sm">{labels.completeForm}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const PatientIntake: React.FC = () => (
    <ErrorBoundary>
        <PatientIntakeContent />
    </ErrorBoundary>
);

export default PatientIntake;
