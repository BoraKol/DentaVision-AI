const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const financialsController = require('../controllers/financialsController');
const financialsService = require('../services/financialsService');
const validate = require('../utils/validate');
const { createTransactionSchema } = require('../validators/financialsValidator');

console.log('✅ Financials router initialized');

// @desc    Get all transactions for the clinic / Create transaction
// @route   GET /api/financials | POST /api/financials
// @access  Private
router.route('/')
    .get(protect, financialsController.getTransactions)
    .post(protect, validate(createTransactionSchema), financialsController.createTransaction);

// @desc    Get financial stats
// @route   GET /api/financials/stats
// @access  Private
router.get('/stats', protect, financialsController.getStats);

// @desc    Get doctor performance report
// @route   GET /api/financials/reports/doctor-performance
// @access  Private
router.get('/reports/doctor-performance', protect, financialsController.getDoctorPerformance);

// @desc    Get payment method analysis
// @route   GET /api/financials/reports/payment-methods
// @access  Private
router.get('/reports/payment-methods', protect, financialsController.getPaymentMethodAnalysis);

// @desc    Generate E-Invoice for a specific transaction
// Route: POST /api/financials/transactions/:id/invoice
// Desc: Generate e-invoice for a transaction
router.post('/transactions/:id/invoice', protect, async (req, res, next) => {
    try {
        const result = await financialsService.generateInvoice(req.params.id, req.user.clinicName, req.user);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});

// @desc    Get monthly trends & forecast
// @route   GET /api/financials/reports/trends
// @access  Private
router.get('/reports/trends', protect, financialsController.getTrends);

// @desc    Get Clinic KPIs
// @route   GET /api/financials/reports/kpis
// @access  Private
router.get('/reports/kpis', protect, financialsController.getKPIs);

// @desc    Delete transaction
// @route   DELETE /api/financials/:id
// @access  Private
router.delete('/:id', protect, financialsController.deleteTransaction);

module.exports = router;
