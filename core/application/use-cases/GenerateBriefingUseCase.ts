import { AIServiceFactory } from "../../../infrastructure/ai/AIServiceFactory";

export class GenerateBriefingUseCase {
    async execute(appointments: any[] = []): Promise<any> {
        const aiService = AIServiceFactory.getInstance();
        return await aiService.generateMorningBriefing(appointments);
    }
}
