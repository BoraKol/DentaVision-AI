const nodemailer = require('nodemailer');
const path = require('path');
const CommunicationLog = require('../models/CommunicationLog');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

class NotificationService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE || 'gmail',
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async logCommunication(patientId, type, recipient, message, status, title = '') {
        try {
            if (!patientId) return; // Can't log if no patient ID
            
            await CommunicationLog.create({
                patientId,
                type,
                recipient,
                title,
                message,
                status,
                provider: 'MockService'
            });
        } catch (error) {
            console.error('Failed to log communication:', error);
        }
    }

    async sendSMS(patientId, phoneNumber, message) {
        console.log(`📱 [Mock SMS] Sending to ${phoneNumber}: ${message}`);
        
        // Simulate success
        const success = true;

        if (patientId) {
            await this.logCommunication(patientId, 'SMS', phoneNumber, message, success ? 'SENT' : 'FAILED');
        }

        return { success, messageId: `mock-sms-${Date.now()}` };
    }

    async sendEmail(patientId, to, subject, htmlContent) {
        let success = false;
        let errorMsg = '';

        // Check credentials
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('⚠️ SMTP credentials not set. Email simulation:');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            success = true; // Pretend success in dev
        } else {
            try {
                const info = await this.transporter.sendMail({
                    from: process.env.SMTP_FROM || `"DentaVision AI" <${process.env.SMTP_USER}>`,
                    to: to,
                    subject: subject,
                    html: htmlContent
                });
                console.log('✅ Email sent: %s', info.messageId);
                success = true;
            } catch (error) {
                console.error('❌ Error sending email:', error);
                errorMsg = error.message;
            }
        }

        if (patientId) {
            await this.logCommunication(patientId, 'EMAIL', to, 'HTML Content', success ? 'SENT' : 'FAILED', subject);
        }

        return { success, error: errorMsg };
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
