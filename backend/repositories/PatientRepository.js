const BaseRepository = require('./BaseRepository');
const Patient = require('../models/Patient');

class PatientRepository extends BaseRepository {
    constructor() {
        super(Patient);
    }

    // You can add patient-specific queries here if needed
    async findWithUserDetails(clinicName) {
        return await this.findAll({ clinicName }, 'userId', { createdAt: -1 });
    }
}

module.exports = new PatientRepository();
