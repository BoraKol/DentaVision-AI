const BaseRepository = require('./BaseRepository');
const RecallLog = require('../models/RecallLog');

class RecallLogRepository extends BaseRepository {
    constructor() {
        super(RecallLog);
    }

    async findByClinicAndStatus(clinicName, status) {
        return await this.findAll({ clinicName, status });
    }

    async findByPatient(clinicName, patientId) {
        return await this.findAll({ clinicName, patientId }, '', { createdAt: -1 });
    }

    async aggregate(pipeline) {
        return await this.model.aggregate(pipeline);
    }
}

module.exports = new RecallLogRepository();
