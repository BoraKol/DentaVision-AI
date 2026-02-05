const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const notificationService = require('../services/NotificationService');

const setupReminders = () => {
    console.log('⏰ Reminder Cron Service Initialized (Checking daily at 09:00)');

    // Schedule: Every day at 09:00 AM
    // For testing you can use '* * * * *' to run every minute
    cron.schedule('0 9 * * *', async () => {
        console.log('🔔 Running Daily Appointment Reminder Job...');
        
        try {
            // Logic: Find appointments for TOMORROW
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
            });

            console.log(`📅 Found ${appointments.length} appointments for tomorrow (${tomorrow.toDateString()}).`);

            for (const appt of appointments) {
                const patient = await Patient.findById(appt.patientId);
                
                if (patient && patient.email) {
                    console.log(`📧 Sending reminder to ${patient.name} (${patient.email})`);
                    
                    const timeString = new Date(appt.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                    
                    await notificationService.sendAppointmentReminder(
                        patient.email,
                        patient.name,
                        tomorrow.toLocaleDateString('tr-TR'),
                        timeString,
                        appt.dentistName || 'Diş Hekiminiz'
                    );
                } else {
                    console.log(`⚠️ Patient not found or no email for Appointment ID: ${appt._id}`);
                }
            }

        } catch (error) {
            console.error('❌ Error in Reminder Cron Job:', error);
        }
    });
};

module.exports = setupReminders;
