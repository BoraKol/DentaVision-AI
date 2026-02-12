const patientService = require('../services/patientService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const CommunicationLog = require('../models/CommunicationLog');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
const getPatients = catchAsync(async (req, res, next) => {
    const patients = await patientService.getAllPatients(req.user.clinicName);
    res.json(patients);
});

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
const getPatient = catchAsync(async (req, res, next) => {
    const patient = await patientService.getPatientById(req.params.id, req.user.clinicName);
    if (!patient) {
        return next(new AppError('Patient not found', 404));
    }
    res.json(patient);
});

// @desc    Create a patient
// @route   POST /api/patients
// @access  Private
const createPatient = catchAsync(async (req, res, next) => {
    const patient = await patientService.createPatient(req.body, req.user);
    res.status(201).json(patient);
});

// @desc    Update a patient
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = catchAsync(async (req, res, next) => {
    const patient = await patientService.updatePatient(req.params.id, req.user.clinicName, req.body);
    if (!patient) {
        return next(new AppError('Patient not found', 404));
    }
    res.json(patient);
});

// @desc    Delete a patient
// @route   DELETE /api/patients/:id
// @access  Private
const deletePatient = catchAsync(async (req, res, next) => {
    const patient = await patientService.deletePatient(req.params.id, req.user._id);
    if (!patient) {
        return next(new AppError('Patient not found', 404));
    }
    res.json({ message: 'Patient deleted successfully' });
});

// @desc    Get communication logs for a patient
// @route   GET /api/patients/:id/communication-logs
// @access  Private
const getCommunicationLogs = catchAsync(async (req, res, next) => {
    const logs = await CommunicationLog.find({ patientId: req.params.id }).sort({ sentAt: -1 });
    res.json({
        success: true,
        count: logs.length,
        data: logs
    });
});

module.exports = {
    getPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient,
    getCommunicationLogs
};
