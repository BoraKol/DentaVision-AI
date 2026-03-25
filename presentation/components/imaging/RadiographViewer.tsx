import React, { useRef, useEffect } from 'react';
import { Upload, Scan, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface RadiographViewerProps {
    selectedImage: string | null;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    imgRef: React.RefObject<HTMLImageElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    showDetections: boolean;
    setShowDetections: (value: boolean) => void;
    useYolo: boolean;
    setUseYolo: (value: boolean) => void;
    status: string;
    onStartAnalysis: () => void;
    result: any;
}

const RadiographViewer: React.FC<RadiographViewerProps> = ({
    selectedImage,
    onImageUpload,
    imgRef,
    canvasRef,
    showDetections,
    setShowDetections,
    useYolo,
    setUseYolo,
    status,
    onStartAnalysis,
    result
}) => {
    const { language } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Drawing Logic
    useEffect(() => {
        if (!selectedImage || !canvasRef.current || !imgRef.current) return;

        if (!showDetections || !result?.yoloResult) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        }
    }, [result, showDetections, selectedImage]);

    const labels = {
        uploadTitle: language === 'tr' ? 'Radyografi Yükleme' : 'Radiograph Upload',
        clickToUpload: language === 'tr' ? 'Röntgen Yüklemek İçin Tıklayın' : 'Click to Upload X-Ray',
        maxSize: language === 'tr' ? 'JPG, PNG (Maks 5MB)' : 'JPG, PNG (Max 5MB)',
        enableYolo: language === 'tr' ? 'YOLO (AI Vision) Aktif Et' : 'Enable YOLO (AI Vision)',
        showBoxes: language === 'tr' ? 'Kutuları Göster' : 'Show Boxes',
        hideBoxes: language === 'tr' ? 'Kutuları Gizle' : 'Hide Boxes',
        analyzing: language === 'tr' ? 'Analiz Ediliyor...' : 'Analyzing...',
        startAnalysis: language === 'tr' ? 'Analizi Başlat' : 'Start Analysis',
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-teal-600" />
                {labels.uploadTitle}
            </h2>

            <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${selectedImage ? 'border-teal-400 bg-teal-50/10' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 h-64'}`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onImageUpload}
                    accept="image/*"
                    className="hidden"
                />

                {selectedImage ? (
                    <div className="relative w-full">
                        <img
                            ref={imgRef}
                            src={selectedImage}
                            alt="Radiograph preview"
                            className="w-full h-auto block rounded-lg shadow-inner"
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        />
                    </div>
                ) : (
                    <div className="text-center p-8">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-4 inline-block">
                            <Upload className="w-8 h-8 text-teal-500" />
                        </div>
                        <p className="text-slate-700 font-medium">{labels.clickToUpload}</p>
                        <p className="text-slate-400 text-sm mt-1">{labels.maxSize}</p>
                    </div>
                )}
            </div>

            {selectedImage && (
                <div className="mt-6 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-4">
                        {/* YOLO UI removed to prevent confusing generic detections */}
                    </div>

                    <button
                        onClick={onStartAnalysis}
                        disabled={status === 'loading'}
                        className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${status === 'loading' ? 'bg-slate-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:scale-105 active:scale-95'}`}
                    >
                        {status === 'loading' ? labels.analyzing : labels.startAnalysis}
                    </button>
                </div>
            )}
        </div>
    );
};

export default RadiographViewer;
