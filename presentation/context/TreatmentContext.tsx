import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { TreatmentItem } from '../../core/domain/entities/TreatmentPlan';

interface TreatmentContextType {
    items: TreatmentItem[];
    loading: boolean;
    fetchTreatments: (patientId: string) => Promise<void>;
    addItem: (patientId: string, item: Omit<TreatmentItem, 'id' | 'status'>) => Promise<void>;
    updateItemStatus: (id: string, status: string) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    clearPlan: () => void;
}

import { treatmentsAPI } from '../../infrastructure/services/ApiService';

const TreatmentContext = createContext<TreatmentContextType | undefined>(undefined);

export const useTreatment = () => {
    const context = useContext(TreatmentContext);
    if (!context) {
        throw new Error('useTreatment must be used within a TreatmentProvider');
    }
    return context;
};

export const TreatmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<TreatmentItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTreatments = useCallback(async (patientId: string) => {
        setLoading(true);
        try {
            const response = await treatmentsAPI.getAllByPatient(patientId);

            // Map MongoDB _id to id for frontend compatibility
            const mappedItems = (response.data || []).map((item: any) => ({
                ...item,
                id: item._id
            }));
            setItems(mappedItems);
        } catch (error) {
            console.error('Error fetching treatments:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const addItem = useCallback(async (patientId: string, newItem: Omit<TreatmentItem, 'id' | 'status'>) => {
        try {
            const response = await treatmentsAPI.create({
                ...newItem,
                patientId,
                status: 'pending'
            });
            const createdItem = { ...response.data, id: response.data._id };
            setItems(prev => [...prev, createdItem]);
        } catch (error) {
            console.error('Error adding treatment:', error);
        }
    }, []);

    const updateItemStatus = useCallback(async (id: string, status: string) => {
        try {
            await treatmentsAPI.updateStatus(id, status);
            setItems(prev => prev.map(item => item.id === id ? { ...item, status: status as any } : item));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }, []);

    const deleteItem = useCallback(async (id: string) => {
        try {
            await treatmentsAPI.delete(id);
            setItems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting treatment:', error);
        }
    }, []);

    const clearPlan = () => {
        setItems([]);
    };

    return (
        <TreatmentContext.Provider value={{ items, loading, fetchTreatments, addItem, updateItemStatus, deleteItem, clearPlan }}>
            {children}
        </TreatmentContext.Provider>
    );
};
