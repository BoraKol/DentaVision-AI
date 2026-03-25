import { ImageAnalysisResult } from "../../core/domain/entities/AnalysisResult";
import axios from "axios";

export class BackendAnalysisService {
    /**
     * Sends the radiograph to our Node.js backend to get analyzed by Gemini
     * and automatically saved to the patient's record in MongoDB.
     * @param patientId The selected patient
     * @param base64Image The base64 radiograph string
     * @returns The raw findings array from the backend Analysis model
     */
    async analyzeAndPersist(patientId: string, base64Image: string): Promise<any> {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

            const response = await axios.post(`${apiUrl}/analysis`, {
                patientId,
                imageUrl: `data:image/jpeg;base64,${base64Image}`,
                notes: 'Otomatik analiz'
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            console.error("Backend Analysis API Error:", error);
            throw error;
        }
    }

    /**
     * Fetches all analyses for a specific patient
     */
    async getPatientAnalyses(patientId: string): Promise<any[]> {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const response = await axios.get(`${apiUrl}/analysis/patient/${patientId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data.data || [];
        } catch (error) {
            console.error("Failed to fetch patient analyses:", error);
            return [];
        }
    }
}
