const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const financialsController = require('../controllers/financialsController');

console.log('✅ Financials router initialized');

// @desc    Get all transactions for the clinic / Create transaction
// @route   GET /api/financials | POST /api/financials
// @access  Private
router.route('/')
    .get(protect, financialsController.getTransactions)
    .post(protect, financialsController.createTransaction);

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
// @route   POST /api/financials/:id/invoice
// @access  Private
router.post('/:id/invoice', protect, financialsController.generateInvoice);

// @desc    Delete transaction
// @route   DELETE /api/financials/:id
// @access  Private
router.delete('/:id', protect, financialsController.deleteTransaction);

module.exports = router;
