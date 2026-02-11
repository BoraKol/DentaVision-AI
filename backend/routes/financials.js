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

// @desc    Get doctor performance report
// @route   GET /api/financials/reports/doctor-performance
// @access  Private
router.get('/reports/doctor-performance', protect, async (req, res) => {
    try {
        const report = await Transaction.aggregate([
            { 
                $match: { 
                    clinicName: req.user.clinicName,
                    type: 'INCOME', // Only count income for performance
                    doctorId: { $exists: true, $ne: null }
                } 
            },
            {
                $group: {
                    _id: '$doctorId',
                    totalIncome: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'doctor'
                }
            },
            {
                $unwind: '$doctor'
            },
            {
                $project: {
                    doctorName: '$doctor.name',
                    totalIncome: 1,
                    count: 1,
                    commissionRate: { $ifNull: ['$doctor.commissionRate', 0] },
                    estimatedCommission: { 
                        $multiply: ['$totalIncome', { $divide: [{ $ifNull: ['$doctor.commissionRate', 0] }, 100] }] 
                    }
                }
            }
        ]);

        res.status(200).json({ success: true, data: report });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @desc    Get payment method analysis
// @route   GET /api/financials/reports/payment-methods
// @access  Private
router.get('/reports/payment-methods', protect, async (req, res) => {
    try {
        const report = await Transaction.aggregate([
            { 
                $match: { 
                    clinicName: req.user.clinicName,
                    type: 'INCOME' 
                } 
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({ success: true, data: report });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// @desc    Create new transaction
// @route   POST /api/financials
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { type, amount, category, description, paymentMethod, patientId, doctorId } = req.body;
        
        const transaction = await Transaction.create({
            type,
            amount,
            category,
            description,
            paymentMethod,
            patientId,
            doctorId,
            clinicName: req.user.clinicName
        });
        
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
