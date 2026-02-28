import api from './Client';

export const InventoryService = {
    getAll: () => api.get('/inventory'),
    create: (data: any) => api.post('/inventory', data),
    update: (id: string, data: any) => api.put(`/inventory/${id}`, data),
    delete: (id: string) => api.delete(`/inventory/${id}`),
    addTransaction: (id: string, data: any) => api.post(`/inventory/${id}/transaction`, data)
};

export const LabJobService = {
    getAll: () => api.get('/lab-jobs'),
    create: (data: any) => api.post('/lab-jobs', data),
    update: (id: string, data: any) => api.put(`/lab-jobs/${id}`, data),
    delete: (id: string) => api.delete(`/lab-jobs/${id}`)
};
