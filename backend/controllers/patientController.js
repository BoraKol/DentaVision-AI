const patientService = require('../services/patientService');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
const getPatients = async (req, res, next) => {
    try {
        const patients = await patientService.getAllPatients(req.user.clinicName);
        res.json(patients);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
const getPatient = async (req, res, next) => {
    try {
        const patient = await patientService.getPatientById(req.params.id, req.user.clinicName);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(patient);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a patient
// @route   POST /api/patients
// @access  Private
const createPatient = async (req, res, next) => {
    try {
        const patient = await patientService.createPatient(req.body, req.user);
        res.status(201).json(patient);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a patient
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = async (req, res, next) => {
    try {
        const patient = await patientService.updatePatient(req.params.id, req.user.clinicName, req.body);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(patient);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a patient
// @route   DELETE /api/patients/:id
// @access  Private
const deletePatient = async (req, res, next) => {
    try {
        const patient = await patientService.deletePatient(req.params.id, req.user._id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient
};
