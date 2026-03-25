const { Resend } = require('resend');
const BaseStrategy = require('./BaseStrategy');

class EmailStrategy extends BaseStrategy {
    constructor() {
        super();
        this.resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    }

    async send(recipient, message, options = {}) {
        const { subject, html } = options;
        
        if (!this.resend) {
            // Check if we are in development/test environment
            if (process.env.NODE_ENV !== 'production') {
                console.warn('⚠️ RESEND_API_KEY not set. Email simulation:');
                console.log(`To: ${recipient.replace(/(.{2})(.*)(?=@)/, '$1***')}, Subject: ${subject}`);
                return { success: true, simulated: true };
            }
            return { success: false, error: 'Resend API key missing' };
        }

        try {
            // Resend requires a verified domain or uses onboarding@resend.dev for testing
            const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

            const data = await this.resend.emails.send({
                from: `DentaVision Clinic <${fromEmail}>`,
                to: recipient,
                subject: subject,
                html: html || message
            });

            if (data.error) {
                console.error('❌ Resend API Error:', data.error);
                return { success: false, error: data.error.message };
            }

            return { success: true, messageId: data.data.id };
        } catch (error) {
            console.error('❌ EmailStrategy Error (Resend):', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = EmailStrategy;
