const BaseRepository = require('./BaseRepository');
const ENabizLog = require('../models/ENabizLog');

class ENabizRepository extends BaseRepository {
    constructor() {
        super(ENabizLog);
    }

    /**
     * Get ENabiz logs by patient ID
     */
    async findByPatientId(patientId, limit = 20) {
        return await this.model.find({ patientId })
            .sort({ submittedAt: -1 })
            .limit(limit)
            .populate('submittedBy', 'name email');
    }

    /**
     * Get logs by status (e.g. 'ERROR' to retry)
     */
    async findByStatus(status) {
        return await this.model.find({ status })
            .sort({ submittedAt: -1 });
    }
}

module.exports = new ENabizRepository();
