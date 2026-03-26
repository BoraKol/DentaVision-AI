const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const puppeteer = require('puppeteer');
const eInvoiceRepository = require('../repositories/EInvoiceRepository');
const transactionRepository = require('../repositories/TransactionRepository');
const generateHtml = require('../templates/invoiceTemplate');
const generateXml = require('../templates/ublTemplate');

class EInvoiceService {
    constructor() {
        this.outputDir = path.join(__dirname, '../uploads/invoices');
        
        // Ensure directory exists
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * Builds data structure required by our HTML and XML templates
     */
    buildTemplateData(transaction, patient) {
        const kdvRate = 0.10; // 10% VAT
        const amountExcludingKdv = transaction.amount / (1 + kdvRate);
        const kdvAmount = transaction.amount - amountExcludingKdv;

        const dateObj = new Date(transaction.date || new Date());
        const dateStr = dateObj.toLocaleDateString('tr-TR');
        
        const invoiceId = `ESMM${dateObj.getFullYear()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        return {
            invoiceId,
            date: dateStr,
            clinicName: transaction.clinicName || 'DentaVision Clinic',
            patientName: patient ? patient.name : 'Misafir Hasta',
            patientTc: patient ? patient.tcNo : '11111111111',
            patientAddress: patient ? patient.address : 'Türkiye',
            items: [
                {
                    description: transaction.description || transaction.category || 'Diş Tedavi Hizmeti',
                    kdvAmount,
                    total: transaction.amount
                }
            ],
            subTotal: amountExcludingKdv,
            taxAmount: kdvAmount,
            total: transaction.amount
        };
    }

    async generateInvoice(transaction, patient, user) {
        console.log(`[E-INVOICE SERVICE] Generating local invoice PDF/XML for transaction ${transaction._id}...`);
        
        const tplData = this.buildTemplateData(transaction, patient);

        // Create initial pending log
        const logData = {
            transactionId: transaction._id,
            patientId: patient ? patient._id : undefined,
            clinicName: tplData.clinicName,
            invoiceId: tplData.invoiceId,
            amount: transaction.amount,
            requestPayload: { ...tplData, patientTc: '***' }, // Mask PII
            submittedBy: user._id,
            status: 'PENDING'
        };
        const invoiceLog = await eInvoiceRepository.create(logData);

        try {
            // Generate HTML & XML strings
            const htmlContent = generateHtml(tplData);
            const xmlContent = generateXml(tplData);

            // File paths
            const pdfFilename = `${tplData.invoiceId}.pdf`;
            const xmlFilename = `${tplData.invoiceId}.xml`;
            const pdfPath = path.join(this.outputDir, pdfFilename);
            const xmlPath = path.join(this.outputDir, xmlFilename);

            // Generate PDF with Puppeteer
            const browser = await puppeteer.launch({ 
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox'] 
            });
            const page = await browser.newPage();
            
            // Set content and wait for networkidle
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            
            await page.pdf({
                path: pdfPath,
                format: 'A4',
                printBackground: true,
                margin: { top: '10px', bottom: '10px' }
            });

            await browser.close();

            // Save XML to disk
            fs.writeFileSync(xmlPath, xmlContent, 'utf8');

            // Public URLs assuming Express serves /uploads statically
            const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
            const pdfUrl = `${baseUrl}/uploads/invoices/${pdfFilename}`;
            const xmlUrl = `${baseUrl}/uploads/invoices/${xmlFilename}`;

            console.log(`[E-INVOICE SERVICE] Success! Invoice generated at ${pdfUrl}`);

            // Update log securely
            await eInvoiceRepository.update({ _id: invoiceLog._id }, {
                status: 'SUCCESS',
                responsePayload: { 
                    pdfUrl, 
                    xmlUrl,
                    generatedDate: new Date()
                }
            });

            // Return full info
            return {
                invoiceId: tplData.invoiceId,
                documentUrl: pdfUrl,
                xmlUrl: xmlUrl,
                status: 'GENERATED'
            };

        } catch (error) {
            console.error(`[E-INVOICE SERVICE] Error generating PDF/XML:`, error.message);
            await eInvoiceRepository.update(
                { _id: invoiceLog._id }, 
                { status: 'ERROR', errorMessage: error.message }
            );
            throw error;
        }
    }
}

module.exports = new EInvoiceService();
