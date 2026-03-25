const BaseRepository = require('./BaseRepository');
const Patient = require('../models/Patient');

class PatientRepository extends BaseRepository {
    constructor() {
        super(Patient);
    }

    // You can add patient-specific queries here if needed
    async findWithUserDetails(clinicName, skip = 0, limit = 0) {
        return await this.findAll({ clinicName }, 'userId analyses', { createdAt: -1 }, skip, limit);
    }

    async findByPhone(phone, clinicName = null) {
        const filter = { phone };
        if (clinicName) filter.clinicName = clinicName;
        return await this.findOne(filter);
    }
}

module.exports = new PatientRepository();
