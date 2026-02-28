const eventBus = require('../events/eventBus');
const notificationManager = require('../services/notification/NotificationManager');

// Listen to APPOINTMENT_CREATED
eventBus.on('APPOINTMENT_CREATED', async ({ appointment }) => {
    try {
        if (appointment && appointment.patientId && appointment.patientId.phone) {
            const message = `Sayın ${appointment.patientId.name}, ${new Date(appointment.date).toLocaleDateString()} saat ${appointment.time} için randevunuz oluşturulmuştur.`;
            
            // Uses default strategy (SMS) or environment preference
            await notificationManager.notify(appointment.patientId.phone, message, null, {
                patientId: appointment.patientId._id,
                appointmentId: appointment._id
            });
            
            console.log(`[EventBus] Notification triggered for APPOINTMENT_CREATED. Appointment ID: ${appointment._id}`);
        }
    } catch (error) {
        console.error('[EventBus] Error in APPOINTMENT_CREATED subscriber:', error);
    }
});

// Listen to APPOINTMENT_CANCELLED
eventBus.on('APPOINTMENT_CANCELLED', async ({ appointment }) => {
    try {
        if (appointment && appointment.patientId && appointment.patientId.phone) {
            const message = `Sayın ${appointment.patientId.name}, ${new Date(appointment.date).toLocaleDateString()} tarihli randevunuz iptal edilmiştir.`;
            
            await notificationManager.notify(appointment.patientId.phone, message, null, {
                patientId: appointment.patientId._id,
                appointmentId: appointment._id
            });
            
            console.log(`[EventBus] Notification triggered for APPOINTMENT_CANCELLED. Appointment ID: ${appointment._id}`);
        }
    } catch (error) {
        console.error('[EventBus] Error in APPOINTMENT_CANCELLED subscriber:', error);
    }
});

// Listen to PATIENT_CREATED
eventBus.on('PATIENT_CREATED', async ({ patient, user }) => {
    try {
        if (patient && patient.phone) {
            const message = `Sayın ${patient.name}, DentaVision Kliniği'ne (Dr. ${user.name}) kaydınız başarıyla oluşturulmuştur. Memnuniyetiniz bizim için önemlidir.`;
            
            // Specifically can use WhatsApp for welcome messages if configured
            await notificationManager.notify(patient.phone, message, 'whatsapp', {
                patientId: patient._id
            });
            
            console.log(`[EventBus] Welcome notification triggered for ${patient.name}.`);
        }
    } catch (error) {
        console.error('[EventBus] Error in PATIENT_CREATED subscriber:', error);
    }
});

module.exports = eventBus;

