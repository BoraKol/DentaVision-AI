import { AIServiceFactory } from "../../../infrastructure/ai/AIServiceFactory";
import { ImageAnalysisResult } from "../../domain/entities/AnalysisResult";

export class AnalyzeRadiographUseCase {
    async execute(base64Image: string): Promise<ImageAnalysisResult> {
        const aiService = AIServiceFactory.getInstance();
        return await aiService.analyzeRadiograph(base64Image);
    }
}
