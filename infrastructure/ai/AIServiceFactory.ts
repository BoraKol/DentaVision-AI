import { IAIAnalysisService } from "../../core/domain/interfaces/IAIService";
import { GeminiService } from "./GeminiService";
import { AppConfig } from "../config/AppConfig";

export class AIServiceFactory {
    private static instance: IAIAnalysisService | null = null;
    private static lastUsedKey: string | null = null;

    static getInstance(): IAIAnalysisService {
        const currentKey = AppConfig.GEMINI_API_KEY;

        // If instance doesn't exist OR the key has changed, re-create the service
        if (!this.instance || this.lastUsedKey !== currentKey) {
            console.log(`[AIServiceFactory] ${!this.instance ? 'Initializing' : 'Resetting'} GeminiService with ${currentKey ? 'Custom Key' : 'Default Key'}`);
            this.instance = new GeminiService();
            this.lastUsedKey = currentKey;
        }
        return this.instance;
    }

    static resetInstance(): void {
        this.instance = null;
        this.lastUsedKey = null;
    }
}
