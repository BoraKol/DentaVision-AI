const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    async findByEmail(email) {
        return await this.model.findOne({ email });
    }

    async findByIdWithSelect(id, select = '-password') {
        return await this.model.findById(id).select(select);
    }
}

module.exports = new UserRepository();
