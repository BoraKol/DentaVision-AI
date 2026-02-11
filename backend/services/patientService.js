const Patient = require('../models/Patient');

class PatientService {
    async getAllPatients(clinicName) {
        return await Patient.find({ clinicName })
            .populate('userId', 'name title')
            .sort({ createdAt: -1 });
    }

    async getPatientById(id, clinicName) {
        return await Patient.findOne({ _id: id, clinicName });
    }

    async createPatient(data, user) {
        return await Patient.create({
            ...data,
            userId: user._id,
            clinicName: user.clinicName
        });
    }

    async updatePatient(id, clinicName, data) {
        const patient = await Patient.findOne({ _id: id, clinicName });
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
        return await Patient.findOneAndDelete({ _id: id, userId });
    }
}

module.exports = new PatientService();
