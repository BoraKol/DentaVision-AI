const treatmentService = require('../services/treatmentService');

// @desc    Get all treatments for a patient
// @route   GET /api/treatments/:patientId
// @access  Private
const getTreatments = async (req, res, next) => {
    try {
        const treatments = await treatmentService.getTreatmentsByPatient(req.params.patientId, req.user.clinicName);
        res.json(treatments);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a treatment
// @route   POST /api/treatments
// @access  Private
const createTreatment = async (req, res, next) => {
    try {
        const treatment = await treatmentService.createTreatment(req.body, req.user);
        res.status(201).json(treatment);
    } catch (error) {
        next(error);
    }
};

// @desc    Update treatment status
// @route   PATCH /api/treatments/:id
// @access  Private
const updateTreatmentStatus = async (req, res, next) => {
    try {
        const treatment = await treatmentService.updateTreatmentStatus(req.params.id, req.user.clinicName, req.body.status);
        if (!treatment) {
            return res.status(404).json({ message: 'Treatment not found' });
        }
        res.json(treatment);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a treatment
// @route   DELETE /api/treatments/:id
// @access  Private
const deleteTreatment = async (req, res, next) => {
    try {
        const treatment = await treatmentService.deleteTreatment(req.params.id, req.user.clinicName);
        if (!treatment) {
            return res.status(404).json({ message: 'Treatment not found' });
        }
        res.json({ message: 'Treatment deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTreatments,
    createTreatment,
    updateTreatmentStatus,
    deleteTreatment
};
