const patientRepository = require('../repositories/PatientRepository');
const communicationLogRepository = require('../repositories/CommunicationLogRepository');

class PatientService {
    async getAllPatients(clinicName, skip = 0, limit = 0) {
        return await patientRepository.findWithUserDetails(clinicName, skip, limit);
    }

    async getPatientById(id, clinicName) {
        return await patientRepository.findOne({ _id: id, clinicName }, 'userId analyses');
    }

    async createPatient(data, user) {
        const patient = await patientRepository.create({
            ...data,
            userId: user._id,
            clinicName: user.clinicName
        });
        return await patient.populate('userId', 'name title');
    }

    async updatePatient(id, clinicName, data) {
        const patient = await patientRepository.findOne({ _id: id, clinicName });
        if (!patient) {
            return null;
        }

        // Update fields individually to support mongoose middleware (e.g. password hashing)
        Object.keys(data).forEach(key => {
            patient[key] = data[key];
        });

        return await patient.save();
    }

    async deletePatient(id, userId) {
        return await patientRepository.delete({ _id: id, userId });
    }

    async getPatientCommunicationLogs(patientId) {
        return await communicationLogRepository.findByPatientId(patientId);
    }
}

module.exports = new PatientService();

