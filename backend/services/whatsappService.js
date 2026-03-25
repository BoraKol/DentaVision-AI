const communicationLogRepository = require('../repositories/CommunicationLogRepository');
const whatsappWebProvider = require('./whatsappWebProvider');

class WhatsAppService {
    constructor() {
        this.provider = whatsappWebProvider;
        console.log(`✅ WhatsApp Service initialized (whatsapp-web.js provider)`);
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
            const result = await this.provider.sendMessage(phoneNumber, message);
            
            const logData = {
                type: 'WHATSAPP',
                direction: 'OUTBOUND',
                recipient: phoneNumber,
                message: message,
                status: result.success ? 'SENT' : 'FAILED',
                provider: 'whatsapp-web.js',
                metadata: result.success ? { messageId: result.messageId } : { error: result.error },
                sentAt: Date.now()
            };
            if (patientId) logData.patientId = patientId;
            
            await communicationLogRepository.create(logData);

            if (!result.success) {
                console.warn(`[WhatsApp] Message failed: ${result.error}`);
            }

            return result.success;
        } catch (error) {
            console.error('WhatsApp send error:', error);
            
            await communicationLogRepository.create({
                patientId,
                type: 'WHATSAPP',
                direction: 'OUTBOUND',
                recipient: phoneNumber,
                message: message,
                status: 'FAILED',
                provider: 'whatsapp-web.js',
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
        console.log(`[WHATSAPP RECEIVED] From: ${phoneNumber.replace(/.(?=.{4})/g, '*')} | Message: [MASKED]`);
        
        const logData = {
            type: 'WHATSAPP',
            direction: 'INBOUND',
            recipient: phoneNumber,
            message: message,
            status: 'RECEIVED',
            provider: 'whatsapp-web.js',
            sentAt: Date.now()
        };
        if (patientId) logData.patientId = patientId;
        
        await communicationLogRepository.create(logData);
    }

    /**
     * Get the current WhatsApp connection status
     */
    getStatus() {
        return this.provider.getStatus();
    }

    /**
     * Initialize WhatsApp connection (triggers QR code generation)
     */
    connect() {
        this.provider.initialize();
    }

    /**
     * Disconnect WhatsApp session
     */
    async disconnect() {
        await this.provider.disconnect();
    }
}

module.exports = new WhatsAppService();
