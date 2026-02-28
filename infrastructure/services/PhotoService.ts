import api from './Client';

export const PhotoService = {
    getAllByPatient: (patientId: string) => api.get(`/photos/patient/${patientId}`),
    upload: (patientId: string, formData: FormData) => {
        if (!formData.has('patientId')) {
            formData.append('patientId', patientId);
        }
        return api.post('/photos', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    delete: (id: string) => api.delete(`/photos/${id}`)
};

export const EnabizService = {
    sendTreatment: (data: { patientId: string; treatmentData: any }) => api.post('/enabiz/treatment', data),
    getLogs: (patientId: string) => api.get(`/enabiz/logs/${patientId}`)
};

export const PortalService = {
    getAvailableSlots: (date: string) => api.get(`/portal/available-slots?date=${date}`),
    bookAppointment: (data: { date: string; time: string; procedure: string; notes?: string }) => api.post('/portal/book-appointment', data)
};
