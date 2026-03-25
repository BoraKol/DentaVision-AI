const nodemailer = require('nodemailer');
const BaseStrategy = require('./BaseStrategy');

class EmailStrategy extends BaseStrategy {
    constructor() {
        super();
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

    async send(recipient, message, options = {}) {
        const { subject, html } = options;
        
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            // Check if we are in development/test environment
            if (process.env.NODE_ENV !== 'production') {
                console.warn('⚠️ SMTP credentials not set. Email simulation:');
                console.log(`To: ${recipient.replace(/(.{2})(.*)(?=@)/, '$1***')}, Subject: ${subject}`);
                return { success: true, simulated: true };
            }
            return { success: false, error: 'SMTP credentials missing' };
        }

        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || `"DentaVision AI" <${process.env.SMTP_USER}>`,
                to: recipient,
                subject: subject,
                html: html || message
            });
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ EmailStrategy Error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = EmailStrategy;
