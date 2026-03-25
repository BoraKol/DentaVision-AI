import { useAsync } from './useAsync';
import { AnalyzeRadiographUseCase } from '../../core/application/use-cases/AnalyzeRadiographUseCase';
import { ImageAnalysisResult } from '../../core/domain/entities/AnalysisResult';
import { YoloServiceFactory } from '../../infrastructure/ai/YoloServiceFactory';
import { DetectedObject } from '../../core/utils/yoloUtils';
import { BackendAnalysisService } from '../../infrastructure/api/BackendAnalysisService';

interface CombinedAnalysisResult {
    geminiResult: ImageAnalysisResult | null;
    yoloResult: DetectedObject[] | null;
}

export const useImageAnalysis = (patientId?: string) => {
    const { execute, ...state } = useAsync<CombinedAnalysisResult>();
    const geminiUseCase = new AnalyzeRadiographUseCase();
    const yoloService = YoloServiceFactory.getInstance();

    const analyzeImage = async (base64Image: string, imageElement: HTMLImageElement, useYolo: boolean) => {
        return execute(async () => {
            let geminiResult: ImageAnalysisResult | null = null;
            let yoloResult = null;

            // Run Gemini via backend to save to DB
            try {
                if (patientId) {
                    const backendService = new BackendAnalysisService();
                    const dbRes = await backendService.analyzeAndPersist(patientId, base64Image);

                    // Map backend findings to the frontend structure
                    if (dbRes.success && dbRes.data) {
                        const aiDetails = dbRes.data.aiDetails || {};
                        geminiResult = {
                            primary_diagnosis: dbRes.data.diagnosis || "Radyolojik Analiz",
                            interpretation: aiDetails.interpretation || "Görüntü analiz edildi, lütfen detayları inceleyin.",
                            findings: dbRes.data.findings || [],
                            urgency: aiDetails.urgency || 2,
                            recommendations: aiDetails.recommendations || ["Lütfen Odontogram üzerinden detayları inceleyin."],
                            icd_10_codes: aiDetails.icd_10_codes || []
                        };
                    }
                } else {
                    // Fallback to client-side if no patient is selected
                    geminiResult = await geminiUseCase.execute(base64Image);
                }
            } catch (e) {
                console.error("Backend/Gemini analysis failed", e);
                // Don't throw if we want YOLO to still run, just warn
                geminiResult = null;
            }

            // Run YOLO (Parallel if desired, but sequential here for simplicity and resource management)
            if (useYolo) {
                try {
                    yoloResult = await yoloService.detect(imageElement);
                } catch (e) {
                    console.warn("YOLO detection failed", e);
                    yoloResult = []; // Fix: Return empty array on error
                }
            }

            return { geminiResult, yoloResult: yoloResult || [] };
        });
    };

    return { ...state, analyzeImage };
};
