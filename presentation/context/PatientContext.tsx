import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Patient } from '../../core/domain/entities/Patient';
import { patientsAPI } from '../../infrastructure/services/ApiService';
import { useAuth } from './AuthContext';
import { OfflineStorageService, OFFLINE_KEYS } from '../services/OfflineStorageService';

interface PatientWithHistory extends Patient {
    analysisHistory?: {
        id: string;
        date: Date;
        diagnosis: string;
        findings: string[];
    }[];
    createdAt: Date;

    updatedAt: Date;
    userId?: { // Populated from backend
        _id: string;
        name: string;
        title: string;
    };
}

interface PatientContextType {
    patients: PatientWithHistory[];
    selectedPatient: PatientWithHistory | null;
    addPatient: (patient: Omit<PatientWithHistory, 'id' | 'createdAt' | 'updatedAt'>) => PatientWithHistory;
    updatePatient: (id: string, updates: Partial<PatientWithHistory>) => void;
    deletePatient: (id: string) => void;
    selectPatient: (id: string | null) => void;
    getPatientById: (id: string) => PatientWithHistory | undefined;
    addAnalysisToPatient: (patientId: string, analysis: { diagnosis: string; findings: string[] }) => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

const STORAGE_KEY = 'dentavision_patients';

export const usePatient = () => {
    const context = useContext(PatientContext);
    if (!context) {
        throw new Error('usePatient must be used within a PatientProvider');
    }
    return context;
};

export const PatientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [patients, setPatients] = useState<PatientWithHistory[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<PatientWithHistory | null>(null);
    const { user } = useAuth();

    // Fetch patients from API
    const fetchPatients = useCallback(async () => {
        if (!user) return;
        try {
            const response = await patientsAPI.getAll();
            if (!Array.isArray(response.data)) {
                console.error('Expected array from API but got:', typeof response.data);
                // Try to load from cache even if API returns weird data, or clear? Better to keep potential old data or empty.
                setPatients([]);
                return;
            }
            const patientsData = response.data.map((p: any) => ({
                ...p,
                id: p._id, // Map MongoDB _id to frontend id
                createdAt: new Date(p.createdAt),
                updatedAt: new Date(p.updatedAt),
                // Assuming analyses are populated or fetched - for now handled simply
                analysisHistory: p.analyses || [] // This might need adjustment based on backend population
            }));

            // Cache the fresh data
            OfflineStorageService.saveData(OFFLINE_KEYS.PATIENTS, patientsData);
            setPatients(patientsData);
        } catch (error) {
            console.error('Failed to fetch patients', error);
            // Fallback to offline cache
            const cachedData = OfflineStorageService.getData(OFFLINE_KEYS.PATIENTS);
            if (cachedData) {
                console.log('Loaded patients from offline cache');
                // We need to revive Dates because JSON.parse makes them strings
                const revisedData = cachedData.map((p: any) => ({
                    ...p,
                    createdAt: new Date(p.createdAt),
                    updatedAt: new Date(p.updatedAt)
                }));
                setPatients(revisedData);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const addPatient = useCallback(async (patientData: Omit<PatientWithHistory, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const response = await patientsAPI.create(patientData);
            const newPatient = {
                ...response.data,
                id: response.data._id, // Map MongoDB _id to frontend id
                createdAt: new Date(response.data.createdAt),
                updatedAt: new Date(response.data.updatedAt)
            };
            setPatients(prev => [newPatient, ...prev]);
            return newPatient;
        } catch (error) {
            console.error('Failed to create patient', error);
            throw error;
        }
    }, []);

    const updatePatient = useCallback(async (id: string, updates: Partial<PatientWithHistory>) => {
        try {
            const response = await patientsAPI.update(id, updates);
            const updatedPatient = {
                ...response.data,
                id: response.data._id, // Map MongoDB _id to frontend id
                createdAt: new Date(response.data.createdAt),
                updatedAt: new Date(response.data.updatedAt)
            };

            setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
            if (selectedPatient?.id === id) {
                setSelectedPatient(updatedPatient);
            }
        } catch (error) {
            console.error('Failed to update patient', error);
            throw error;
        }
    }, [selectedPatient]);

    const deletePatient = useCallback(async (id: string) => {
        try {
            await patientsAPI.delete(id);
            setPatients(prev => prev.filter(p => p.id !== id));
            if (selectedPatient?.id === id) {
                setSelectedPatient(null);
            }
        } catch (error) {
            console.error('Failed to delete patient', error);
            throw error;
        }
    }, [selectedPatient]);

    const selectPatient = useCallback((id: string | null) => {
        if (id === null) {
            setSelectedPatient(null);
        } else {
            const patient = patients.find(p => p.id === id);
            setSelectedPatient(patient || null);
        }
    }, [patients]);

    const getPatientById = useCallback((id: string) => {
        return patients.find(p => p.id === id);
    }, [patients]);

    const addAnalysisToPatient = useCallback(async (patientId: string, analysis: { diagnosis: string; findings: string[] }) => {
        // NOTE: Ideally this should call an analysesAPI endpoint
        // For now, we'll assume we update the patient with the new analysis
        // But since the backend expects separate Analysis documents, this part needs backend support
        // For MVP, if we don't have analysis endpoints, we might need to skip or mock
        // TODO: Implement Analysis API calls
        console.warn('addAnalysisToPatient requires backend implementation');

        // Optimistic update for UI interaction if needed, or implement proper API
        const newAnalysis = {
            id: `temp-${Date.now()}`,
            date: new Date(),
            ...analysis
        };

        // This is a placeholder since we changed to API.
        // In a real scenario, we'd post to /api/analyses and then refetch patient
    }, []);

    return (
        <PatientContext.Provider value={{
            patients,
            selectedPatient,
            addPatient: addPatient as any, // Type assertion for now to match interface
            updatePatient,
            deletePatient,
            selectPatient,
            getPatientById,
            addAnalysisToPatient
        }}>
            {children}
        </PatientContext.Provider>
    );
};
