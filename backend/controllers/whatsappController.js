const ErrorResponse = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const whatsappService = require('../services/whatsappService');
const communicationLogRepository = require('../repositories/CommunicationLogRepository');
const patientRepository = require('../repositories/PatientRepository');
const geminiService = require('../services/geminiService');

/**
 * @desc    Receive incoming WhatsApp message (Webhook)
 * @route   POST /api/whatsapp/webhook
 * @access  Public
 */
exports.receiveWebhook = catchAsync(async (req, res, next) => {
    const { patientId, phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
        return next(new ErrorResponse('Telefon numarası ve mesaj zorunludur', 400));
    }

    // 1. Find Patient to construct context (using Repository)
    let patient;
    if (patientId) {
        patient = await patientRepository.findById(patientId);
    } else {
        patient = await patientRepository.findByPhone(phoneNumber);
    }

    // 2. Record Inbound Message (delegated to Service)
    await whatsappService.recordInboundMessage(
        patient ? patient._id : null,
        phoneNumber,
        message
    );

    // 3. Analyze with Gemini and Auto-Reply if patient is known
    if (patient) {
        console.log(`[WA BOT] Analyzing message from ${patient.name}...`);
        const aiReply = await geminiService.analyzePatientMessage(message, patient);
        
        // 4. Send Auto-Reply (delegated to Service)
        await whatsappService.sendMessage(patient._id, phoneNumber, aiReply);
    }

    res.status(200).json({ success: true, message: 'Webhook processed' });
});

/**
 * @desc    Send a WhatsApp message manually from Dashboard
 * @route   POST /api/whatsapp/send
 * @access  Private 
 */
exports.sendMessage = catchAsync(async (req, res, next) => {
    const { patientId, message } = req.body;

    const patient = await patientRepository.findById(patientId);
    if (!patient) {
        return next(new ErrorResponse('Hasta bulunamadı', 404));
    }

    if (!patient.phone) {
        return next(new ErrorResponse('Hastanın kayıtlı telefon numarası yok', 400));
    }

    const success = await whatsappService.sendMessage(patient._id, patient.phone, message);

    if (!success) {
        return next(new ErrorResponse('Mesaj gönderilemedi', 500));
    }

    res.status(200).json({ success: true, message: 'Mesaj gönderildi' });
});

/**
 * @desc    Get Chat History for a Patient
 * @route   GET /api/whatsapp/:patientId/history
 * @access  Private 
 */
exports.getChatHistory = catchAsync(async (req, res, next) => {
    const logs = await communicationLogRepository.findByType(req.params.patientId, 'WHATSAPP');

    res.status(200).json({
        success: true,
        count: logs.length,
        data: logs
    });
});

