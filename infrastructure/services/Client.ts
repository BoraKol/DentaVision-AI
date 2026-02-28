import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - Add token to headers
api.interceptors.request.use(
    (config) => {
        const isPortalRequest = config.url?.includes('/portal');
        let token;

        if (isPortalRequest) {
            token = localStorage.getItem('patientToken');
        } else {
            token = localStorage.getItem('token');
        }

        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle errors and standardize data
api.interceptors.response.use(
    (response) => {
        if (response.data && response.data.success === true && response.data.data !== undefined) {
            return { ...response, data: response.data.data };
        }
        return response;
    },
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

export default api;
