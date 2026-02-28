const crypto = require('crypto');

/**
 * Mock Service to simulate communication with E-Invoice Provider 
 * (e.g. Paraşüt, Uyumsoft, Logo, etc.)
 */
class EInvoiceService {
    constructor() {
        this.provider = process.env.EINVOICE_PROVIDER || 'Mock e-Fatura API';
        // In a real scenario, API keys, URLs would be initialized here
    }

    /**
     * Generates a mock E-Invoice for a given transaction and patient
     * @param {Object} transaction - Mongoose Transaction Document
     * @param {Object} patient - Mongoose Patient Document
     * @returns {Object} Mock Invoice details (ID, URL)
     */
    async generateInvoice(transaction, patient) {
        console.log(`[E-INVOICE SERVICE] Generating invoice via ${this.provider}...`);
        console.log(`[E-INVOICE SERVICE] Amount: ₺${transaction.amount}, Patient: ${patient ? patient.name : 'Unknown'}, VKN/TCKN: ${patient ? patient.tcNo || '11111111111' : '11111111111'}`);

        // Simulate API network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate mock response
        const mockInvoiceId = `EFAT-${new Date().getFullYear()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const mockPdfUrl = `https://mock-einvoice-portal.com/view/${mockInvoiceId}.pdf`;

        // Sometimes APIs fail. Let's make it succeed 95% of the time for realism.
        const isSuccess = Math.random() < 0.95;

        if (!isSuccess) {
            throw new Error('E-Invoice provider API timeout or validation error');
        }

        console.log(`[E-INVOICE SERVICE] Success! Invoice ID: ${mockInvoiceId}`);

        return {
            invoiceId: mockInvoiceId,
            documentUrl: mockPdfUrl,
            status: 'GENERATED'
        };
    }
}

module.exports = new EInvoiceService();
