import { Patient } from '../entities/Patient';
import { AnalysisResult, ImageAnalysisResult } from '../entities/AnalysisResult';

export interface IAIAnalysisService {
    analyzePatientRisk(patient: any, language?: string): Promise<any>;
    analyzeRadiograph(base64Image: string): Promise<any>;
    generateMorningBriefing(appointments?: any[]): Promise<any>; // appointments is optional
    generateTreatmentPlan(findings: string[], patientHistory?: any): Promise<any>;
    suggestPrescription(symptoms: string, procedure?: string): Promise<any>;
}
