class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async findAll(filter = {}, populate = '', sort = { createdAt: -1 }, skip = 0, limit = 0) {
        let query = this.model.find(filter).populate(populate).sort(sort);
        if (skip > 0) query = query.skip(skip);
        if (limit > 0) query = query.limit(limit);
        return await query;
    }

    async findOne(filter = {}, populate = '') {
        return await this.model.findOne(filter).populate(populate);
    }

    async findById(id, populate = '') {
        return await this.model.findById(id).populate(populate);
    }

    async create(data) {
        return await this.model.create(data);
    }

    async update(filter, data) {
        return await this.model.findOneAndUpdate(filter, data, {
            new: true,
            runValidators: true
        });
    }

    async delete(filter) {
        return await this.model.findOneAndDelete(filter);
    }

    async count(filter = {}) {
        return await this.model.countDocuments(filter);
    }
}

module.exports = BaseRepository;
