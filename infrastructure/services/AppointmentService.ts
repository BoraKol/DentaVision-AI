import api from './Client';

export const AppointmentService = {
    getAll: () => api.get('/appointments'),
    getByDate: (date: string) => api.get(`/appointments/date/${date}`),
    getById: (id: string) => api.get(`/appointments/${id}`),
    create: (data: any) => api.post('/appointments', data),
    update: (id: string, data: any) => api.put(`/appointments/${id}`, data),
    delete: (id: string) => api.delete(`/appointments/${id}`)
};
