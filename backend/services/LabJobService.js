const LabJob = require('../models/LabJob');

class LabJobService {
    async getAllJobs(sort = { createdAt: -1 }) {
        return await LabJob.find().sort(sort);
    }

    async getJobById(id) {
        return await LabJob.findById(id);
    }

    async createJob(data) {
        return await LabJob.create(data);
    }

    async updateJob(id, data) {
        let job = await LabJob.findById(id);
        if (!job) return null;

        // Auto-set receivedDate if status changes to Received
        if (data.status === 'Received' && job.status !== 'Received' && !data.receivedDate) {
            data.receivedDate = Date.now();
        }

        return await LabJob.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
    }

    async deleteJob(id) {
        const job = await LabJob.findById(id);
        if (!job) return null;
        
        await job.deleteOne();
        return true;
    }
}

module.exports = new LabJobService();
