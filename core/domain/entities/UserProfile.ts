export interface UserProfile {
    id: string;
    name: string;
    title: string; // e.g., "Dr.", "DDS", "BDS"
    specialty: string; // e.g., "General Dentist", "Orthodontist"
    email: string;
    licenseNumber: string;
    clinicName: string;
    avatarUrl?: string; // Base64 or URL
    preferences: {
        theme: 'light' | 'dark';
        notifications: boolean;
    };
    geminiApiKey?: string; // Stored locally, not in DB
}
