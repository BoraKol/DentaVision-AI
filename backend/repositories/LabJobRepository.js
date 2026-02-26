const BaseRepository = require('./BaseRepository');
const LabJob = require('../models/LabJob');

class LabJobRepository extends BaseRepository {
    constructor() {
        super(LabJob);
    }
}

module.exports = new LabJobRepository();
