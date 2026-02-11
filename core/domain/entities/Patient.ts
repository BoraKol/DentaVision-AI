export interface Patient {
    id: string;
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    history: string;
    symptoms: string;
    habits: string;
    password?: string;
}

export interface Diagnosis {
    code: string;
    description: string;
    urgency: number;
}
