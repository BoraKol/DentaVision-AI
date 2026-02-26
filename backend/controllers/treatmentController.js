const treatmentService = require('../services/treatmentService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Get all treatments for a patient
// @route   GET /api/treatments/:patientId
// @access  Private
const getTreatments = catchAsync(async (req, res, next) => {
    let clinicName;

    // Check if request is from a patient
    if (req.patient) {
        // Security check: Patient can only access their own treatments
        if (req.patient._id.toString() !== req.params.patientId) {
            return next(new AppError('Not authorized to view these treatments', 403));
        }
        clinicName = req.patient.clinicName;
    } else if (req.user) {
        // Request from doctor/admin
        clinicName = req.user.clinicName;
    } else {
        return next(new AppError('Not authorized', 401));
    }

    const treatments = await treatmentService.getTreatmentsByPatient(req.params.patientId, clinicName);
    res.json(treatments);
});

// @desc    Create a treatment
// @route   POST /api/treatments
// @access  Private
const createTreatment = catchAsync(async (req, res, next) => {
    const treatment = await treatmentService.createTreatment(req.body, req.user);
    res.status(201).json(treatment);
});

// @desc    Update treatment status
// @route   PATCH /api/treatments/:id
// @access  Private
const updateTreatmentStatus = catchAsync(async (req, res, next) => {
    const treatment = await treatmentService.updateTreatmentStatus(req.params.id, req.user.clinicName, req.body.status);
    if (!treatment) {
        return next(new AppError('Treatment not found', 404));
    }
    res.json(treatment);
});

// @desc    Delete a treatment
// @route   DELETE /api/treatments/:id
// @access  Private
const deleteTreatment = catchAsync(async (req, res, next) => {
    const treatment = await treatmentService.deleteTreatment(req.params.id, req.user.clinicName);
    if (!treatment) {
        return next(new AppError('Treatment not found', 404));
    }
    res.json({ message: 'Treatment deleted successfully' });
});

module.exports = {
    getTreatments,
    createTreatment,
    updateTreatmentStatus,
    deleteTreatment
};
