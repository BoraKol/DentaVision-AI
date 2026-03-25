const crypto = require('crypto');
const axios = require('axios');
const eInvoiceRepository = require('../repositories/EInvoiceRepository');

/**
 * Service to communicate with E-Invoice Provider 
 * (e.g. Paraşüt, Uyumsoft, Logo, etc.)
 */
class EInvoiceService {
    constructor() {
        this.provider = process.env.EINVOICE_PROVIDER || 'Mock e-Fatura API';
        this.apiKey = process.env.EINVOICE_API_KEY;
        this.baseUrl = process.env.EINVOICE_API_URL || 'https://api.mock-einvoice-portal.com/v1';
    }

    /**
     * Builds a structured GIB-compliant E-SMM payload
     */
    buildInvoicePayload(transaction, patient) {
        const kdvRate = 0.10; // 10% KDV for dental services
        const amountExcludingKdv = transaction.amount / (1 + kdvRate);
        const kdvAmount = transaction.amount - amountExcludingKdv;

        return {
            AliciBilgileri: {
                TCKN: patient ? (patient.tcNo || '11111111111') : '11111111111',
                Ad: patient ? patient.name.split(' ')[0] : 'Bilinmeyen',
                Soyad: patient ? patient.name.split(' ').slice(1).join(' ') || 'Hasta' : 'Hasta',
                Adres: patient ? patient.address || 'Belirtilmemiş' : 'Belirtilmemiş'
            },
            BelgeBilgileri: {
                BelgeTuru: "E-SMM",
                Tarih: new Date().toISOString().split('T')[0],
                ParaBirimi: "TRY"
            },
            Hizmetler: [
                {
                    Aciklama: transaction.description || transaction.category || "Diş Tedavi Hizmeti",
                    Tutar: Number(amountExcludingKdv.toFixed(2)),
                    KDVOrani: kdvRate * 100,
                    KDVTutari: Number(kdvAmount.toFixed(2)),
                    ToplamTutar: transaction.amount
                }
            ],
            ToplamTutar: transaction.amount
        };
    }

    async generateInvoice(transaction, patient, user) {
        console.log(`[E-INVOICE SERVICE] Generating invoice via ${this.provider}...`);
        
        const payload = this.buildInvoicePayload(transaction, patient);

        // Create initial pending log
        const logData = {
            transactionId: transaction._id,
            patientId: patient ? patient._id : undefined,
            clinicName: transaction.clinicName,
            amount: transaction.amount,
            requestPayload: { ...payload, AliciBilgileri: { TCKN: '***', Name: '***' } }, // Mask PII in log
            submittedBy: user._id,
            status: 'PENDING'
        };
        const invoiceLog = await eInvoiceRepository.create(logData);

        try {
            let mockInvoiceId, mockPdfUrl, isSuccess;

            if (!process.env.EINVOICE_API_KEY) {
                // Simulate API network delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                mockInvoiceId = `ESMM-${new Date().getFullYear()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
                mockPdfUrl = `https://mock-einvoice-portal.com/view/${mockInvoiceId}.pdf`;
                isSuccess = Math.random() < 0.95; // 95% success
            } else {
                // Real Integrator Call
                const response = await axios.post(`${this.baseUrl}/esmm/create`, payload, {
                    headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }
                });
                mockInvoiceId = response.data.invoiceId;
                mockPdfUrl = response.data.pdfUrl;
                isSuccess = true;
            }

            if (!isSuccess) {
                throw new Error('E-Invoice provider API validation error');
            }

            console.log(`[E-INVOICE SERVICE] Success! Invoice ID: ${mockInvoiceId}`);

            // Update log securely
            await eInvoiceRepository.update({ _id: invoiceLog._id }, {
                status: 'SUCCESS',
                invoiceId: mockInvoiceId,
                responsePayload: { documentUrl: mockPdfUrl, providerCode: '200_OK' }
            });

            return {
                invoiceId: mockInvoiceId,
                documentUrl: mockPdfUrl,
                status: 'GENERATED'
            };

        } catch (error) {
            console.error(`[E-INVOICE SERVICE] Error:`, error.message);
            await eInvoiceRepository.update(
                { _id: invoiceLog._id }, 
                { status: 'ERROR', errorMessage: error.message }
            );
            throw error;
        }
    }
}

module.exports = new EInvoiceService();
