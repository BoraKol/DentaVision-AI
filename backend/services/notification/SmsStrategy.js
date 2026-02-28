const BaseStrategy = require('./BaseStrategy');
const smsService = require('../smsService');

class SmsStrategy extends BaseStrategy {
    async send(recipient, message, options = {}) {
        try {
            const result = await smsService.send(recipient, message);
            return result;
        } catch (error) {
            console.error('❌ SmsStrategy Error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = SmsStrategy;
