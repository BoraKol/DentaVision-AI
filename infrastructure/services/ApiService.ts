import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - Add token to headers
// Request interceptor - Add token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        // Only add token if not already present (allows overriding for patient portal)
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isPortalRequest = error.config.url?.includes('/portal');

            if (isPortalRequest) {
                localStorage.removeItem('patientToken');
                localStorage.removeItem('patientUser');
                if (window.location.pathname !== '/portal/login') {
                    window.location.href = '/portal/login';
                }
            } else {
                // Doctor/Admin Token expired
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data: {
        email: string;
        password: string;
        name: string;
        title?: string;
        specialty?: string;
        clinicName?: string;
    }) => api.post('/auth/register', data),

    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),

    getMe: () => api.get('/auth/me'),

    updateProfile: (data: any) => api.put('/auth/me', data)
};

// Patients API
export const patientsAPI = {
    getAll: () => api.get('/patients'),

    getById: (id: string) => api.get(`/patients/${id}`),

    create: (data: any) => api.post('/patients', data),

    update: (id: string, data: any) => api.put(`/patients/${id}`, data),

    delete: (id: string) => api.delete(`/patients/${id}`),

    getLogs: (id: string) => api.get(`/patients/${id}/logs`)
};

// Appointments API
export const appointmentsAPI = {
    getAll: () => api.get('/appointments'),

    getByDate: (date: string) => api.get(`/appointments/date/${date}`),

    getById: (id: string) => api.get(`/appointments/${id}`),

    create: (data: any) => api.post('/appointments', data),

    update: (id: string, data: any) => api.put(`/appointments/${id}`, data),

    delete: (id: string) => api.delete(`/appointments/${id}`)
};

// Treatments API
export const treatmentsAPI = {
    getAllByPatient: (patientId: string) => api.get(`/treatments/${patientId}`),

    create: (data: any) => api.post('/treatments', data),

    updateStatus: (id: string, status: string) => api.patch(`/treatments/${id}`, { status }),

    delete: (id: string) => api.delete(`/treatments/${id}`)
};

// Prescriptions API
export const prescriptionsAPI = {
    getAllByPatient: (patientId: string) => api.get(`/prescriptions/${patientId}`),

    create: (data: any) => api.post('/prescriptions', data),

    delete: (id: string) => api.delete(`/prescriptions/${id}`)
};

// Financials API
export const financialsAPI = {
    getAll: (params?: any) => api.get('/financials', { params }),

    create: (data: any) => api.post('/financials', data),

    delete: (id: string) => api.delete(`/financials/${id}`),

    getStats: () => api.get('/financials/stats')
};

// Inventory API
export const inventoryAPI = {
    getAll: () => api.get('/inventory'),
    create: (data: any) => api.post('/inventory', data),
    update: (id: string, data: any) => api.put(`/inventory/${id}`, data),
    delete: (id: string) => api.delete(`/inventory/${id}`),
    addTransaction: (id: string, data: any) => api.post(`/inventory/${id}/transaction`, data)
};

// Lab Tracking API
export const labJobsAPI = {
    getAll: () => api.get('/lab-jobs'),
    create: (data: any) => api.post('/lab-jobs', data),
    update: (id: string, data: any) => api.put(`/lab-jobs/${id}`, data),
    delete: (id: string) => api.delete(`/lab-jobs/${id}`)
};

// Photos API
export const photosAPI = {
    getAllByPatient: (patientId: string) => api.get(`/photos/patient/${patientId}`),
    upload: (patientId: string, formData: FormData) => {
        // Ensure patientId is in the formData
        if (!formData.has('patientId')) {
            formData.append('patientId', patientId);
        }
        return api.post('/photos', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    delete: (id: string) => api.delete(`/photos/${id}`)
};

// E-Nabız API
export const enabizAPI = {
    sendTreatment: (data: { patientId: string; treatmentData: any }) => api.post('/enabiz/treatment', data),
    getLogs: (patientId: string) => api.get(`/enabiz/logs/${patientId}`)
};

export default api;
