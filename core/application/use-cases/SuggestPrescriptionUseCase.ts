import { IAIAnalysisService } from '../../domain/interfaces/IAIService';
import { GeminiService } from '../../../infrastructure/ai/GeminiService';

export class SuggestPrescriptionUseCase {
    private aiService: IAIAnalysisService;

    constructor() {
        this.aiService = new GeminiService();
    }

    async execute(symptoms: string, procedure?: string): Promise<any> {
        return this.aiService.suggestPrescription(symptoms, procedure);
    }
}
