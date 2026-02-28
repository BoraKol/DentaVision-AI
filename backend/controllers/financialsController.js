const financialsService = require('../services/financialsService');
const catchAsync = require('../utils/catchAsync');
const ErrorResponse = require('../utils/AppError');

/**
 * @desc    Get all transactions for the clinic
 * @route   GET /api/financials
 * @access  Private
 */
exports.getTransactions = catchAsync(async (req, res, next) => {
    const filters = {
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        patientId: req.query.patientId
    };

    const transactions = await financialsService.getTransactions(req.user.clinicName, filters);
    
    res.status(200).json({ 
        success: true, 
        count: transactions.length, 
        data: transactions 
    });
});

/**
 * @desc    Get financial stats (income vs expense)
 * @route   GET /api/financials/stats
 * @access  Private
 */
exports.getStats = catchAsync(async (req, res, next) => {
    const summary = await financialsService.getStats(req.user.clinicName);
    
    res.status(200).json({ success: true, data: summary });
});

/**
 * @desc    Get doctor performance report
 * @route   GET /api/financials/reports/doctor-performance
 * @access  Private
 */
exports.getDoctorPerformance = catchAsync(async (req, res, next) => {
    const report = await financialsService.getDoctorPerformance(req.user.clinicName);
    
    res.status(200).json({ success: true, data: report });
});

/**
 * @desc    Get payment method analysis
 * @route   GET /api/financials/reports/payment-methods
 * @access  Private
 */
exports.getPaymentMethodAnalysis = catchAsync(async (req, res, next) => {
    const report = await financialsService.getPaymentMethodAnalysis(req.user.clinicName);
    
    res.status(200).json({ success: true, data: report });
});

/**
 * @desc    Create new transaction
 * @route   POST /api/financials
 * @access  Private
 */
exports.createTransaction = catchAsync(async (req, res, next) => {
    const transactionData = {
        ...req.body,
        clinicName: req.user.clinicName
    };
    
    const transaction = await financialsService.createTransaction(transactionData);
    
    res.status(201).json({ success: true, data: transaction });
});

/**
 * @desc    Generate E-Invoice for a specific transaction
 * @route   POST /api/financials/:id/invoice
 * @access  Private
 */
exports.generateInvoice = catchAsync(async (req, res, next) => {
    const invoiceData = await financialsService.generateInvoice(req.params.id, req.user.clinicName);
    
    res.status(200).json({ success: true, data: invoiceData });
});

/**
 * @desc    Delete transaction
 * @route   DELETE /api/financials/:id
 * @access  Private
 */
exports.deleteTransaction = catchAsync(async (req, res, next) => {
    await financialsService.deleteTransaction(req.params.id, req.user.clinicName);
    
    res.status(200).json({ success: true, data: {} });
});
