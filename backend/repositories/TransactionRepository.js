const BaseRepository = require('./BaseRepository');
const Transaction = require('../models/Transaction');

class TransactionRepository extends BaseRepository {
    constructor() {
        super(Transaction);
    }

    /**
     * Find transactions with specific filters
     * @param {Object} query - Mongoose query object
     * @param {Object} options - Options like sort, populate, etc.
     */
    async findWithFilters(query, options = {}) {
        let q = this.model.find(query);

        if (options.sort) {
            q = q.sort(options.sort);
        }
        
        // Add more options as needed (populate, skip, limit)
        return await q;
    }

    /**
     * Aggregate transactions (useful for reports)
     * @param {Array} pipeline - Aggregation pipeline
     */
    async aggregate(pipeline) {
        return await this.model.aggregate(pipeline);
    }
}

module.exports = new TransactionRepository();
