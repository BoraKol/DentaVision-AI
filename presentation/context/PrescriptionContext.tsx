import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { prescriptionsAPI } from '../../infrastructure/services/ApiService';

export interface Drug {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
}

export interface Prescription {
    id: string;
    patientId: string;
    drugs: Drug[];
    notes?: string;
    date: Date;
}

interface PrescriptionContextType {
    prescriptions: Prescription[];
    loading: boolean;
    fetchPrescriptions: (patientId: string) => Promise<void>;
    addPrescription: (data: Omit<Prescription, 'id' | 'date'>) => Promise<void>;
    deletePrescription: (id: string) => Promise<void>;
}

const PrescriptionContext = createContext<PrescriptionContextType | undefined>(undefined);

export const usePrescription = () => {
    const context = useContext(PrescriptionContext);
    if (!context) {
        throw new Error('usePrescription must be used within a PrescriptionProvider');
    }
    return context;
};

export const PrescriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPrescriptions = useCallback(async (patientId: string) => {
        setLoading(true);
        try {
            const response = await prescriptionsAPI.getAllByPatient(patientId);
            const mapped = (response.data || []).map((p: any) => ({
                id: p._id,
                patientId: p.patientId,
                drugs: p.drugs,
                notes: p.notes,
                date: new Date(p.date)
            }));
            setPrescriptions(mapped);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const addPrescription = async (data: Omit<Prescription, 'id' | 'date'>) => {
        try {
            const response = await prescriptionsAPI.create(data);
            const newPrescription = {
                id: response.data._id,
                ...response.data,
                date: new Date(response.data.date)
            };
            setPrescriptions(prev => [newPrescription, ...prev]);
        } catch (error) {
            console.error('Error adding prescription:', error);
            throw error;
        }
    };

    const deletePrescription = async (id: string) => {
        try {
            await prescriptionsAPI.delete(id);
            setPrescriptions(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting prescription:', error);
            throw error;
        }
    };

    return (
        <PrescriptionContext.Provider value={{ prescriptions, loading, fetchPrescriptions, addPrescription, deletePrescription }}>
            {children}
        </PrescriptionContext.Provider>
    );
};
