/**
 * Generates an HTML consent form template for PDF conversion
 */
module.exports = (data) => {
    const { 
        patientName, 
        patientTc, 
        formType, 
        content, 
        signatureDataUrl, 
        date, 
        ipAddress, 
        clinicName 
    } = data;

    return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <title>${formType}</title>
        <style>
            body { font-family: 'Helvetica', Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; font-size: 14px; line-height: 1.6; }
            .content-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; }
            .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #0d9488; margin: 0 0 10px 0; font-size: 24px; }
            .header p { color: #64748b; margin: 0; }
            .patient-info { display: flex; justify-content: space-between; background: #f8fafc; padding: 15px; margin-bottom: 30px; border-radius: 8px; }
            .patient-info p { margin: 5px 0; }
            .body-text { margin-bottom: 40px; text-align: justify; }
            .signature-section { display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 30px; margin-top: 50px; }
            .signature-box { text-align: center; width: 45%; }
            .signature-image { max-width: 100%; height: auto; max-height: 150px; border-bottom: 1px dashed #cbd5e1; margin-bottom: 10px; }
            .meta-data { margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
    </head>
    <body>
        <div class="content-box">
            <div class="header">
                <h1>${formType}</h1>
                <p>${clinicName} - Dijital Kayıt Sistemi</p>
            </div>

            <div class="patient-info">
                <div>
                    <p><strong>Hasta Adı Soyadı:</strong> ${patientName}</p>
                    <p><strong>T.C. Kimlik No:</strong> ${patientTc || 'Belirtilmemiş'}</p>
                </div>
                <div style="text-align: right;">
                    <p><strong>Tarih:</strong> ${date}</p>
                    <p><strong>IP Adresi:</strong> ${ipAddress || 'Bilinmiyor'}</p>
                </div>
            </div>

            <div class="body-text">
                ${content.replace(/\n/g, '<br>')}
            </div>

            <div class="signature-section">
                <div class="signature-box">
                    <p style="font-weight: bold; margin-bottom: 5px;">Hekim / Klinik Yetkilisi</p>
                    <p style="color: #64748b; margin-bottom: 50px;">E-imza / Sistem Onayı</p>
                    <p>${clinicName}</p>
                </div>
                <div class="signature-box">
                    <p style="font-weight: bold; margin-bottom: 5px;">Hasta Islak İmzası</p>
                    ${signatureDataUrl ? `<img src="${signatureDataUrl}" class="signature-image" alt="Hasta İmzası" />` : '<div style="height: 150px; border-bottom: 1px dashed #cbd5e1; margin-bottom: 10px;"></div>'}
                    <p>${patientName}</p>
                    <p style="font-size: 11px; color: #64748b;">(Dijital ortamda tablet/cihaz üzerinden alınmıştır)</p>
                </div>
            </div>

            <div class="meta-data">
                Bu belge KVKK mevzuatına ve Elektronik İmza Kanunu uyumluluk ilkelerine dijital onam formatında oluşturulmuştur.<br>
                Belge Hash Özeti (Sistemde Saklıdır)
            </div>
        </div>
    </body>
    </html>
    `;
};
