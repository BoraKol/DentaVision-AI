const patientService = require('../services/patientService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendResponse } = require('../utils/apiResponse');
const eventBus = require('../events/eventBus');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
const getPatients = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 0; // default 0 ensures all records are returned unless requested
    const skip = (page - 1) * limit;

    const patients = await patientService.getAllPatients(req.user.clinicName, skip, limit);
    sendResponse(res, 200, patients, 'Patients retrieved successfully');
});

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
const getPatient = catchAsync(async (req, res, next) => {
    const patient = await patientService.getPatientById(req.params.id, req.user.clinicName);
    if (!patient) {
        return next(new AppError('Patient not found', 404));
    }
    sendResponse(res, 200, patient, 'Patient details retrieved');
});

// @desc    Create a patient
// @route   POST /api/patients
// @access  Private
const createPatient = catchAsync(async (req, res, next) => {
    const patient = await patientService.createPatient(req.body, req.user);
    
    // Trigger Event Bus
    eventBus.emit('PATIENT_CREATED', { patient, user: req.user });

    sendResponse(res, 201, patient, 'Patient created successfully');
});

// @desc    Update a patient
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = catchAsync(async (req, res, next) => {
    const patient = await patientService.updatePatient(req.params.id, req.user.clinicName, req.body);
    if (!patient) {
        return next(new AppError('Patient not found', 404));
    }
    sendResponse(res, 200, patient, 'Patient updated successfully');
});

// @desc    Delete a patient
// @route   DELETE /api/patients/:id
// @access  Private
const deletePatient = catchAsync(async (req, res, next) => {
    const patient = await patientService.deletePatient(req.params.id, req.user._id);
    if (!patient) {
        return next(new AppError('Patient not found', 404));
    }
    sendResponse(res, 200, null, 'Patient deleted successfully');
});

// @desc    Get communication logs for a patient
// @route   GET /api/patients/:id/communication-logs
// @access  Private
const getCommunicationLogs = catchAsync(async (req, res, next) => {
    const logs = await patientService.getPatientCommunicationLogs(req.params.id);
    sendResponse(res, 200, logs, 'Communication logs retrieved');
});

// @desc    Generate a Consent PDF
// @route   POST /api/patients/:id/consent
// @access  Private
const generateConsent = catchAsync(async (req, res, next) => {
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const result = await patientService.generateConsentPdf(req.params.id, req.user.clinicName, req.body, userIp);
    sendResponse(res, 201, result, 'Consent form successfully generated');
});

module.exports = {
    getPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient,
    getCommunicationLogs,
    generateConsent
};
