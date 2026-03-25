const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const EventEmitter = require('events');

/**
 * WhatsApp Web Provider - Uses whatsapp-web.js to send real WhatsApp messages
 * via QR code linking (no Meta Business API required).
 * 
 * Singleton: Only one WhatsApp session should exist per backend instance.
 */
class WhatsAppWebProvider extends EventEmitter {
    constructor() {
        super();
        this.client = null;
        this.isReady = false;
        this.qrCode = null;
        this.connectionStatus = 'DISCONNECTED'; // DISCONNECTED | QR_READY | CONNECTING | CONNECTED
        this.connectedPhone = null;
    }

    /**
     * Initialize the WhatsApp client and start listening for QR codes.
     * Should be called once when the admin triggers "Connect WhatsApp" from the UI.
     */
    initialize() {
        if (this.client) {
            console.log('[WhatsApp] Client already initialized.');
            return;
        }

        console.log('[WhatsApp] Initializing whatsapp-web.js client...');
        this.connectionStatus = 'CONNECTING';

        this.client = new Client({
            authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--disable-gpu'
                ]
            }
        });

        this.client.on('qr', (qr) => {
            console.log('[WhatsApp] QR Code received. Scan with your phone.');
            qrcode.generate(qr, { small: true });
            this.qrCode = qr;
            this.connectionStatus = 'QR_READY';
            this.emit('qr', qr);
        });

        this.client.on('ready', () => {
            console.log('✅ [WhatsApp] Client is ready and connected!');
            this.isReady = true;
            this.qrCode = null;
            this.connectionStatus = 'CONNECTED';
            
            // Get connected phone info
            const info = this.client.info;
            if (info) {
                this.connectedPhone = info.wid ? info.wid.user : 'Unknown';
            }
            this.emit('ready');
        });

        this.client.on('authenticated', () => {
            console.log('[WhatsApp] Authenticated successfully.');
            this.connectionStatus = 'CONNECTING';
        });

        this.client.on('auth_failure', (msg) => {
            console.error('[WhatsApp] Authentication failed:', msg);
            this.isReady = false;
            this.connectionStatus = 'DISCONNECTED';
            this.emit('auth_failure', msg);
        });

        this.client.on('disconnected', (reason) => {
            console.warn('[WhatsApp] Disconnected:', reason);
            this.isReady = false;
            this.qrCode = null;
            this.connectionStatus = 'DISCONNECTED';
            this.connectedPhone = null;
            this.client = null;
            this.emit('disconnected', reason);
        });

        this.client.initialize();
    }

    /**
     * Send a WhatsApp message to a phone number.
     * @param {string} phoneNumber - Phone number in international format (e.g., 905551234567)
     * @param {string} message - Text message to send
     * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
     */
    async sendMessage(phoneNumber, message) {
        if (!this.isReady || !this.client) {
            console.warn('[WhatsApp] Client not ready. Message queued/skipped.');
            return { success: false, error: 'WhatsApp client is not connected. Please scan the QR code first.' };
        }

        try {
            // Normalize phone number: remove +, spaces, dashes
            const cleanNumber = phoneNumber.replace(/[\s\-\+\(\)]/g, '');
            const chatId = `${cleanNumber}@c.us`;

            const msg = await this.client.sendMessage(chatId, message);
            console.log(`✅ [WhatsApp] Message sent to ${cleanNumber.replace(/.(?=.{4})/g, '*')}`);
            return { success: true, messageId: msg.id._serialized };
        } catch (error) {
            console.error('[WhatsApp] Send error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Disconnect the WhatsApp session.
     */
    async disconnect() {
        if (this.client) {
            await this.client.destroy();
            this.client = null;
            this.isReady = false;
            this.qrCode = null;
            this.connectionStatus = 'DISCONNECTED';
            this.connectedPhone = null;
            console.log('[WhatsApp] Client disconnected.');
        }
    }

    /**
     * Get the current connection status.
     */
    getStatus() {
        return {
            status: this.connectionStatus,
            qrCode: this.qrCode,
            connectedPhone: this.connectedPhone,
            isReady: this.isReady
        };
    }
}

// Singleton
module.exports = new WhatsAppWebProvider();
