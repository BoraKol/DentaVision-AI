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
            transaction.invoiceXmlUrl = invoiceData.xmlUrl;
            
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

    /**
     * Get monthly income/expense trends for the last N months + 3-month forecast
     */
    async getMonthlyTrends(clinicName, months = 12) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const trends = await TransactionRepository.aggregate([
            {
                $match: {
                    clinicName,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                        type: '$type'
                    },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Build monthly map
        const monthlyMap = {};
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyMap[key] = { month: key, income: 0, expense: 0, profit: 0, txCount: 0 };
        }

        trends.forEach(t => {
            const key = `${t._id.year}-${String(t._id.month).padStart(2, '0')}`;
            if (monthlyMap[key]) {
                if (t._id.type === 'INCOME') {
                    monthlyMap[key].income = t.total;
                    monthlyMap[key].txCount += t.count;
                } else if (t._id.type === 'EXPENSE') {
                    monthlyMap[key].expense = t.total;
                }
                monthlyMap[key].profit = monthlyMap[key].income - monthlyMap[key].expense;
            }
        });

        const trendData = Object.values(monthlyMap);

        // Simple Linear Regression forecast for next 3 months (based on income)
        const incomes = trendData.map(d => d.income);
        const forecast = this._linearForecast(incomes, 3);

        return { trends: trendData, forecast };
    }

    /**
     * Simple linear regression forecast
     * @param {number[]} data - Historical values
     * @param {number} periods - Number of future periods to predict
     */
    _linearForecast(data, periods = 3) {
        const n = data.length;
        if (n < 2) return [];

        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += data[i];
            sumXY += i * data[i];
            sumX2 += i * i;
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const predictions = [];
        for (let i = 0; i < periods; i++) {
            const futureX = n + i;
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + i + 1);
            const monthKey = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;
            predictions.push({
                month: monthKey,
                predictedIncome: Math.max(0, Math.round(slope * futureX + intercept)),
                confidence: Math.max(0, Math.min(100, Math.round(100 - (i * 15)))) // Decreasing confidence
            });
        }

        return predictions;
    }

    /**
     * Get Clinic KPIs (Key Performance Indicators)
     */
    async getClinicKPIs(clinicName) {
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const [thisMonth, lastMonth] = await Promise.all([
            TransactionRepository.aggregate([
                { $match: { clinicName, type: 'INCOME', date: { $gte: thisMonthStart } } },
                { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
            ]),
            TransactionRepository.aggregate([
                { $match: { clinicName, type: 'INCOME', date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
                { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
            ])
        ]);

        const thisMonthIncome = thisMonth[0]?.total || 0;
        const lastMonthIncome = lastMonth[0]?.total || 0;
        const growthRate = lastMonthIncome > 0
            ? Math.round(((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100)
            : 0;

        const avgTransactionSize = thisMonth[0]?.count > 0
            ? Math.round(thisMonthIncome / thisMonth[0].count)
            : 0;

        return {
            currentMonthIncome: thisMonthIncome,
            lastMonthIncome,
            monthlyGrowthRate: growthRate,
            currentMonthTransactions: thisMonth[0]?.count || 0,
            avgTransactionSize
        };
    }
}

module.exports = new FinancialsService();
