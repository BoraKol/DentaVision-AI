const appointmentRepository = require('../repositories/AppointmentRepository');

class AppointmentService {
    async getAllAppointments(clinicName, skip = 0, limit = 0) {
        return await appointmentRepository.findAll(
            { clinicName },
            [{ path: 'patientId', select: 'name' }, { path: 'userId', select: 'name title' }],
            { date: 1, time: 1 },
            skip,
            limit
        );
    }

    async getAppointmentsByDate(clinicName, date) {
        return await appointmentRepository.findAll(
            { clinicName, date },
            [{ path: 'patientId', select: 'name' }, { path: 'userId', select: 'name title' }],
            { time: 1 }
        );
    }

    async getAppointmentById(id, clinicName) {
        return await appointmentRepository.findOne(
            { _id: id, clinicName },
            [{ path: 'patientId', select: 'name' }, { path: 'userId', select: 'name title' }]
        );
    }

    async createAppointment(data, user) {
        let appointment = await appointmentRepository.create({
            ...data,
            userId: user._id,
            clinicName: user.clinicName
        });

        return await appointment.populate([
            { path: 'patientId', select: 'name phone' },
            { path: 'userId', select: 'name title' }
        ]);
    }

    async updateAppointment(id, clinicName, data) {
        const appointment = await appointmentRepository.update(
            { _id: id, clinicName },
            data
        );
        
        if (appointment) {
            return await appointment.populate([
                { path: 'patientId', select: 'name phone' },
                { path: 'userId', select: 'name title' }
            ]);
        }
        return null;
    }

    async deleteAppointment(id) {
        return await appointmentRepository.delete({ _id: id });
    }
}

module.exports = new AppointmentService();
