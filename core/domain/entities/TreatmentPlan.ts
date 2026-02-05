export type TreatmentPhase = 'urgent' | 'restorative' | 'maintenance';
export type TreatmentStatus = 'pending' | 'in_progress' | 'completed';

export interface TreatmentItem {
    id: string;
    toothNumber?: string; // Optional (e.g., General cleaning)
    surfaces?: string[];
    procedureName: string;
    phase: TreatmentPhase;
    status: TreatmentStatus;
    cost?: number;
    notes?: string;
}

export interface TreatmentPlan {
    id: string;
    patientId: string;
    createdAt: Date;
    items: TreatmentItem[];
}
