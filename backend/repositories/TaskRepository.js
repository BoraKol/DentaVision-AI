const BaseRepository = require('./BaseRepository');
const Task = require('../models/Task');

class TaskRepository extends BaseRepository {
    constructor() {
        super(Task);
    }

    async findByBranch(clinicName, branch, filters = {}) {
        return await this.findAll({ 
            clinicName, 
            branch,
            ...filters 
        }, 'assignee creator');
    }
}

module.exports = new TaskRepository();
