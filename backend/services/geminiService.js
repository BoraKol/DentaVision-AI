const { GoogleGenAI } = require('@google/genai');

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        this.client = null;
        if (this.apiKey) {
            this.client = new GoogleGenAI({ apiKey: this.apiKey });
        } else {
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
            if (!this.client) {
                return "Mesajınız alındı, en kısa sürede dönüş yapacağız.";
            }

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

            const response = await this.client.models.generateContent({
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

    /**
     * Analyzes a dental radiograph to find conditions and map them to tooth numbers
     * @param {string} base64Image - Base64 encoded string of the radiograph
     * @returns {Array<Object>} - Structured JSON array of findings
     */
    async analyzeRadiograph(base64Image) {
        try {
            if (!this.client) {
                console.warn("No Gemini API key. Returning mock radiograph analysis.");
                return [
                    { toothNumber: '16', surfaces: ['O'], condition: 'Caries Repair', confidence: 0.92 },
                    { toothNumber: '24', surfaces: ['M', 'O', 'D'], condition: 'Composite Filling', confidence: 0.88 },
                    { toothNumber: '46', surfaces: ['General'], condition: 'Root Canal Treatment', confidence: 0.75 }
                ];
            }

            const prompt = `
             Role: DentaVision AI (Senior Dental Radiologist).
             Task: Analyze this dental radiograph with clinical precision.
             Instructions (STRICTLY FOLLOW):
             1. Report ONLY radiographic findings (ignore beds, chairs, cables, etc.).
             2. Identify visual evidence: radiolucency (decay/infection), radiopacity (fillings/restorations).
             3. For each finding, specify the FDI Tooth Number (11-48).
             4. Score urgency from 1 (Routine) to 5 (Emergency).
             5. Provide an empathetic interpretation summary for the patient in Turkish.
             6. Return a primary diagnosis summarizing the main issue.
            `;

            const response = await this.client.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [
                    prompt,
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: base64Image
                        }
                    }
                ],
                config: {
                    temperature: 0,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        required: ["primary_diagnosis", "interpretation", "findings", "urgency", "recommendations", "icd_10_codes"],
                        properties: {
                            primary_diagnosis: { type: "STRING" },
                            interpretation: { type: "STRING" },
                            findings: { 
                                type: "ARRAY", 
                                items: { 
                                    type: "OBJECT",
                                    required: ["toothNumber", "condition", "surfaces"],
                                    properties: {
                                        toothNumber: { type: "STRING" },
                                        condition: { type: "STRING" },
                                        surfaces: { type: "ARRAY", items: { type: "STRING" } }
                                    }
                                } 
                            },
                            urgency: { type: "INTEGER" },
                            recommendations: { type: "ARRAY", items: { type: "STRING" } },
                            icd_10_codes: { type: "ARRAY", items: { type: "STRING" } }
                        }
                    }
                }
            });

            let responseText = response.text || "{}";
            // Remove markdown json block if present
            responseText = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
            
            return JSON.parse(responseText);
        } catch (error) {
            console.error("Gemini Radiograph Analysis Error:", error);

            if (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED' || error?.status === 429) {
                console.warn("Gemini API quota exceeded. Returning fallback diagnostic.");
                return {
                    primary_diagnosis: "API Limit Aşımı",
                    interpretation: "API kotaları (1 Dakikada 15 İstek) dolduğu için analiz yapılamadı. Lütfen 1 dakika bekleyip tekrar deneyin.",
                    findings: [],
                    urgency: 1,
                    recommendations: ["Lütfen 1 dakika bekleyip işlemi tekrarlayınız."],
                    icd_10_codes: ["Z71.9"]
                };
            }

            throw new Error("Görüntü analizi sırasında bir hata oluştu.");
        }
    }
}

module.exports = new GeminiService();
