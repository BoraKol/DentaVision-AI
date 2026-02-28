const BaseNotificationStrategy = require('./BaseNotificationStrategy');
const smsService = require('../smsService');

class SmsStrategy extends BaseNotificationStrategy {
    async send(recipient, message, metadata = {}) {
        console.log(`[SmsStrategy] Sending to ${recipient}`);
        return await smsService.send(recipient, message);
    }

    get name() {
        return 'SMS';
    }
}

module.exports = SmsStrategy;
