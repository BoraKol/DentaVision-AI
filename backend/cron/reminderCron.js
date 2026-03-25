const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const notificationService = require('../services/NotificationService');
const whatsappService = require('../services/whatsappService');

const setupReminders = () => {
    console.log('⏰ Reminder Cron Service Initialized (Daily 09:00 + Weekly Sunday 10:00)');

    // ── 1. Daily: Tomorrow's appointment reminders (09:00) ──
    cron.schedule('0 9 * * *', async () => {
        console.log('🔔 Running Daily Appointment Reminder Job...');
        
        try {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

            const appointments = await Appointment.find({
                date: {
                    $gte: tomorrow,
                    $lt: dayAfterTomorrow
                },
                status: 'Scheduled'
            }).populate('userId', 'name');

            console.log(`📅 Found ${appointments.length} appointments for tomorrow (${tomorrow.toDateString()}).`);

            for (const appt of appointments) {
                const patient = await Patient.findById(appt.patientId);
                
                if (patient) {
                    console.log(`📧/📱 Sending reminder to Patient ID: ${patient._id} (Name Masked)`);
                    await notificationService.sendAppointmentReminder(patient, appt);
                } else {
                    console.log(`⚠️ Patient not found for Appointment ID: ${appt._id}`);
                }
            }

        } catch (error) {
            console.error('❌ Error in Reminder Cron Job:', error);
        }
    });

    // ── 2. Weekly (Sunday 10:00): 6-Month Follow-Up Recall ──
    cron.schedule('0 10 * * 0', async () => {
        console.log('🔔 Running Weekly 6-Month Follow-Up Recall Job...');

        try {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            // Find patients whose LAST appointment was more than 6 months ago
            const patients = await Patient.find({
                lastVisitDate: { $lt: sixMonthsAgo },
                phone: { $exists: true, $ne: '' }
            }).limit(50); // Process max 50 per run to avoid rate limits

            console.log(`📋 Found ${patients.length} patients due for 6-month recall.`);

            for (const patient of patients) {
                const message = `Sayın ${patient.name}, son kontrolünüzün üzerinden 6 ay geçti. Ağız ve diş sağlığınız için rutin muayene randevunuzu almayı unutmayın! DentaVision Kliniği 🦷`;

                if (patient.phone) {
                    await whatsappService.sendMessage(patient._id, patient.phone, message);
                    console.log(`📱 6-month recall sent to ${patient._id}`);
                }
            }
        } catch (error) {
            console.error('❌ Error in 6-Month Recall Cron Job:', error);
        }
    });
};

module.exports = setupReminders;
