const patientRepository = require('../repositories/PatientRepository');
const communicationLogRepository = require('../repositories/CommunicationLogRepository');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const generateConsentHtml = require('../templates/consentTemplate');
const AppError = require('../utils/AppError');

class PatientService {
    async getAllPatients(clinicName, skip = 0, limit = 0) {
        return await patientRepository.findWithUserDetails(clinicName, skip, limit);
    }

    async getPatientById(id, clinicName) {
        return await patientRepository.findOne({ _id: id, clinicName }, 'userId analyses');
    }

    async createPatient(data, user) {
        const patient = await patientRepository.create({
            ...data,
            userId: user._id,
            clinicName: user.clinicName
        });
        return await patient.populate('userId', 'name title');
    }

    async updatePatient(id, clinicName, data) {
        const patient = await patientRepository.findOne({ _id: id, clinicName });
        if (!patient) {
            return null;
        }

        // Update fields individually to support mongoose middleware (e.g. password hashing)
        Object.keys(data).forEach(key => {
            patient[key] = data[key];
        });

        return await patient.save();
    }

    async deletePatient(id, userId) {
        return await patientRepository.delete({ _id: id, userId });
    }

    async getPatientCommunicationLogs(patientId) {
        return await communicationLogRepository.findByPatientId(patientId);
    }

    async generateConsentPdf(patientId, clinicName, consentData, userIp) {
        const patient = await patientRepository.findOne({ _id: patientId, clinicName });
        if (!patient) throw new AppError('Hasta bulunamadı', 404);

        const formType = consentData.formType || 'Aydınlatılmış Onam Formu';
        const dateStr = new Date().toLocaleString('tr-TR');

        // Prepare data for template
        const tplData = {
            patientName: patient.name,
            patientTc: patient.tcNo,
            formType,
            content: consentData.content || 'Standart onam metni...',
            signatureDataUrl: consentData.signatureDataUrl,
            date: dateStr,
            ipAddress: userIp,
            clinicName
        };

        const htmlContent = generateConsentHtml(tplData);

        // Define output directory and file
        const outputDir = path.join(__dirname, '../uploads/consents');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const filename = `CONSENT_${patient._id}_${Date.now()}.pdf`;
        const pdfPath = path.join(outputDir, filename);

        // Generate PDF
        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox'] 
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true
        });
        await browser.close();

        // Save URL to patient documents
        const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
        const pdfUrl = `${baseUrl}/uploads/consents/${filename}`;

        patient.documents = patient.documents || [];
        patient.documents.push({
            name: formType,
            url: pdfUrl,
            type: 'CONSENT_FORM'
        });
        await patient.save();

        return { success: true, url: pdfUrl };
    }
}

module.exports = new PatientService();

