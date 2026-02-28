import api from './Client';
import { AuthService } from './AuthService';
import { PatientService } from './PatientService';
import { AppointmentService } from './AppointmentService';
import { TreatmentService, PrescriptionService } from './TreatmentService';
import { FinancialService } from './FinancialService';
import { InventoryService, LabJobService } from './InventoryService';
import { PhotoService, EnabizService, PortalService } from './PhotoService';

export {
    api,
    AuthService,
    PatientService,
    AppointmentService,
    TreatmentService,
    PrescriptionService,
    FinancialService,
    InventoryService,
    LabJobService,
    PhotoService,
    EnabizService,
    PortalService
};

// Backward compatibility exports
export const authAPI = AuthService;
export const patientsAPI = PatientService;
export const appointmentsAPI = AppointmentService;
export const treatmentsAPI = TreatmentService;
export const prescriptionsAPI = PrescriptionService;
export const financialsAPI = FinancialService;
export const inventoryAPI = InventoryService;
export const labJobsAPI = LabJobService;
export const photosAPI = PhotoService;
export const enabizAPI = EnabizService;
export const portalAPI = PortalService;

export default api;

