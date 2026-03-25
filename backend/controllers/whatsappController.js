const ErrorResponse = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const whatsappService = require('../services/whatsappService');
const communicationLogRepository = require('../repositories/CommunicationLogRepository');
const patientRepository = require('../repositories/PatientRepository');
const geminiService = require('../services/geminiService');

/**
 * @desc    Get WhatsApp connection status & QR code
 * @route   GET /api/whatsapp/status
 * @access  Private
 */
exports.getStatus = catchAsync(async (req, res, next) => {
    const status = whatsappService.getStatus();
    res.status(200).json({ success: true, data: status });
});

/**
 * @desc    Initialize WhatsApp connection (generates QR code)
 * @route   POST /api/whatsapp/connect
 * @access  Private
 */
exports.connect = catchAsync(async (req, res, next) => {
    whatsappService.connect();
    
    // Wait a bit for QR code to generate
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const status = whatsappService.getStatus();
    res.status(200).json({ 
        success: true, 
        message: 'WhatsApp bağlantısı başlatıldı. QR kodu tarayın.',
        data: status 
    });
});

/**
 * @desc    Disconnect WhatsApp session
 * @route   POST /api/whatsapp/disconnect
 * @access  Private
 */
exports.disconnect = catchAsync(async (req, res, next) => {
    await whatsappService.disconnect();
    res.status(200).json({ success: true, message: 'WhatsApp bağlantısı kesildi.' });
});

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

    let patient;
    if (patientId) {
        patient = await patientRepository.findById(patientId);
    } else {
        patient = await patientRepository.findByPhone(phoneNumber);
    }

    await whatsappService.recordInboundMessage(
        patient ? patient._id : null,
        phoneNumber,
        message
    );

    if (patient) {
        console.log(`[WA BOT] Analyzing message from ${patient.name}...`);
        const aiReply = await geminiService.analyzePatientMessage(message, patient);
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
        return next(new ErrorResponse('Mesaj gönderilemedi. WhatsApp bağlantısını kontrol edin.', 500));
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

