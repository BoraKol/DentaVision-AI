const labJobRepository = require('../repositories/LabJobRepository');

class LabJobService {
    async getAllJobs(sort = { createdAt: -1 }) {
        return await labJobRepository.findAll({}, '', sort);
    }

    async getJobById(id) {
        return await labJobRepository.findById(id);
    }

    async createJob(data) {
        return await labJobRepository.create(data);
    }

    async updateJob(id, data) {
        let job = await labJobRepository.findById(id);
        if (!job) return null;

        // Auto-set receivedDate if status changes to Received
        if (data.status === 'Received' && job.status !== 'Received' && !data.receivedDate) {
            data.receivedDate = Date.now();
        }

        return await labJobRepository.update({ _id: id }, data);
    }

    async deleteJob(id) {
        const job = await labJobRepository.findById(id);
        if (!job) return null;
        
        await labJobRepository.delete({ _id: id });
        return true;
    }
}

module.exports = new LabJobService();
