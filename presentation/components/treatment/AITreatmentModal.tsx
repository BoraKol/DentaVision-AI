import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, AlertTriangle, Play, Sparkles } from 'lucide-react';
import { YoloService } from '../../../infrastructure/ai/YoloService';
import { GeminiService } from '../../../infrastructure/ai/GeminiService';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

interface AITreatmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
    onPlanGenerated: (plan: any) => void;
}

const yoloService = new YoloService();
const geminiService = new GeminiService();

export const AITreatmentModal: React.FC<AITreatmentModalProps> = ({ isOpen, onClose, patientId, onPlanGenerated }) => {
    const { addToast } = useToast();
    const { t, language } = useLanguage();

    const [step, setStep] = useState(1); // 1: Upload, 2: Analyze, 3: Review Plan
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [findings, setFindings] = useState<any[]>([]);
    const [generatedPlan, setGeneratedPlan] = useState<any>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Initialize YOLO service
    useEffect(() => {
        if (!yoloService.isLoaded()) {
            yoloService.loadModel().catch(err => console.error("YOLO Load Error:", err));
        }
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImage(ev.target?.result as string);
                setStep(2);
            };
            reader.readAsDataURL(file);
        }
    };

    const runAnalysis = async () => {
        if (!imageRef.current) return;
        setIsAnalyzing(true);

        try {
            // 1. Run YOLO Object Detection
            const detections = await yoloService.detect(imageRef.current);
            setFindings(detections);

            // Draw boxes on canvas
            drawDetections(detections);

            // 2. Generate Plan with Gemini
            const findingsText = detections.map(d => `${d.label} (Güven: %${(d.confidence * 100).toFixed(0)})`);
            // TODO: Fetch real patient history if needed
            const plan = await geminiService.generateTreatmentPlan(findingsText, { patientId });

            setGeneratedPlan(plan);
            setStep(3);

        } catch (error) {
            console.error("Analysis Error:", error);
            addToast("Analiz sırasında bir hata oluştu.", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const drawDetections = (detections: any[]) => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Match canvas size to displayed image size
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        detections.forEach(det => {
            const [x1, y1, x2, y2] = det.box;
            const w = x2 - x1;
            const h = y2 - y1;

            ctx.strokeStyle = '#ef4444'; // Red color
            ctx.lineWidth = 3;
            ctx.strokeRect(x1, y1, w, h);

            ctx.fillStyle = '#ef4444';
            ctx.font = '16px sans-serif';
            ctx.fillText(`${det.label} ${(det.confidence * 100).toFixed(0)}%`, x1, y1 - 5);
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-teal-400" />
                        <h2 className="text-white font-bold text-lg">AI Tedavi Öneri Motoru</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Step 1: Upload */}
                    {step === 1 && (
                        <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700 rounded-xl hover:border-teal-500 hover:bg-slate-800/50 transition-all cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileUpload}
                            />
                            <Upload className="w-16 h-16 text-teal-500 mb-4" />
                            <h3 className="text-xl text-white font-semibold">Röntgen veya Fotoğraf Yükle</h3>
                            <p className="text-slate-400 mt-2">Analiz etmek için görüntüyü buraya sürükleyin veya tıklayın</p>
                        </div>
                    )}

                    {/* Step 2: Analyze */}
                    {step === 2 && image && (
                        <div className="flex flex-col md:flex-row gap-6 h-full">
                            <div className="flex-1 bg-black rounded-lg relative flex items-center justify-center overflow-hidden">
                                <img
                                    ref={imageRef}
                                    src={image}
                                    alt="Analysis"
                                    className="max-h-[500px] object-contain"
                                    onLoad={() => { if (findings.length > 0) drawDetections(findings); }}
                                />
                                <canvas
                                    ref={canvasRef}
                                    className="absolute inset-0 pointer-events-none w-full h-full object-contain"
                                />
                                {isAnalyzing && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                                            <p className="text-teal-400 font-medium animate-pulse">Görüntü İşleniyor & Plan Oluşturuluyor...</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="w-full md:w-80 flex flex-col justify-center space-y-4">
                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                    <h4 className="text-slate-300 font-medium mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                                        Analiz Yöntemi
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                        YOLOv8 modeli kullanılarak diş çürükleri, restorasyonlar ve anomaliler tespit edilecek.
                                        Bulgular Gemini AI ile klinik tedavi planına dönüştürülecek.
                                    </p>
                                </div>
                                <button
                                    onClick={runAnalysis}
                                    disabled={isAnalyzing}
                                    className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-teal-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    {isAnalyzing ? 'Analiz Yapılıyor...' : 'Analizi Başlat'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Result */}
                    {step === 3 && generatedPlan && (
                        <div className="space-y-6">
                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                <h3 className="text-teal-400 font-bold text-lg mb-1">AI Özeti</h3>
                                <p className="text-slate-300 italic">"{generatedPlan.summary}"</p>
                            </div>

                            <div className="grid gap-4">
                                {generatedPlan.treatment_items.map((item: any, idx: number) => (
                                    <div key={idx} className="bg-white p-4 rounded-lg flex justify-between items-center shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${item.phase === 'urgent' ? 'bg-red-100 text-red-700' :
                                                    item.phase === 'restorative' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-green-100 text-green-700'
                                                }`}>
                                                {item.toothNumber || '-'}
                                            </span>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{item.procedureName}</h4>
                                                <p className="text-xs text-slate-500">{item.rationale}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono text-slate-700 font-bold">{item.cost} ₺</div>
                                            <div className="text-xs text-slate-400 uppercase tracking-wider">{item.phase}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 3 && (
                    <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
                        <button
                            onClick={() => { setStep(1); setImage(null); }}
                            className="px-4 py-2 text-slate-400 hover:text-white"
                        >
                            Yeni Analiz
                        </button>
                        <button
                            onClick={() => {
                                onPlanGenerated(generatedPlan.treatment_items);
                                onClose();
                            }}
                            className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold flex items-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            Planı Uygula
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
