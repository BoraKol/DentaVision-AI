const patientRepository = require('../repositories/PatientRepository');

class PatientService {
    async getAllPatients(clinicName) {
        return await patientRepository.findWithUserDetails(clinicName);
    }

    async getPatientById(id, clinicName) {
        return await patientRepository.findOne({ _id: id, clinicName });
    }

    async createPatient(data, user) {
        return await patientRepository.create({
            ...data,
            userId: user._id,
            clinicName: user.clinicName
        });
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
}

module.exports = new PatientService();
