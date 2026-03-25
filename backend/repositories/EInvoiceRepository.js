const BaseRepository = require('./BaseRepository');
const EInvoiceLog = require('../models/EInvoiceLog');

class EInvoiceRepository extends BaseRepository {
    constructor() {
        super(EInvoiceLog);
    }

    /**
     * Get invoice logs by transaction ID
     */
    async findByTransactionId(transactionId, limit = 10) {
        return await this.model.find({ transactionId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('submittedBy', 'name email');
    }

    /**
     * Get failing invoices that need retry
     */
    async findFailedInvoices(clinicName) {
        return await this.model.find({
            clinicName,
            status: { $in: ['ERROR', 'PENDING'] }
        }).sort({ createdAt: -1 });
    }
}

module.exports = new EInvoiceRepository();
