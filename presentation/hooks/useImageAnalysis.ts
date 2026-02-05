import { useAsync } from './useAsync';
import { AnalyzeRadiographUseCase } from '../../core/application/use-cases/AnalyzeRadiographUseCase';
import { ImageAnalysisResult } from '../../core/domain/entities/AnalysisResult';
import { YoloServiceFactory } from '../../infrastructure/ai/YoloServiceFactory';
import { DetectedObject } from '../../core/utils/yoloUtils';

interface CombinedAnalysisResult {
    geminiResult: ImageAnalysisResult | null;
    yoloResult: DetectedObject[] | null;
}

export const useImageAnalysis = () => {
    const { execute, ...state } = useAsync<CombinedAnalysisResult>();
    const geminiUseCase = new AnalyzeRadiographUseCase();
    const yoloService = YoloServiceFactory.getInstance();

    const analyzeImage = async (base64Image: string, imageElement: HTMLImageElement, useYolo: boolean) => {
        return execute(async () => {
            let geminiResult = null;
            let yoloResult = null;

            // Run Gemini
            try {
                geminiResult = await geminiUseCase.execute(base64Image);
            } catch (e) {
                console.error("Gemini analysis failed", e);
                throw e; // Critical for diagnosis
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
