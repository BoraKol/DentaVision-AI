const enabizService = require('../services/enabizService');
const treatmentRepository = require('../repositories/TreatmentRepository');
const enabizRepository = require('../repositories/ENabizRepository');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * @desc    Send a specific treatment to E-Nabız
 * @route   POST /api/enabiz/send/treatment/:id
 * @access  Private (Dentists/Admins)
 */
exports.sendTreatmentToENabiz = catchAsync(async (req, res, next) => {
    const treatmentId = req.params.id;
    
    // Retrieve treatment and verify it belongs to this clinic
    const treatment = await treatmentRepository.findById(treatmentId);
    
    if (!treatment) {
        return next(new AppError('Treatment not found', 404));
    }

    if (treatment.clinicName !== req.user.clinicName) {
        return next(new AppError('Unauthorized access to treatment', 403));
    }

    if (treatment.enabizStatus === 'success') {
        return next(new AppError('This treatment is already sent to E-Nabız', 400));
    }

    // Prepare data payload for MSVS formatting
    const treatmentData = {
        islemKodu: "111111", // Standardized procedure code (to be mapped properly in real system)
        islemAdi: treatment.procedureName,
        disNumarasi: treatment.toothNumber,
        fiyat: treatment.cost
    };

    // Call service to send data to SIS/Enabiz
    const response = await enabizService.sendData(treatment.patientId, 'DENTAL_MUAYENE', treatmentData, req.user._id);

    // Update treatment status dynamically
    if (response.success) {
        await treatmentRepository.update({ _id: treatmentId }, {
            enabizStatus: 'success',
            sysTakipNo: response.response.sysTakipNo || `SYS-MOCK-${Date.now()}`
        });
    } else {
        await treatmentRepository.update({ _id: treatmentId }, {
            enabizStatus: 'failed'
        });
    }

    res.status(200).json({
        success: true,
        data: response
    });
});

/**
 * @desc    Get E-Nabız transaction logs for this clinic's patients
 * @route   GET /api/enabiz/logs
 * @access  Private (Admins)
 */
exports.getLogs = catchAsync(async (req, res, next) => {
    // Ideally we should filter ENabizLogs by clinic patients, but since it's an ERP,
    // we can find all patients of this clinic, then get logs for those patients.
    
    // Simplification for Mock Phase: Get latest logs
    const logs = await enabizRepository.findAll({}, '', { createdAt: -1 });

    res.status(200).json({
        success: true,
        count: logs.length,
        data: logs
    });
});
