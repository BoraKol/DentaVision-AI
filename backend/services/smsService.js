const axios = require('axios');

class SmsProvider {
    async send(to, message) {
        throw new Error('Method not implemented');
    }
}

class MockSmsProvider extends SmsProvider {
    async send(to, message) {
        console.log(`[SMS-MOCK] To: ${to}, Message: ${message}`);
        return { success: true, messageId: 'mock-id-' + Date.now() };
    }
}

class NetgsmSmsProvider extends SmsProvider {
    constructor() {
        super();
        this.apiUrl = 'https://api.netgsm.com.tr/sms/send/get';
        this.username = process.env.NETGSM_USERNAME;
        this.password = process.env.NETGSM_PASSWORD;
        this.header = process.env.NETGSM_HEADER;
    }

    async send(to, message) {
        if (!this.username || !this.password || !this.header) {
            console.warn('[SMS-NETGSM] Credentials not set');
            return { success: false, error: 'Credentials missing' };
        }

        try {
            // Netgsm GET API implementation
            const response = await axios.get(this.apiUrl, {
                params: {
                    usercode: this.username,
                    password: this.password,
                    gsmno: to,
                    message: message,
                    msgheader: this.header
                }
            });

            // Netgsm returns codes starting with 00, 01, 02 for success
            const result = response.data;
            if (result.toString().startsWith('00') || result.toString().startsWith('01') || result.toString().startsWith('02')) {
                console.log(`[SMS-NETGSM] Sent to ${to}: ${result}`);
                return { success: true, messageId: result };
            } else {
                console.error(`[SMS-NETGSM] Failed to ${to}: ${result}`);
                return { success: false, error: result };
            }
        } catch (error) {
            console.error(`[SMS-NETGSM] Error: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}

class SmsService {
    constructor() {
        const providerType = process.env.SMS_PROVIDER || 'mock';
        
        switch (providerType.toLowerCase()) {
            case 'netgsm':
                this.provider = new NetgsmSmsProvider();
                console.log('✅ SMS Service initialized with NETGSM provider');
                break;
            case 'mock':
            default:
                this.provider = new MockSmsProvider();
                console.log('✅ SMS Service initialized with MOCK provider');
                break;
        }
    }

    /**
     * Send an SMS message
     * @param {string} to - Phone number (e.g., 5551234567)
     * @param {string} message - Message content
     * @returns {Promise<{success: boolean, messageId?: string, error?: any}>}
     */
    async send(to, message) {
        // Basic phone number cleaning
        const cleanPhone = to.replace(/\D/g, '');
        // Ensure strictly 10 digits for Turkey if starts with 5, or 11/12 with country code
        // For simplicity, passing as is to provider after basic cleanup
        
        return this.provider.send(cleanPhone, message);
    }
}

// Export singleton instance
module.exports = new SmsService();
