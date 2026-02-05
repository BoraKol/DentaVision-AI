const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

class NotificationService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE || 'gmail', // Default to gmail
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendEmail(to, subject, htmlContent) {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('⚠️ SMTP credentials not set. Email simulation:');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            return { success: false, message: 'SMTP credentials missing' };
        }

        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || `"DentaVision AI" <${process.env.SMTP_USER}>`,
                to: to,
                subject: subject,
                html: htmlContent
            });
            console.log('✅ Email sent: %s', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Error sending email:', error);
            return { success: false, error: error.message };
        }
    }

    // Template for appointment reminder
    async sendAppointmentReminder(patientEmail, patientName, date, time, doctorName) {
        const subject = `Randevu Hatırlatması - ${date}`;
        const html = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Sayın ${patientName},</h2>
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
        return this.sendEmail(patientEmail, subject, html);
    }
}

module.exports = new NotificationService();
