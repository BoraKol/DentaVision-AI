export interface UserProfile {
    id: string;
    name: string;
    email: string;
    title: string;
    specialty: string;
    clinicName: string;
    avatarUrl?: string;
    commissionRate?: number;
    licenseNumber: string;
    preferences: {
        theme: 'light' | 'dark';
        notifications: boolean;
    };
    geminiApiKey?: string;
    branches: string[];
    activeBranch: string;
}
