const BaseRepository = require('./BaseRepository');
const Treatment = require('../models/Treatment');

class TreatmentRepository extends BaseRepository {
    constructor() {
        super(Treatment);
    }
}

module.exports = new TreatmentRepository();
