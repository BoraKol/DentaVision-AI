import React, { useState, useRef, useMemo } from 'react';
import { useImageAnalysis } from '../hooks/useImageAnalysis';
import { useReport } from '../hooks/useReport';
import { useUser } from '../context/UserContext';
import { useTreatment } from '../context/TreatmentContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { usePatient } from '../context/PatientContext';
import { ErrorBoundary } from './ErrorBoundary';

// Sub-components
import PatientSearch from './imaging/PatientSearch';
import RadiographViewer from './imaging/RadiographViewer';
import AnalysisResultDisplay from './imaging/AnalysisResultDisplay';

const ImagingAnalysisContent: React.FC = () => {
    const { selectedPatient, patients, selectPatient } = usePatient();
    const { analyzeImage, data: result, status, error } = useImageAnalysis(selectedPatient?.id);
    const { generateReport, isGenerating } = useReport();
    const { user } = useUser();
    const { addItem } = useTreatment();
    const { addToast } = useToast();
    const { language } = useLanguage();

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [useYolo, setUseYolo] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPatientResults, setShowPatientResults] = useState(false);
    const [showDetections, setShowDetections] = useState(true);

    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const filteredPatients = useMemo(() => {
        return patients.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5);
    }, [patients, searchTerm]);

    const handlePatientSelect = (patientId: string) => {
        selectPatient(patientId);
        setSearchTerm('');
        setShowPatientResults(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setSelectedImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleStartAnalysis = () => {
        if (selectedImage) {
            const base64Data = selectedImage.includes(',') ? selectedImage.split(',')[1] : selectedImage;
            analyzeImage(base64Data, imgRef.current!, useYolo);
        }
    };

    const handleAddToPlan = (finding: any) => {
        if (!selectedPatient) return;

        let procedureName = typeof finding === 'object' ? finding.condition : finding;
        let toothNumber = typeof finding === 'object' ? finding.toothNumber : null;
        let surfaces = typeof finding === 'object' ? finding.surfaces : [];

        addItem(selectedPatient.id, {
            toothNumber: toothNumber || '0',
            surfaces: surfaces || [],
            procedureName: procedureName,
            phase: 'restorative'
        });

        addToast(
            language === 'tr' ? 'İşlem tedavi planına eklendi.' : 'Procedure added to treatment plan.',
            'success'
        );
    };

    const handleGenerateReport = () => {
        if (result && selectedPatient && selectedImage) {
            generateReport({
                doctor: user,
                patient: selectedPatient,
                analysis: result.geminiResult,
                radiographImage: selectedImage, // Use full base64 for PDF
                date: new Date(),
                treatmentPlan: []
            });
        }
    };

    const urgencyBg = useMemo(() => {
        if (!result?.geminiResult) return '';
        if (result.geminiResult.urgency >= 4) return 'bg-red-500';
        if (result.geminiResult.urgency === 3) return 'bg-orange-500';
        return 'bg-green-500';
    }, [result]);

    const labels = {
        analysisResults: language === 'tr' ? 'Yorumlama Sonuçları' : 'Interpretation Results',
        detailedFindings: language === 'tr' ? 'Detaylı Bulgular' : 'Detailed Findings',
        diagnosis: language === 'tr' ? 'TEŞHİS' : 'DIAGNOSIS',
        generating: language === 'tr' ? 'Oluşturuluyor...' : 'Generating...',
        downloadPdf: language === 'tr' ? 'PDF İndir' : 'Download PDF',
        addToTreatment: language === 'tr' ? 'Tedavi Planına Ekle' : 'Add to Treatment Plan'
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="flex flex-col space-y-6">
                <PatientSearch
                    selectedPatient={selectedPatient}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    showResults={showPatientResults}
                    setShowResults={setShowPatientResults}
                    filteredPatients={filteredPatients}
                    onSelect={handlePatientSelect}
                />

                <RadiographViewer
                    selectedImage={selectedImage}
                    onImageUpload={handleImageUpload}
                    imgRef={imgRef}
                    canvasRef={canvasRef}
                    showDetections={showDetections}
                    setShowDetections={setShowDetections}
                    useYolo={useYolo}
                    setUseYolo={setUseYolo}
                    status={status}
                    onStartAnalysis={handleStartAnalysis}
                    result={result}
                />
            </div>

            <div className="h-full">
                <AnalysisResultDisplay
                    result={result}
                    labels={labels}
                    urgencyBg={urgencyBg}
                    onAddToPlan={handleAddToPlan}
                    onGenerateReport={handleGenerateReport}
                    isGenerating={isGenerating}
                />
            </div>

            {error && (
                <div className="fixed bottom-6 right-6 bg-red-50 border border-red-200 p-4 rounded-xl shadow-lg flex items-start space-x-3 max-w-md animate-in fade-in slide-in-from-bottom-5 z-[100]">
                    <div className="bg-red-100 p-1.5 rounded-full">
                        <span className="text-red-600 font-bold">!</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-red-800">{language === 'tr' ? 'Analiz Hatası' : 'Analysis Error'}</h4>
                        <p className="text-xs text-red-600 mt-1">{typeof error === 'string' ? error : error.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const ImagingAnalysis: React.FC = () => (
    <ErrorBoundary>
        <ImagingAnalysisContent />
    </ErrorBoundary>
);

export default ImagingAnalysis;
