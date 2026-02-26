const appointmentService = require('../services/appointmentService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 0;
    const skip = (page - 1) * limit;

    const appointments = await appointmentService.getAllAppointments(req.user.clinicName, skip, limit);
    res.json(appointments);
});

// @desc    Get appointments by date
// @route   GET /api/appointments/date/:date
// @access  Private
const getAppointmentsByDate = catchAsync(async (req, res, next) => {
    const appointments = await appointmentService.getAppointmentsByDate(req.user.clinicName, req.params.date);
    res.json(appointments);
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = catchAsync(async (req, res, next) => {
    const appointment = await appointmentService.getAppointmentById(req.params.id, req.user.clinicName);
    if (!appointment) {
        return next(new AppError('Appointment not found', 404));
    }
    res.json(appointment);
});

const eventBus = require('../events/eventBus');

// @desc    Create an appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = catchAsync(async (req, res, next) => {
    const appointment = await appointmentService.createAppointment(req.body, req.user);
    
    // Trigger Event Bus
    eventBus.emit('APPOINTMENT_CREATED', { appointment });

    res.status(201).json(appointment);
});

// @desc    Update an appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = catchAsync(async (req, res, next) => {
    const appointment = await appointmentService.updateAppointment(req.params.id, req.user.clinicName, req.body);
    if (!appointment) {
        return next(new AppError('Appointment not found', 404));
    }

    // Trigger Cancellation Event if status is cancelled
    if (req.body.status === 'cancelled') {
         eventBus.emit('APPOINTMENT_CANCELLED', { appointment });
    }

    res.json(appointment);
});

// @desc    Delete an appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = catchAsync(async (req, res, next) => {
    const appointment = await appointmentService.deleteAppointment(req.params.id);
    if (!appointment) {
        return next(new AppError('Appointment not found', 404));
    }
    res.json({ message: 'Appointment deleted successfully' });
});

module.exports = {
    getAppointments,
    getAppointmentsByDate,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment
};
