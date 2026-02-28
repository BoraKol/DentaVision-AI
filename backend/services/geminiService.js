const { GoogleGenAI } = require('@google/genai');

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!this.apiKey) {
            console.warn("⚠️ No Gemini API Key found in backend env. AI responses will be fallback messages.");
        }
    }

    /**
     * Helper function to analyze patient message using Gemini
     * @param {string} message - The incoming message from the patient
     * @param {Object} patientDetails - Contextual details about the patient (name, history)
     * @returns {string} - The AI generated WhatsApp response
     */
    async analyzePatientMessage(message, patientDetails) {
        try {
            if (!this.apiKey) {
                return "Mesajınız alındı, en kısa sürede dönüş yapacağız.";
            }

            const client = new GoogleGenAI({ apiKey: this.apiKey });
            
            const prompt = `
            Sen DentaVision AI'sın. Şefkatli, profesyonel klinik asistanı bir yapay zekasın.
            Hasta aşağıda bir mesaj gönderdi. Eğer hasta ağrı, kanama, şişlik gibi acil/komplikasyon belirtiyorsa empati kur ve kliniğe gelmesini veya hekimin arayacağını söyle. Sadece randevu teyidi vb. ise nazikçe onayla.
            
            HASTA BİLGİSİ:
            Adı: ${patientDetails.name}
            
            HASTA MESAJI:
            "${message}"
            
            LÜTFEN SADECE HASTAYA GÖNDERİLECEK WHATSAPP YANIT METNİNİ (DİREKT MESAJ) DÖNDÜR.
            Yapay zeka olduğunu çok belli etme, klinik asistanı gibi konuş. Kısa ve öz olsun. 
            `;

            const response = await client.models.generateContent({
                model: "gemini-flash-latest",
                contents: prompt,
                config: {
                    temperature: 0.2, // Low temp for professional tone
                }
            });

            return response.text.trim();
        } catch (error) {
            console.error("Gemini WA Analysis Error:", error);
            return "Mesajınız kliniğimize ulaştı. Teşekkür ederiz."; // Fallback
        }
    }
}

module.exports = new GeminiService();
