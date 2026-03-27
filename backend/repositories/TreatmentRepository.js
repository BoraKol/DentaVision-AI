const BaseRepository = require('./BaseRepository');
const Treatment = require('../models/Treatment');

class TreatmentRepository extends BaseRepository {
    constructor() {
        super(Treatment);
    }

    async aggregate(pipeline) {
        return await this.model.aggregate(pipeline);
    }
}

module.exports = new TreatmentRepository();
