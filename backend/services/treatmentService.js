const treatmentRepository = require('../repositories/TreatmentRepository');
const Transaction = require('../models/Transaction');

class TreatmentService {
    async getTreatmentsByPatient(patientId, clinicName) {
        return await treatmentRepository.findAll(
            { patientId, clinicName },
            '',
            { date: -1 }
        );
    }

    async createTreatment(data, user) {
        return await treatmentRepository.create({
            ...data,
            clinicName: user.clinicName
        });
    }

    async updateTreatmentStatus(id, clinicName, status) {
        const oldTreatment = await treatmentRepository.findOne({ _id: id, clinicName });
        if (!oldTreatment) {
            return null;
        }

        const treatment = await treatmentRepository.update(
            { _id: id, clinicName },
            { status }
        );

        if (treatment) {
            await treatment.populate('patientId', 'name');
        }

        // Financial Automation Logic
        if (status === 'completed' && oldTreatment.status !== 'completed') {
            const patientName = treatment.patientId?.name || 'Bilinmeyen Hasta';
            
            // Create Transaction
            await Transaction.create({
                type: 'INCOME',
                amount: treatment.cost || 0,
                category: 'Tedavi',
                description: `${treatment.procedureName} - ${patientName}`,
                patientId: treatment.patientId?._id || treatment.patientId,
                treatmentId: treatment._id,
                clinicName: treatment.clinicName
                // paymentMethod is default 'CASH'
            });
        } else if (status !== 'completed' && oldTreatment.status === 'completed') {
            // Delete Transaction if status reverted
            await Transaction.findOneAndDelete({ treatmentId: treatment._id });
        }

        return treatment;
    }

    async deleteTreatment(id, clinicName) {
        const treatment = await treatmentRepository.delete({
            _id: id,
            clinicName
        });

        if (treatment) {
            // Clean up associated transaction
            await Transaction.findOneAndDelete({ treatmentId: id });
        }

        return treatment;
    }
}

module.exports = new TreatmentService();
