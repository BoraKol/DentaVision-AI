/**
 * Generates an HTML invoice template for PDF conversion
 */
module.exports = (data) => {
    const { 
        invoiceId, 
        date, 
        clinicName, 
        patientName, 
        patientTc, 
        patientAddress, 
        items, 
        subTotal, 
        taxAmount, 
        total 
    } = data;

    return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <title>E-Serbest Meslek Makbuzu</title>
        <style>
            body { font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif; color: #333; margin: 0; padding: 40px; font-size: 14px; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; line-height: 24px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0d9488; padding-bottom: 20px; mb-20 }
            .header-info { text-align: right; }
            .header-info h2 { margin: 0; color: #0d9488; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; color: #1e293b; }
            .details { display: flex; justify-content: space-between; margin-top: 30px; margin-bottom: 30px; }
            .details div { width: 48%; }
            .details h4 { margin: 0 0 10px 0; color: #64748b; font-size: 14px; text-transform: uppercase; }
            .details p { margin: 0 0 5px 0; font-size: 14px; }
            table { w-full text-left border-collapse: collapse; width: 100%; margin-top: 20px; }
            th { background: #f8fafc; padding: 12px; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 600; text-align: left; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
            .amount { text-align: right; }
            .totals { margin-top: 30px; display: flex; justify-content: flex-end; }
            .totals-table { width: 300px; border-collapse: collapse; }
            .totals-table td { padding: 8px 12px; border: none; border-bottom: 1px solid #f1f5f9; }
            .totals-table .strong { font-weight: bold; color: #0f172a; }
            .footer { margin-top: 50px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
            .gib-banner { background: #fef08a; padding: 10px; text-align: center; font-size: 12px; font-weight: bold; border-radius: 4px; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class="invoice-box">
            <div class="gib-banner">
                GİB STANDARTLARINA UYGUN E-SERBEST MESLEK MAKBUZU ÇIKTISIDIR
            </div>
            <div class="header">
                <div>
                    <div class="title">${clinicName}</div>
                    <p style="font-size: 14px; color: #64748b;">Ağız ve Diş Sağlığı Merkezi</p>
                </div>
                <div class="header-info">
                    <h2>E-SMM</h2>
                    <p>Makbuz No: <strong>${invoiceId}</strong><br>
                    Tarih: <strong>${date}</strong></p>
                </div>
            </div>

            <div class="details">
                <div>
                    <h4>Gönderen</h4>
                    <p><strong>${clinicName}</strong></p>
                    <p>Mersis No: 0123456789000001</p>
                    <p>info@dentavision.com</p>
                </div>
                <div>
                    <h4>Alıcı (Hasta)</h4>
                    <p><strong>${patientName}</strong></p>
                    <p>TCKN: ${patientTc || '11111111111'}</p>
                    <p>Adres: ${patientAddress || 'Türkiye'}</p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Hizmet / Açıklama</th>
                        <th class="amount">KDV Oranı</th>
                        <th class="amount">KDV Tutarı</th>
                        <th class="amount">Hizmet Bedeli</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>${item.description}</td>
                            <td class="amount">%10</td>
                            <td class="amount">${item.kdvAmount.toFixed(2)} TL</td>
                            <td class="amount">${item.total.toFixed(2)} TL</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="totals">
                <table class="totals-table">
                    <tr>
                        <td>Ara Toplam:</td>
                        <td class="amount">${subTotal.toFixed(2)} TL</td>
                    </tr>
                    <tr>
                        <td>Hesaplanan KDV:</td>
                        <td class="amount">${taxAmount.toFixed(2)} TL</td>
                    </tr>
                    <tr class="strong" style="font-size: 18px;">
                        <td>Ödenecek Tutar:</td>
                        <td class="amount">${total.toFixed(2)} TL</td>
                    </tr>
                </table>
            </div>

            <div class="footer">
                Bu belge DentaVision AI tarafından elektronik olarak oluşturulmuştur. <br>
                Mali değeri belgeyi düzenleyenin elektronik imzasıyla birlikte geçerlidir.
            </div>
        </div>
    </body>
    </html>
    `;
};
