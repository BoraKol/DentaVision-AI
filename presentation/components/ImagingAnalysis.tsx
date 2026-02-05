import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useImageAnalysis } from '../hooks/useImageAnalysis';
import { useReport } from '../hooks/useReport';
import { useUser } from '../context/UserContext';
import { useTreatment } from '../context/TreatmentContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { usePatient } from '../context/PatientContext';
import { Upload, Scan, AlertOctagon, Info, Eye, EyeOff, FileDown, PlusCircle } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

const ImagingAnalysisContent: React.FC = () => {
    const { analyzeImage, data: result, status, error } = useImageAnalysis();
    const { generateReport, isGenerating } = useReport();
    const { user } = useUser();
    const { addItem, items: treatmentItems } = useTreatment();
    const { addToast } = useToast();
    const { t, language } = useLanguage();
    const { selectedPatient, patients, selectPatient } = usePatient();

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [useYolo, setUseYolo] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPatientResults, setShowPatientResults] = useState(false);

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    const handlePatientSelect = (patientId: string) => {
        selectPatient(patientId);
        setSearchTerm('');
        setShowPatientResults(false);
    };
    // ... (rest of state)

    // ... (skip down to handleAddToPlan)

    const [showDetections, setShowDetections] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // i18n labels
    const labels = {
        uploadTitle: language === 'tr' ? 'Radyografi Yükleme' : 'Radiograph Upload',
        clickToUpload: language === 'tr' ? 'Röntgen Yüklemek İçin Tıklayın' : 'Click to Upload X-Ray',
        maxSize: language === 'tr' ? 'JPG, PNG (Maks 5MB)' : 'JPG, PNG (Max 5MB)',
        enableYolo: language === 'tr' ? 'YOLO (AI Vision) Aktif Et' : 'Enable YOLO (AI Vision)',
        showBoxes: language === 'tr' ? 'Kutuları Göster' : 'Show Boxes',
        hideBoxes: language === 'tr' ? 'Kutuları Gizle' : 'Hide Boxes',
        analyzing: language === 'tr' ? 'Analiz Ediliyor...' : 'Analyzing...',
        startAnalysis: language === 'tr' ? 'Analizi Başlat' : 'Start Analysis',
        analysisResults: language === 'tr' ? 'Yorumlama Sonuçları' : 'Interpretation Results',
        generating: language === 'tr' ? 'Oluşturuluyor...' : 'Generating...',
        downloadPdf: language === 'tr' ? 'PDF İndir' : 'Download PDF',
        diagnosis: language === 'tr' ? 'TEŞHİS' : 'DIAGNOSIS',
        aiFindings: language === 'tr' ? 'Yapay Zeka Görüntü Bulguları' : 'AI Image Findings',
        detailedFindings: language === 'tr' ? 'Detaylı Bulgular' : 'Detailed Findings',
        recommendations: language === 'tr' ? 'Öneriler' : 'Recommendations',
        cdtCodes: language === 'tr' ? 'Kodlama (CDT/ICD)' : 'Coding (CDT/ICD)',
        addToTreatment: language === 'tr' ? 'Tedavi Planına Ekle' : 'Add to Treatment Plan',
        noResults: language === 'tr' ? 'Sonuçları görmek için bir resim yükleyin ve analizi başlatın.' : 'Upload an image and start analysis to see results.',
        fileTooLarge: language === 'tr' ? "Dosya çok büyük. Lütfen 5MB'dan küçük bir resim seçin." : 'File too large. Please select an image under 5MB.',
        addedToTreatment: language === 'tr' ? 'Bulgu tedavi planına eklendi!' : 'Finding added to treatment plan!',
        analysisFailed: language === 'tr' ? 'Analiz başarısız oldu.' : 'Analysis failed.',
        guestPatient: language === 'tr' ? 'Misafir Hasta' : 'Guest Patient'
    };

    const handleReportGeneration = () => {
        if (!result?.geminiResult || !selectedImage) return;

        const dummyPatient = {
            id: 'p-temp',
            name: labels.guestPatient,
            age: 35,
            gender: 'Male' as const,
            history: '',
            symptoms: '',
            habits: ''
        };

        generateReport({
            doctor: user,
            patient: dummyPatient,
            analysis: result.geminiResult,
            radiographImage: selectedImage,
            date: new Date(),
            treatmentPlan: treatmentItems
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                addToast(labels.fileTooLarge, 'error');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalysis = async () => {
        if (!selectedImage || !imgRef.current) return;

        const base64Data = selectedImage.split(',')[1];
        await analyzeImage(base64Data, imgRef.current, useYolo);
    };

    const handleAddToPlan = (finding: string) => {
        if (!selectedPatient) {
            addToast(labels.guestPatient + ' - ' + (language === 'tr' ? 'Lütfen önce hasta seçin' : 'Please select a patient'), 'error');
            return;
        }

        const toothMatch = finding.match(/(\d{2})/);
        const toothNumber = toothMatch ? toothMatch[0] : undefined;

        addItem(selectedPatient.id, {
            procedureName: finding,
            toothNumber: toothNumber,
            phase: 'restorative',
            cost: 0 // Default cost
        });
        addToast(labels.addedToTreatment, 'success');
    };

    // Draw detections on canvas
    useEffect(() => {
        if (!result?.yoloResult || !canvasRef.current || !imgRef.current || !showDetections) {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx?.clearRect(0, 0, canvas.width, canvas.height);
            }
            return;
        }

        const canvas = canvasRef.current;
        const img = imgRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const scaleX = img.width / img.naturalWidth;
            const scaleY = img.height / img.naturalHeight;

            result.yoloResult.forEach(det => {
                const [x1, y1, x2, y2] = det.box;

                const sx1 = x1 * scaleX;
                const sy1 = y1 * scaleY;
                const sw = (x2 - x1) * scaleX;
                const sh = (y2 - y1) * scaleY;

                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2;
                ctx.strokeRect(sx1, sy1, sw, sh);

                const text = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
                ctx.font = '12px sans-serif';
                const textMetrics = ctx.measureText(text);

                ctx.fillStyle = '#00ff00';
                ctx.fillRect(sx1, sy1 - 16, textMetrics.width + 4, 16);

                ctx.fillStyle = '#000000';
                ctx.fillText(text, sx1 + 2, sy1 - 4);
            });
        }
    }, [result, showDetections, selectedImage]);

    const urgencyBg = useMemo(() => {
        if (!result?.geminiResult) return '';
        if (result.geminiResult.urgency >= 4) return 'bg-red-500';
        if (result.geminiResult.urgency === 3) return 'bg-orange-500';
        return 'bg-green-500';
    }, [result]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Upload & Preview Area */}
            <div className="flex flex-col space-y-6">
                {/* Patient Selection Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                        <span>{language === 'tr' ? 'Hasta Seçimi' : 'Patient Selection'}</span>
                        {selectedPatient && <span className="text-teal-600 bg-teal-50 px-2 py-0.5 rounded text-xs">{selectedPatient.name}</span>}
                    </h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={selectedPatient ? selectedPatient.name : (language === 'tr' ? 'Hasta ara...' : 'Search patient...')}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowPatientResults(true);
                            }}
                            onFocus={() => setShowPatientResults(true)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                        />
                        {showPatientResults && searchTerm && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                                {filteredPatients.length > 0 ? (
                                    filteredPatients.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => handlePatientSelect(p.id)}
                                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0 text-sm"
                                        >
                                            <span className="font-medium text-slate-800">{p.name}</span>
                                            <span className="text-xs text-slate-500">{p.age}</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-3 text-center text-xs text-slate-500 italic">
                                        {language === 'tr' ? 'Sonuç yok' : 'No results'}
                                    </div>
                                )}
                            </div>
                        )}
                        {showPatientResults && searchTerm && (
                            <div className="fixed inset-0 z-40" onClick={() => setShowPatientResults(false)} />
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                        <Upload className="w-5 h-5 mr-2 text-teal-600" />
                        {labels.uploadTitle}
                    </h2>

                    <div
                        className="relative border-2 border-dashed border-slate-300 rounded-lg p-2 flex flex-col items-center justify-center bg-slate-50 min-h-[300px]"
                    >
                        {selectedImage ? (
                            <div className="relative inline-block w-full h-full text-center">
                                <img
                                    ref={imgRef}
                                    src={selectedImage}
                                    alt="Radiograph preview"
                                    className="max-h-[500px] w-auto mx-auto object-contain"
                                />
                                <canvas
                                    ref={canvasRef}
                                    className="absolute top-0 left-0 lg:left-1/2 lg:-translate-x-1/2 pointer-events-none"
                                    style={{
                                        height: imgRef.current?.height,
                                        width: imgRef.current?.width,
                                        top: imgRef.current?.offsetTop,
                                        left: imgRef.current?.offsetLeft
                                    }}
                                />
                                <button
                                    onClick={() => { setSelectedImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                    className="absolute top-2 right-2 bg-slate-800/70 text-white p-1 rounded-full hover:bg-slate-900"
                                >
                                    <Scan className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div
                                className="flex flex-col items-center justify-center cursor-pointer w-full h-full py-12"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Scan className="w-12 h-12 text-slate-400 mb-2" />
                                <p className="text-sm font-medium text-slate-600">{labels.clickToUpload}</p>
                                <p className="text-xs text-slate-400 mt-1">{labels.maxSize}</p>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={useYolo}
                                    onChange={() => setUseYolo(!useYolo)}
                                    className="rounded text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-sm font-medium text-slate-700">{labels.enableYolo}</span>
                            </label>

                            {result?.yoloResult && (
                                <button
                                    onClick={() => setShowDetections(!showDetections)}
                                    className="flex items-center text-sm text-slate-600 hover:text-teal-600"
                                >
                                    {showDetections ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                                    {showDetections ? labels.hideBoxes : labels.showBoxes}
                                </button>
                            )}
                        </div>

                        <button
                            onClick={handleAnalysis}
                            disabled={!selectedImage || status === 'LOADING'}
                            className="w-full sm:w-auto px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'LOADING' ? labels.analyzing : labels.startAnalysis}
                        </button>
                    </div>

                    {status === 'ERROR' && (
                        <div className="mt-4 flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                            <AlertOctagon className="w-4 h-4 mr-2" />
                            {error?.message || labels.analysisFailed}
                        </div>
                    )}
                </div>
            </div>

            {/* Analysis Results */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                        <Scan className="w-5 h-5 mr-2 text-teal-600" />
                        {labels.analysisResults}
                    </h2>
                    {result?.geminiResult && (
                        <button
                            onClick={handleReportGeneration}
                            disabled={isGenerating}
                            className="flex items-center text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
                        >
                            <FileDown className="w-4 h-4 mr-2" />
                            {isGenerating ? labels.generating : labels.downloadPdf}
                        </button>
                    )}
                </div>

                {result?.geminiResult ? (
                    <div className="space-y-6 flex-1 overflow-y-auto">
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="flex-1 mr-4">
                                <span className="text-xs uppercase text-slate-500 font-bold tracking-wider block mb-1">{labels.diagnosis}</span>
                                <p className="text-lg font-bold text-slate-800 leading-snug">{result.geminiResult.diagnosis}</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-wider">{language === 'tr' ? 'ACİLİYET' : 'URGENCY'}</span>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-sm ${urgencyBg}`}>
                                    {result.geminiResult.urgency}
                                </div>
                            </div>
                        </div>

                        {result.yoloResult && Array.isArray(result.yoloResult) && result.yoloResult.length > 0 && result.yoloResult.filter(det => !['bed', 'chair', 'person', 'couch', 'tv', 'laptop', 'dining table'].includes(det.label)).length > 0 && (
                            <div className="bg-slate-50 p-3 rounded-md border-l-4 border-blue-500">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">{labels.aiFindings}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.yoloResult
                                        .filter(det => !['bed', 'chair', 'person', 'couch', 'tv', 'laptop', 'dining table'].includes(det.label))
                                        .map((det, i) => (
                                            <span key={i} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded shadow-sm flex items-center">
                                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                                {det.label} ({(det.confidence * 100).toFixed(0)}%)
                                            </span>
                                        ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="font-semibold text-slate-700 mb-2">{labels.detailedFindings}</h3>
                            <ul className="space-y-2">
                                {result.geminiResult.findings && Array.isArray(result.geminiResult.findings) && result.geminiResult.findings.map((finding, idx) => (
                                    <li key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-md text-sm text-slate-700 border-l-4 border-teal-500 group">
                                        <span>{finding}</span>
                                        <button
                                            onClick={() => handleAddToPlan(finding)}
                                            className="ml-2 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-teal-50 p-1 rounded"
                                            title={labels.addToTreatment}
                                        >
                                            <PlusCircle className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border border-slate-200 rounded-lg">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">{labels.recommendations}</h4>
                                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                                    {result.geminiResult.recommendations && Array.isArray(result.geminiResult.recommendations) && result.geminiResult.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                                </ul>
                            </div>
                            <div className="p-4 border border-slate-200 rounded-lg">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">{labels.cdtCodes}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.geminiResult.icd_10_codes && Array.isArray(result.geminiResult.icd_10_codes) && result.geminiResult.icd_10_codes.map((code, i) => (
                                        <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-mono font-bold">
                                            {code}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
                        <AlertOctagon className="w-16 h-16 mb-4 opacity-20" />
                        <p>{labels.noResults}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ImagingAnalysis: React.FC = () => (
    <ErrorBoundary>
        <ImagingAnalysisContent />
    </ErrorBoundary>
);

export default ImagingAnalysis;
