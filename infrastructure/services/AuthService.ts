import api from './Client';

export const AuthService = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: { email: string; password: string }) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data: any) => api.put('/auth/me', data),
    getGeminiKey: () => api.get('/auth/api-key')
};
