import api from './Client';

export const PatientService = {
    getAll: () => api.get('/patients'),
    getById: (id: string) => api.get(`/patients/${id}`),
    create: (data: any) => api.post('/patients', data),
    update: (id: string, data: any) => api.put(`/patients/${id}`, data),
    delete: (id: string) => api.delete(`/patients/${id}`),
    getLogs: (id: string) => api.get(`/patients/${id}/logs`)
};
