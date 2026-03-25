const BaseNotificationStrategy = require('./BaseNotificationStrategy');
const whatsappService = require('../whatsappService');

class WhatsAppStrategy extends BaseNotificationStrategy {
    async send(recipient, message, metadata = {}) {
        const { patientId } = metadata;
        console.log(`[WhatsAppStrategy] Sending to ${recipient.replace(/.(?=.{4})/g, '*')}`);
        return await whatsappService.sendMessage(patientId, recipient, message);
    }

    get name() {
        return 'WHATSAPP';
    }
}

module.exports = WhatsAppStrategy;
