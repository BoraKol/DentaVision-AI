const SmsStrategy = require('./SmsStrategy');
const WhatsAppStrategy = require('./WhatsAppStrategy');

class NotificationManager {
    constructor() {
        this.strategies = {
            sms: new SmsStrategy(),
            whatsapp: new WhatsAppStrategy()
        };
        this.defaultStrategy = 'sms';
    }

    /**
     * Send notification using a specific strategy or default
     */
    async notify(recipient, message, type = null, metadata = {}) {
        const strategyName = type || process.env.DEFAULT_NOTIFICATION_CHANNEL || this.defaultStrategy;
        const strategy = this.strategies[strategyName.toLowerCase()];

        if (!strategy) {
            console.error(`[NotificationManager] Strategy ${strategyName} not found. Falling back to default.`);
            return await this.strategies[this.defaultStrategy].send(recipient, message, metadata);
        }

        return await strategy.send(recipient, message, metadata);
    }
}

module.exports = new NotificationManager();
