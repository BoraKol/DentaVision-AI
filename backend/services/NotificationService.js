const path = require('path');
const CommunicationLog = require('../models/CommunicationLog');
const EmailStrategy = require('./notification/EmailStrategy');
const SmsStrategy = require('./notification/SmsStrategy');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

class NotificationService {
    constructor() {
        this.strategies = {
            email: new EmailStrategy(),
            sms: new SmsStrategy()
        };
    }

    async logCommunication(patientId, type, recipient, message, status, title = '') {
        try {
            await CommunicationLog.create({
                patientId,
                type,
                recipient,
                title,
                message,
                status,
                provider: process.env.SMS_PROVIDER || 'System'
            });
        } catch (error) {
            console.error('Failed to log communication:', error);
        }
    }

    async sendSMS(patientId, phoneNumber, message) {
        const result = await this.strategies.sms.send(phoneNumber, message);
        
        if (patientId) {
            await this.logCommunication(patientId, 'SMS', phoneNumber, message, result.success ? 'SENT' : 'FAILED');
        }
        return result;
    }

    async sendEmail(patientId, to, subject, htmlContent) {
        const result = await this.strategies.email.send(to, '', { subject, html: htmlContent });
        
        if (patientId) {
            await this.logCommunication(patientId, 'EMAIL', to, 'HTML Content', result.success ? 'SENT' : 'FAILED', subject);
        }

        return result;
    }

    // Template for appointment reminder
    async sendAppointmentReminder(patient, appointment) {
        const date = new Date(appointment.date).toLocaleDateString('tr-TR');
        const time = new Date(appointment.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const doctorName = appointment.dentistName || 'Diş Hekiminiz';

        // 1. Send SMS
        if (patient.phone) {
            const smsMessage = `Sayın ${patient.name}, ${date} saat ${time}'da DentaVision randevunuz vardır.`;
            await this.sendSMS(patient._id, patient.phone, smsMessage);
        }

        // 2. Send Email
        if (patient.email) {
            const subject = `Randevu Hatırlatması - ${date}`;
            const html = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Sayın ${patient.name},</h2>
                    <p><strong>DentaVision Kliniği</strong>'nde yaklaşan bir randevunuz var.</p>
                    <div style="background-color: #f0fdf9; padding: 15px; border-left: 4px solid #0d9488; margin: 20px 0;">
                        <p><strong>Tarih:</strong> ${date}</p>
                        <p><strong>Saat:</strong> ${time}</p>
                        <p><strong>Doktor:</strong> ${doctorName}</p>
                    </div>
                    <p>Lütfen randevu saatinizden 10 dakika önce klinikte olunuz.</p>
                    <p>İyi günler dileriz.<br/>DentaVision Ekibi</p>
                </div>
            `;
            await this.sendEmail(patient._id, patient.email, subject, html);
        }

        return { success: true };
    }
}

module.exports = new NotificationService();

