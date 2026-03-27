const recallService = require('../services/recallService');
const whatsappService = require('../services/whatsappService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * @desc    Get all patients who haven't visited in X days
 * @route   GET /api/recall/candidates?days=180
 * @access  Private
 */
exports.getRecallCandidates = catchAsync(async (req, res, next) => {
    const thresholdDays = parseInt(req.query.days) || 180;
    const candidates = await recallService.getRecallCandidates(req.user.clinicName, thresholdDays);

    res.status(200).json({
        success: true,
        count: candidates.length,
        thresholdDays,
        data: candidates
    });
});

/**
 * @desc    Send a WhatsApp recall reminder to a patient
 * @route   POST /api/recall/send-reminder
 * @access  Private
 */
exports.sendRecallReminder = catchAsync(async (req, res, next) => {
    const { patientId, phone, patientName, daysSince } = req.body;

    if (!patientId || !phone) {
        return next(new AppError('patientId and phone are required', 400));
    }

    const message = `Merhaba ${patientName || 'Değerli Hastamız'} 👋\n\n` +
        `DentaVision Klinik olarak sağlığınızı önemsiyoruz. ` +
        `Son ziyaretinizin üzerinden yaklaşık ${daysSince || '180+'} gün geçtiğini fark ettik.\n\n` +
        `Periyodik diş kontrolünüz için randevu almak ister misiniz? ✨\n\n` +
        `📞 Bizi arayabilir veya bu mesaja yanıt vererek randevu alabilirsiniz.\n\n` +
        `Sağlıklı günler dileriz! 🦷`;

    const success = await whatsappService.sendMessage(patientId, phone, message);

    // Log the recall contact
    await recallService.logRecallContact(
        req.user.clinicName,
        patientId,
        'whatsapp',
        success ? 'WhatsApp hatırlatma gönderildi' : 'WhatsApp gönderilemedi'
    );

    res.status(200).json({
        success,
        message: success ? 'Hatırlatma başarıyla gönderildi' : 'WhatsApp mesajı gönderilemedi'
    });
});

/**
 * @desc    Update a recall log status
 * @route   PUT /api/recall/logs/:id
 * @access  Private
 */
exports.updateRecallLog = catchAsync(async (req, res, next) => {
    const { status, notes } = req.body;
    const updated = await recallService.updateRecallStatus(req.params.id, status, notes);

    if (!updated) {
        return next(new AppError('Recall log bulunamadı', 404));
    }

    res.status(200).json({
        success: true,
        data: updated
    });
});

/**
 * @desc    Get recall history/logs
 * @route   GET /api/recall/logs
 * @access  Private
 */
exports.getRecallLogs = catchAsync(async (req, res, next) => {
    const logs = await recallService.getRecallLogs(req.user.clinicName);

    res.status(200).json({
        success: true,
        count: logs.length,
        data: logs
    });
});

/**
 * @desc    Get recall CRM statistics
 * @route   GET /api/recall/stats
 * @access  Private
 */
exports.getRecallStats = catchAsync(async (req, res, next) => {
    const stats = await recallService.getRecallStats(req.user.clinicName);

    res.status(200).json({
        success: true,
        data: stats
    });
});
