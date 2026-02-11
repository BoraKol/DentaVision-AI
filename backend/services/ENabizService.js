const ENabizLog = require('../models/ENabizLog');

class ENabizService {
    constructor() {
        this.baseUrl = 'https://sys.saglik.gov.tr/rest/api'; // Fake URL
    }

    async sendData(patientId, actionType, data, userId) {
        console.log(`🏥 [E-Nabız Mock] Sending ${actionType} for patient ${patientId}`);
        console.log('📦 Payload:', JSON.stringify(data, null, 2));

        // Create initial log
        const transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const log = await ENabizLog.create({
            patientId,
            transactionId,
            actionType,
            status: 'PENDING',
            requestData: data,
            submittedBy: userId
        });

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate success/failure randomly (mostly success)
        const isSuccess = Math.random() > 0.1;

        if (isSuccess) {
            log.status = 'SUCCESS';
            log.responseData = {
                sysTakipNo: `SYS-${Date.now()}`,
                resultCode: '0000',
                resultMessage: 'ISLEM BASARI ILE KAYDEDILDI'
            };
            console.log(`✅ [E-Nabız Mock] Success: ${log.responseData.sysTakipNo}`);
        } else {
            log.status = 'ERROR';
            log.errorCode = 'E-102';
            log.errorMessage = 'MUKERRER KAYIT VEYA GECERSIZ HASTA BILGISI';
            log.responseData = {
                resultCode: '102',
                resultMessage: 'MUKERRER KAYIT'
            };
            console.error(`❌ [E-Nabız Mock] Failed: ${log.errorMessage}`);
        }

        await log.save();
        return {
            success: isSuccess,
            transactionId,
            response: log.responseData
        };
    }
}

module.exports = new ENabizService();
