import { Patient } from './Patient';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
    id: string;
    patientId: string;
    patientName: string;
    date: Date;
    time: string; // HH:mm format
    duration: number; // in minutes
    procedure: string;
    notes?: string;
    status: AppointmentStatus;
    reminderSent?: boolean;
    userId?: { _id: string; name: string; title: string } | string;
    createdAt: Date;
    updatedAt: Date;
}
