import { UrgencyLevel } from '../value-objects/UrgencyLevel';

export interface RiskProfile {
    caries: number;
    perio: number;
    oralCancer: number;
    hygiene: number;
    diet: number;
}

export interface AnalysisResult {
    diagnosis: string[];
    urgency: UrgencyLevel;
    treatment_plan: {
        short_term: string[];
        long_term: string[];
    };
    patient_notes: string;
    risk_profile?: RiskProfile;
    icd_10_codes?: string[];
    required_supplies?: string[];
}

export interface ImageAnalysisResult {
    findings: string[];
    diagnosis: string;
    urgency: UrgencyLevel;
    recommendations: string[];
    icd_10_codes: string[];
}
