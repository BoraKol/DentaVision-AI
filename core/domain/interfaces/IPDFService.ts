import { ImageAnalysisResult } from '../entities/AnalysisResult';
import { Patient } from '../entities/Patient';
import { UserProfile } from '../entities/UserProfile';

export interface ReportData {
    doctor: UserProfile;
    patient: Patient;
    analysis: ImageAnalysisResult;
    radiographImage?: string;
    date: Date;
    treatmentPlan?: {
        id: string;
        procedureName: string;
        toothNumber?: string;
        phase: string;
        status: string;
        cost?: number;
    }[];
}

export interface IPDFService {
    generateReport(data: ReportData): Promise<void>;
}
