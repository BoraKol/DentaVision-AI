const communicationLogRepository = require('../repositories/CommunicationLogRepository');
const patientRepository = require('../repositories/PatientRepository');

class WhatsAppService {
    constructor() {
        // Mock provider implementation for local development
        this.provider = 'MockWhatsApp';
        console.log(`✅ WhatsApp Service initialized with ${this.provider} provider`);
    }

    /**
     * Send an outbound WhatsApp message
     * @param {string} patientId 
     * @param {string} phoneNumber 
     * @param {string} message 
     * @returns {Promise<boolean>}
     */
    async sendMessage(patientId, phoneNumber, message) {
        try {
            console.log(`[WHATSAPP SENT] To: ${phoneNumber} | Message: ${message}`);
            
            const logData = {
                type: 'WHATSAPP',
                direction: 'OUTBOUND',
                recipient: phoneNumber,
                message: message,
                status: 'SENT',
                provider: this.provider,
                sentAt: Date.now()
            };
            if (patientId) logData.patientId = patientId;
            
            await communicationLogRepository.create(logData);

            return true;
        } catch (error) {
            console.error('WhatsApp send error:', error);
            
            // Log failed attempt
            await communicationLogRepository.create({
                patientId,
                type: 'WHATSAPP',
                direction: 'OUTBOUND',
                recipient: phoneNumber,
                message: message,
                status: 'FAILED',
                provider: this.provider,
                metadata: { error: error.message },
                sentAt: Date.now()
            });
            return false;
        }
    }

    /**
     * Record an inbound webhook message from a patient
     * @param {string} patientId 
     * @param {string} phoneNumber 
     * @param {string} message 
     */
    async recordInboundMessage(patientId, phoneNumber, message) {
        console.log(`[WHATSAPP RECEIVED] From: ${phoneNumber} | Message: ${message}`);
        
        const logData = {
            type: 'WHATSAPP',
            direction: 'INBOUND',
            recipient: phoneNumber,
            message: message,
            status: 'SENT',
            provider: this.provider,
            sentAt: Date.now()
        };
        if (patientId) logData.patientId = patientId;
        
        await communicationLogRepository.create(logData);
    }
}

module.exports = new WhatsAppService();

