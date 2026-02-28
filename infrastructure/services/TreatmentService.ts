import api from './Client';

export const TreatmentService = {
    getAllByPatient: (patientId: string) => api.get(`/treatments/${patientId}`),
    create: (data: any) => api.post('/treatments', data),
    updateStatus: (id: string, status: string) => api.patch(`/treatments/${id}`, { status }),
    delete: (id: string) => api.delete(`/treatments/${id}`)
};

export const PrescriptionService = {
    getAllByPatient: (patientId: string) => api.get(`/prescriptions/${patientId}`),
    create: (data: any) => api.post('/prescriptions', data),
    delete: (id: string) => api.delete(`/prescriptions/${id}`)
};
