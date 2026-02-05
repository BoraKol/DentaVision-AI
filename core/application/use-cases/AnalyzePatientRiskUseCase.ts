import { AIServiceFactory } from "../../../infrastructure/ai/AIServiceFactory";
import { Patient } from "../../domain/entities/Patient";
import { AnalysisResult } from "../../domain/entities/AnalysisResult";

export class AnalyzePatientRiskUseCase {
    async execute(patient: Patient, language?: string): Promise<AnalysisResult> {
        const aiService = AIServiceFactory.getInstance();
        // Here we could add additional business logic, validation, logging, etc.
        return await aiService.analyzePatientRisk(patient, language);
    }
}
