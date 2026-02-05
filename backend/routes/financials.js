const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

console.log('✅ Financials router initialized');

// @desc    Get all transactions for the clinic
// @route   GET /api/financials
// @access  Private
router.get('/', protect, async (req, res) => {
    console.log('GET /api/financials hit by user:', req.user?._id);
    try {
        const { type, startDate, endDate, patientId } = req.query;
        let query = { clinicName: req.user.clinicName };

        if (type) query.type = type;
        if (patientId) query.patientId = patientId;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(query).sort({ date: -1 });
        res.status(200).json({ success: true, count: transactions.length, data: transactions });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @desc    Get financial stats
// @route   GET /api/financials/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
    console.log('GET /api/financials/stats hit by user:', req.user?._id);
    try {
        const stats = await Transaction.aggregate([
            { $match: { clinicName: req.user.clinicName } },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const summary = {
            income: 0,
            expense: 0,
            balance: 0
        };

        stats.forEach(s => {
            if (s._id === 'INCOME') summary.income = s.total;
            if (s._id === 'EXPENSE') summary.expense = s.total;
        });

        summary.balance = summary.income - summary.expense;

        res.status(200).json({ success: true, data: summary });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @desc    Create new transaction
// @route   POST /api/financials
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        req.body.clinicName = req.user.clinicName;
        const transaction = await Transaction.create(req.body);
        res.status(201).json({ success: true, data: transaction });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// @desc    Delete transaction
// @route   DELETE /api/financials/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ _id: req.params.id, clinicName: req.user.clinicName });

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found or unauthorized' });
        }

        await transaction.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

module.exports = router;
