import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Appointment, AppointmentStatus } from '../../core/domain/entities/Appointment';
import { appointmentsAPI } from '../../infrastructure/services/ApiService';
import { useAuth } from './AuthContext';

interface AppointmentContextType {
    appointments: Appointment[];
    addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Appointment;
    updateAppointment: (id: string, updates: Partial<Appointment>) => void;
    deleteAppointment: (id: string) => void;
    getAppointmentsByDate: (date: Date) => Appointment[];
    getAppointmentsByPatient: (patientId: string) => Appointment[];
    getUpcomingAppointments: (limit?: number) => Appointment[];
    getTodaysAppointments: () => Appointment[];
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

const STORAGE_KEY = 'dentavision_appointments';

export const useAppointment = () => {
    const context = useContext(AppointmentContext);
    if (!context) {
        throw new Error('useAppointment must be used within an AppointmentProvider');
    }
    return context;
};

export const AppointmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const { user } = useAuth();

    const fetchAppointments = useCallback(async () => {
        if (!user) return;
        try {
            const response = await appointmentsAPI.getAll();
            if (!Array.isArray(response.data)) {
                console.error('Expected array from API but got:', typeof response.data);
                setAppointments([]);
                return;
            }
            const appointmentsData = response.data.map((a: any) => ({
                ...a,
                id: a._id, // Map MongoDB _id
                date: new Date(a.date),
                createdAt: new Date(a.createdAt),
                updatedAt: new Date(a.updatedAt)
            }));
            setAppointments(appointmentsData);
        } catch (error) {
            console.error('Failed to fetch appointments', error);
        }
    }, [user]);

    // Load from API on mount
    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const addAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            // Ensure date is string format expected by backend if needed, or JS Date object handling
            // Backend model expects date as String but we are passing Date object in current structure
            // Let's ensure consistency. Backend model says date: String. 
            // In frontend it creates with new Date(). 
            // We should format the date before sending
            const payload = {
                ...appointmentData,
                date: new Date(appointmentData.date).toDateString() // Or ISOString depending on needs
            };

            const response = await appointmentsAPI.create(payload);
            const newAppointment = {
                ...response.data,
                id: response.data._id, // Map MongoDB _id
                date: new Date(response.data.date), // Convert back to Date object
                createdAt: new Date(response.data.createdAt),
                updatedAt: new Date(response.data.updatedAt)
            };

            setAppointments(prev => [...prev, newAppointment]);
            return newAppointment;
        } catch (error) {
            console.error('Failed to create appointment', error);
            throw error;
        }
    }, []);

    const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>) => {
        try {
            const response = await appointmentsAPI.update(id, updates);
            const updatedAppointment = {
                ...response.data,
                id: response.data._id, // Map MongoDB _id
                date: new Date(response.data.date),
                createdAt: new Date(response.data.createdAt),
                updatedAt: new Date(response.data.updatedAt)
            };

            setAppointments(prev => prev.map(a =>
                a.id === id
                    ? updatedAppointment
                    : a
            ));
        } catch (error) {
            console.error('Failed to update appointment', error);
            throw error;
        }
    }, []);

    const deleteAppointment = useCallback(async (id: string) => {
        try {
            await appointmentsAPI.delete(id);
            setAppointments(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error('Failed to delete appointment', error);
            throw error;
        }
    }, []);

    const getAppointmentsByDate = useCallback((date: Date): Appointment[] => {
        const targetDate = date.toDateString();
        return appointments.filter(a => new Date(a.date).toDateString() === targetDate);
    }, [appointments]);

    const getAppointmentsByPatient = useCallback((patientId: string): Appointment[] => {
        // Since we populate patientId in backend, it might be an object now. 
        // Need to check how it's returned.
        // Backend populate('patientId', 'name') makes patientId an object { _id, name }
        // BUT the Appointment interface in frontend might expect patientId as string
        // We need to be careful with types here. 
        // For filtering, we might need to check _id if it's an object, or just string
        return appointments.filter(a => {
            if (typeof a.patientId === 'object' && a.patientId !== null) {
                return (a.patientId as any)._id === patientId;
            }
            return a.patientId === patientId;
        });
    }, [appointments]);

    const getUpcomingAppointments = useCallback((limit = 5): Appointment[] => {
        const now = new Date();
        return appointments
            .filter(a => new Date(a.date) >= now && a.status !== 'cancelled')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, limit);
    }, [appointments]);

    const getTodaysAppointments = useCallback((): Appointment[] => {
        const today = new Date().toDateString();
        return appointments
            .filter(a => new Date(a.date).toDateString() === today)
            .sort((a, b) => a.time.localeCompare(b.time));
    }, [appointments]);

    return (
        <AppointmentContext.Provider value={{
            appointments,
            addAppointment: addAppointment as any,
            updateAppointment,
            deleteAppointment,
            getAppointmentsByDate,
            getAppointmentsByPatient,
            getUpcomingAppointments,
            getTodaysAppointments
        }}>
            {children}
        </AppointmentContext.Provider>
    );
};
