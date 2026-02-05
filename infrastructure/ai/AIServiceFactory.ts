import { IAIAnalysisService } from "../../core/domain/interfaces/IAIService";
import { GeminiService } from "./GeminiService";

export class AIServiceFactory {
    private static instance: IAIAnalysisService;

    static getInstance(): IAIAnalysisService {
        if (!this.instance) {
            this.instance = new GeminiService();
        }
        return this.instance;
    }
}
