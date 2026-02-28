import api from './Client';

export const FinancialService = {
    getAll: (params?: any) => api.get('/financials', { params }),
    create: (data: any) => api.post('/financials', data),
    delete: (id: string) => api.delete(`/financials/${id}`),
    getStats: () => api.get('/financials/stats'),
    generateInvoice: (id: string) => api.post(`/financials/${id}/invoice`)
};
