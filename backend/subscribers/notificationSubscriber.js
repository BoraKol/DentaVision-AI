const eventBus = require('../events/eventBus');
const smsService = require('../services/smsService');

// Listen to APPOINTMENT_CREATED
eventBus.on('APPOINTMENT_CREATED', async ({ appointment }) => {
    try {
        if (appointment && appointment.patientId && appointment.patientId.phone) {
            const message = `Sayın ${appointment.patientId.name}, ${new Date(appointment.date).toLocaleDateString()} saat ${appointment.time} için randevunuz oluşturulmuştur.`;
            await smsService.send(appointment.patientId.phone, message);
            console.log(`[EventBus] SMS sent for APPOINTMENT_CREATED. Appointment ID: ${appointment._id}`);
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
            await smsService.send(appointment.patientId.phone, message);
            console.log(`[EventBus] SMS sent for APPOINTMENT_CANCELLED. Appointment ID: ${appointment._id}`);
        }
    } catch (error) {
        console.error('[EventBus] Error in APPOINTMENT_CANCELLED subscriber:', error);
    }
});

module.exports = eventBus;
