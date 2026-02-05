const appointmentService = require('../services/appointmentService');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
    try {
        const appointments = await appointmentService.getAllAppointments(req.user.clinicName);
        res.json(appointments);
    } catch (error) {
        next(error);
    }
};

// @desc    Get appointments by date
// @route   GET /api/appointments/date/:date
// @access  Private
const getAppointmentsByDate = async (req, res, next) => {
    try {
        const appointments = await appointmentService.getAppointmentsByDate(req.user.clinicName, req.params.date);
        res.json(appointments);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res, next) => {
    try {
        const appointment = await appointmentService.getAppointmentById(req.params.id, req.user.clinicName);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(appointment);
    } catch (error) {
        next(error);
    }
};

// @desc    Create an appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res, next) => {
    try {
        const appointment = await appointmentService.createAppointment(req.body, req.user);
        res.status(201).json(appointment);
    } catch (error) {
        next(error);
    }
};

// @desc    Update an appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res, next) => {
    try {
        const appointment = await appointmentService.updateAppointment(req.params.id, req.user.clinicName, req.body);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(appointment);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res, next) => {
    try {
        const appointment = await appointmentService.deleteAppointment(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAppointments,
    getAppointmentsByDate,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment
};
