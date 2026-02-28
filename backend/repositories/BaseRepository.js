class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    _applyBranchFilter(filter, branch) {
        if (branch) {
            return { ...filter, branch };
        }
        return filter;
    }

    async findAll(filter = {}, populate = '', sort = { createdAt: -1 }, skip = 0, limit = 0, branch = null) {
        const finalFilter = this._applyBranchFilter(filter, branch);
        let query = this.model.find(finalFilter).populate(populate).sort(sort);
        if (skip > 0) query = query.skip(skip);
        if (limit > 0) query = query.limit(limit);
        return await query;
    }

    async findOne(filter = {}, populate = '', branch = null) {
        const finalFilter = this._applyBranchFilter(filter, branch);
        return await this.model.findOne(finalFilter).populate(populate);
    }

    async findById(id, populate = '') {
        // ID is unique usually, so branch scoping is optional but good for safety
        return await this.model.findById(id).populate(populate);
    }

    async create(data) {
        return await this.model.create(data);
    }

    async update(filter, data, branch = null) {
        const finalFilter = this._applyBranchFilter(filter, branch);
        return await this.model.findOneAndUpdate(finalFilter, data, {
            new: true,
            runValidators: true
        });
    }

    async delete(filter, branch = null) {
        const finalFilter = this._applyBranchFilter(filter, branch);
        return await this.model.findOneAndDelete(finalFilter);
    }

    async count(filter = {}, branch = null) {
        const finalFilter = this._applyBranchFilter(filter, branch);
        return await this.model.countDocuments(finalFilter);
    }
}

module.exports = BaseRepository;
