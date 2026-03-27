const TreatmentRepository = require('../repositories/TreatmentRepository');
const RecallLogRepository = require('../repositories/RecallLogRepository');
const PatientRepository = require('../repositories/PatientRepository');

class RecallService {
    /**
     * Find patients who haven't visited in X days (default: 180 = 6 months).
     * @param {string} clinicName 
     * @param {number} thresholdDays 
     */
    async getRecallCandidates(clinicName, thresholdDays = 180) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);

        // Aggregation: Group treatments by patient, find their MOST RECENT treatment date.
        // If that date is older than cutoffDate, they are a recall candidate.
        const candidates = await TreatmentRepository.aggregate([
            {
                $match: {
                    clinicName,
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$patientId',
                    lastTreatmentDate: { $max: '$date' },
                    lastProcedure: { $last: '$procedureName' },
                    totalTreatments: { $sum: 1 }
                }
            },
            {
                $match: {
                    lastTreatmentDate: { $lt: cutoffDate }
                }
            },
            {
                $lookup: {
                    from: 'patients',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'patient'
                }
            },
            { $unwind: '$patient' },
            {
                $project: {
                    patientId: '$_id',
                    patientName: '$patient.name',
                    patientPhone: '$patient.phone',
                    patientEmail: '$patient.email',
                    lastTreatmentDate: 1,
                    lastProcedure: 1,
                    totalTreatments: 1,
                    daysSinceLastVisit: {
                        $dateDiff: {
                            startDate: '$lastTreatmentDate',
                            endDate: new Date(),
                            unit: 'day'
                        }
                    }
                }
            },
            { $sort: { daysSinceLastVisit: -1 } }
        ]);

        return candidates;
    }

    /**
     * Create or update a recall log entry when a patient is contacted.
     */
    async logRecallContact(clinicName, patientId, contactMethod, notes = '') {
        // Find the most recent treatment to get lastTreatmentDate
        const treatments = await TreatmentRepository.findAll(
            { clinicName, patientId, status: 'completed' },
            '',
            { date: -1 },
            0,
            1
        );

        const lastTreatmentDate = treatments.length > 0 ? treatments[0].date : new Date();

        const now = new Date();
        const diffTime = Math.abs(now - new Date(lastTreatmentDate));
        const daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return await RecallLogRepository.create({
            patientId,
            clinicName,
            recallType: 'periodic_checkup',
            status: 'contacted',
            lastTreatmentDate,
            daysSinceLastVisit: daysSince,
            contactMethod,
            contactedAt: now,
            notes
        });
    }

    /**
     * Update a recall log's status (e.g., "appointment_booked", "no_response")
     */
    async updateRecallStatus(recallId, status, notes = '') {
        return await RecallLogRepository.update(
            { _id: recallId },
            { status, ...(notes && { notes }) }
        );
    }

    /**
     * Get recall history/logs for a clinic (dashboard view)
     */
    async getRecallLogs(clinicName) {
        return await RecallLogRepository.findAll(
            { clinicName },
            'patientId',
            { createdAt: -1 }
        );
    }

    /**
     * Get recall statistics for the CRM dashboard
     */
    async getRecallStats(clinicName) {
        const stats = await RecallLogRepository.aggregate([
            { $match: { clinicName } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = {
            pending: 0,
            contacted: 0,
            appointment_booked: 0,
            no_response: 0,
            declined: 0
        };

        stats.forEach(s => {
            if (result.hasOwnProperty(s._id)) {
                result[s._id] = s.count;
            }
        });

        result.total = Object.values(result).reduce((a, b) => a + b, 0);
        return result;
    }
}

module.exports = new RecallService();
