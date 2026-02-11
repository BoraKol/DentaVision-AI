export const OFFLINE_KEYS = {
    PATIENTS: 'dentavision_offline_patients',
    APPOINTMENTS: 'dentavision_offline_appointments',
    USER_PROFILE: 'dentavision_offline_user',
};

export class OfflineStorageService {
    static saveData(key: string, data: any) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            localStorage.setItem(`${key}_timestamp`, Date.now().toString());
        } catch (error) {
            console.error('Error saving offline data:', error);
        }
    }

    static getData(key: string) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error retrieving offline data:', error);
            return null;
        }
    }

    static getLastUpdated(key: string): Date | null {
        const timestamp = localStorage.getItem(`${key}_timestamp`);
        return timestamp ? new Date(parseInt(timestamp)) : null;
    }

    static clearData(key: string) {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_timestamp`);
    }
}
