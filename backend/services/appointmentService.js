const Appointment = require('../models/Appointment');

class AppointmentService {
    async getAllAppointments(clinicName) {
        return await Appointment.find({ clinicName })
            .populate('patientId', 'name')
            .populate('userId', 'name title')
            .sort({ date: 1, time: 1 });
    }

    async getAppointmentsByDate(clinicName, date) {
        return await Appointment.find({
            clinicName,
            date
        })
        .populate('patientId', 'name')
        .populate('userId', 'name title')
        .sort({ time: 1 });
    }

    async getAppointmentById(id, clinicName) {
        return await Appointment.findOne({
            _id: id,
            clinicName
        }).populate('patientId', 'name').populate('userId', 'name title');
    }

    async createAppointment(data, user) {
        const appointment = await Appointment.create({
            ...data,
            userId: user._id,
            clinicName: user.clinicName
        });

        return await appointment.populate([
            { path: 'patientId', select: 'name' },
            { path: 'userId', select: 'name title' }
        ]);
    }

    async updateAppointment(id, clinicName, data) {
        return await Appointment.findOneAndUpdate(
            { _id: id, clinicName },
            data,
            { new: true, runValidators: true }
        ).populate('patientId', 'name').populate('userId', 'name title');
    }

    async deleteAppointment(id) {
        return await Appointment.findOneAndDelete({ _id: id });
    }
}

module.exports = new AppointmentService();
