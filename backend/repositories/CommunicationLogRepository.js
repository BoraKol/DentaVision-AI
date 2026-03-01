const BaseRepository = require('./BaseRepository');
const CommunicationLog = require('../models/CommunicationLog');

class CommunicationLogRepository extends BaseRepository {
    constructor() {
        super(CommunicationLog);
    }

    async findByPatientId(patientId, sort = { sentAt: -1 }) {
        return await this.model.find({ patientId }).sort(sort);
    }

    async findByType(patientId, type, sort = { sentAt: 1 }) {
        return await this.model.find({ patientId, type }).sort(sort);
    }
}

module.exports = new CommunicationLogRepository();
