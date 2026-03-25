const TransactionRepository = require('../repositories/TransactionRepository');
const EInvoiceService = require('./EInvoiceService');
const patientRepository = require('../repositories/PatientRepository');
const ErrorResponse = require('../utils/AppError');

class FinancialsService {
    /**
     * Get all transactions for a clinic with filters
     */
    async getTransactions(clinicName, filters) {
        const { type, startDate, endDate, patientId } = filters;
        let query = { clinicName };

        if (type) query.type = type;
        if (patientId) query.patientId = patientId;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // Using repo method
        return await TransactionRepository.findWithFilters(query, { sort: { date: -1 } });
    }

    /**
     * Calculate financial income/expense stats
     */
    async getStats(clinicName) {
        const stats = await TransactionRepository.aggregate([
            { $match: { clinicName } },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const summary = { income: 0, expense: 0, balance: 0 };
        stats.forEach(s => {
            if (s._id === 'INCOME') summary.income = s.total;
            if (s._id === 'EXPENSE') summary.expense = s.total;
        });

        summary.balance = summary.income - summary.expense;
        return summary;
    }

    /**
     * Get Doctor Performance metrics
     */
    async getDoctorPerformance(clinicName) {
        return await TransactionRepository.aggregate([
            { 
                $match: { 
                    clinicName,
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
            { $unwind: '$doctor' },
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
    }

    /**
     * Get breakdown of payment methods
     */
    async getPaymentMethodAnalysis(clinicName) {
        return await TransactionRepository.aggregate([
            { $match: { clinicName, type: 'INCOME' } },
            {
                $group: {
                    _id: '$paymentMethod',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);
    }

    /**
     * Create a generic transaction
     */
    async createTransaction(transactionData) {
        return await TransactionRepository.create(transactionData);
    }

    /**
     * Generate an e-invoice for a specific transaction
     */
    async generateInvoice(transactionId, clinicName, user) {
        const transaction = await TransactionRepository.findOne({ _id: transactionId, clinicName });

        if (!transaction) throw new ErrorResponse('İşlem bulunamadı', 404);
        if (transaction.type !== 'INCOME') throw new ErrorResponse('Sadece Gelir kalemi işlemlere e-fatura kesilebilir', 400);
        if (transaction.invoiceStatus === 'GENERATED') throw new ErrorResponse('Bu işlem için zaten bir fatura kesilmiş', 400);

        let patient = null;
        if (transaction.patientId) {
            patient = await patientRepository.findById(transaction.patientId);
        }

        try {
            // Wait for 3rd party API simulation
            const invoiceData = await EInvoiceService.generateInvoice(transaction, patient, user);

            // Update local DB
            transaction.invoiceStatus = invoiceData.status;
            transaction.invoiceId = invoiceData.invoiceId;
            transaction.invoiceDocumentUrl = invoiceData.documentUrl;
            
            // To ensure mongoose trigger/hooks aren't bypassed, using save instead of direct repo generic update
            await transaction.save();
            return transaction;

        } catch (error) {
            console.error("Invoice Generation Error Detail:", error);
            throw new ErrorResponse('E-Fatura oluşturulurken bir hata oluştu', 500);
        }
    }

    /**
     * Delete transaction securely
     */
    async deleteTransaction(transactionId, clinicName) {
        const transaction = await TransactionRepository.findOne({ _id: transactionId, clinicName });
        if (!transaction) throw new ErrorResponse('Transaction not found or unauthorized', 404);

        await TransactionRepository.delete(transactionId);
        return true;
    }
}

module.exports = new FinancialsService();
