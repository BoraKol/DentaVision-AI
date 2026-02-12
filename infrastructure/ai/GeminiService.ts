import { GoogleGenAI, Type } from "@google/genai";
import { IAIAnalysisService } from "../../core/domain/interfaces/IAIService";
import { Patient } from "../../core/domain/entities/Patient";
import { AnalysisResult, ImageAnalysisResult } from "../../core/domain/entities/AnalysisResult";
import { AppConfig } from "../config/AppConfig";
import { APP_CONSTANTS } from "../../core/constants";

export class GeminiService implements IAIAnalysisService {
    private client: GoogleGenAI;

    constructor() {
        const apiKey = AppConfig.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Gemini API Key is required");
        }
        this.client = new GoogleGenAI({ apiKey });
    }

    async analyzePatientRisk(patient: Patient, language: string = 'tr'): Promise<AnalysisResult> {
        const isTr = language === 'tr';

        const prompt = `
      Role: ${isTr ? 'DentaVision AI (Türkçe Karar Destek Sistemi)' : 'DentaVision AI (Clinical Decision Support System)'}.
      Task: ${isTr
                ? 'Bu hastayı risk, teşhis ve tedavi açısından detaylı analiz et. Türk bir diş hekimi gibi profesyonel tıbbi terminoloji kullan.'
                : 'Analyze this patient for risk, diagnosis, and treatment in detail. Use professional dental terminology.'}
      Patient Data:
      - ${isTr ? 'Yaş' : 'Age'}: ${patient.age}
      - ${isTr ? 'Cinsiyet' : 'Gender'}: ${patient.gender}
      - ${isTr ? 'Hikaye' : 'History'}: ${patient.history}
      - ${isTr ? 'Semptomlar' : 'Symptoms'}: ${patient.symptoms}
      - ${isTr ? 'Alışkanlıklar' : 'Habits'}: ${patient.habits}

      ${isTr ? 'Aciliyet Puanlama Kuralları (KESİN UY):' : 'Urgency Scoring Rules (STRICTLY FOLLOW):'}
      1: ${isTr ? 'Rutin kontrol, temizlik, estetik.' : 'Routine checkup, cleaning, aesthetic.'}
      2: ${isTr ? 'Başlangıç sızı, hassasiyet, ağrı yok.' : 'Early caries, sensitivity, no pain.'}
      3: ${isTr ? 'Çürük, kırık diş, orta seviye ağrı.' : 'Caries, broken tooth, moderate pain.'}
      4: ${isTr ? 'Apse, şiddetli ağrı, şişlik, enfeksiyon.' : 'Abscess, severe pain, swelling, infection.'}
      5: ${isTr ? 'Travma, kanama durmuyor, nefes darlığı.' : 'Trauma, uncontrollable bleeding, breathing difficulty.'}

      ${isTr ? 'Şu formatta JSON döndür:' : 'Return JSON in this format:'}
      1. diagnosis: ${isTr ? 'Klinik bulguların listesi' : 'List of clinical findings'}.
      2. urgency: ${isTr ? 'Kurallara göre 1-5 arası tam sayı' : 'Integer 1-5 based on rules'}.
      3. treatment_plan: 'short_term' (${isTr ? 'Acil/Kısa vadeli planlar' : 'Immediate/Short-term plans'}) & 'long_term' (${isTr ? 'Uzun vadeli/Koruyucu planlar' : 'Long-term/Maintenance plans'}).
      4. patient_notes: ${isTr ? 'Hasta için empatik, anlaşılır, Türkçe basit bir özet (maks 2 cümle)' : 'Empathetic, clear summary for the patient (max 2 sentences)'}.
      5. risk_profile: 'caries', 'perio', 'oralCancer', 'hygiene', 'diet' (${isTr ? '0-100 arası risk puanları' : 'risk scores 0-100'}).
      6. icd_10_codes: ${isTr ? 'İlgili ICD-10 kodları' : 'Relevant ICD-10 codes'}.
    `;

        try {
            const response = await this.client.models.generateContent({
                model: APP_CONSTANTS.MODELS.TEXT,
                contents: prompt,
                config: {
                    temperature: 0,
                    topP: 0.1,
                    topK: 1,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        required: ["diagnosis", "urgency", "treatment_plan", "patient_notes", "risk_profile", "icd_10_codes"],
                        properties: {
                            diagnosis: { type: Type.ARRAY, items: { type: Type.STRING } },
                            urgency: { type: Type.INTEGER },
                            treatment_plan: {
                                type: Type.OBJECT,
                                required: ["short_term", "long_term"],
                                properties: {
                                    short_term: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    long_term: { type: Type.ARRAY, items: { type: Type.STRING } }
                                }
                            },
                            patient_notes: { type: Type.STRING },
                            risk_profile: {
                                type: Type.OBJECT,
                                required: ["caries", "perio", "oralCancer", "hygiene", "diet"],
                                properties: {
                                    caries: { type: Type.NUMBER },
                                    perio: { type: Type.NUMBER },
                                    oralCancer: { type: Type.NUMBER },
                                    hygiene: { type: Type.NUMBER },
                                    diet: { type: Type.NUMBER }
                                }
                            },
                            icd_10_codes: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });

            return JSON.parse(response.text || "{}");
        } catch (error: any) {
            console.error("Gemini Analysis Error:", error);

            if (error?.message?.includes('API key expired') || error?.message?.includes('API_KEY_INVALID')) {
                console.warn("⚠️ Invalid API Key detected. Clearing local override.");
                localStorage.removeItem('denta_vision_gemini_key');
            }
            throw error;
        }
    }

    async analyzeRadiograph(base64Image: string): Promise<ImageAnalysisResult> {
        const prompt = `
      Role: DentaVision AI (Kıdemli Radyoloji Uzmanı).
      Task: Bu dental radyografiyi klinik hassasiyetle analiz et.
      
      Yönergeler (KESİN UY):
      1. Sadece radyografik bulguları raporla (bed, chair, tv gibi nesneleri KESİNLİKLE YOKSAY).
      2. Önce görsel kanıtı (radyolusens, radyoopak alanlar, periodontal aralıklar) tespit et.
      3. Tespit ettiğin her bulgu için spesifik FDI diş numarası belirt (11-48).
      4. Bulguları klinik ciddiyetine göre 1-5 arası puanla.
      5. Analiz sırasında her zaman aynı görsel özellikleri aynı şekilde yorumla.

      Çıktı JSON formatı:
      - findings: ["46 nolu dişte derin distal radyolusite", "18 nolu gömülü diş"]
      - diagnosis: Toplu klinik sonuç cümlesi.
      - urgency: 1-5 (Aciliyet).
      - recommendations: ["46 kanal tedavisi", "18 çekim"]
      - icd_10_codes: İlgili kodlar.
    `;

        try {
            const response = await this.client.models.generateContent({
                model: APP_CONSTANTS.MODELS.VISION,
                contents: {
                    parts: [
                        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
                        { text: prompt }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            findings: { type: Type.ARRAY, items: { type: Type.STRING } },
                            diagnosis: { type: Type.STRING },
                            urgency: { type: Type.INTEGER },
                            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                            icd_10_codes: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    },
                    temperature: 0,
                    topP: 0.1,
                    topK: 1
                }
            });

            return JSON.parse(response.text || "{}");
        } catch (error: any) {
            console.error("Gemini Vision Error:", error);

            if (error?.message?.includes('API key expired') || error?.message?.includes('API_KEY_INVALID')) {
                console.warn("⚠️ Invalid API Key detected. Clearing local override.");
                localStorage.removeItem('denta_vision_gemini_key');
            }
            throw error;
        }
    }

    async generateMorningBriefing(appointments: any[] = []): Promise<any> {
        // Format appointments for the prompt
        const appointmentsList = appointments.length > 0
            ? appointments.map(apt => {
                const pName = apt.patientId?.name || apt.patientName || "Bilinmeyen Hasta";
                return `- ${apt.time} ${pName}: ${apt.procedure} (${apt.status})`;
            }).join('\n')
            : "Bugün için planlanmış randevu bulunmuyor.";

        const prompt = `
    Bir diş hekimi için sabah brifingi JSON objesi oluştur.
    
    MEVCUT RANDEVU LISTESI:
    ${appointmentsList}

    GÖREV:
    Bu gerçek randevu listesini analiz et ve aşağıdaki JSON yapısını oluştur.
    Eğer hiç randevu yoksa, "patients" dizisini boş bırak ve "summary" alanında dinlenme/hazırlık önerisi ver.
    Randevular varsa, her biri için tahmini aciliyet (1-5) ve gerekli malzemeleri belirle.

    Döndürülmesi gereken JSON yapısı:
    {
      "patients": [
        // Sadece yukarıdaki listede olan gerçek randevuları buraya ekle. Asla hayali hasta uydurma.
        { "name": string, "time": string, "procedure": string, "urgency": number (1-5), "required_supplies": string[] (Gerekli malzemeler - Türkçe) }
      ],
      "summary": string (Günün özeti, yoğunluk analizi ve motivasyon. Not: 'Günaydın', 'Merhaba' gibi selamlaşma kelimeleri KULLANMA, direkt konuya gir.)
    }
    `;

        try {
            const response = await this.client.models.generateContent({
                model: APP_CONSTANTS.MODELS.TEXT,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    temperature: 0,
                    topP: 0.1,
                    topK: 1
                }
            });
            return JSON.parse(response.text || "{}");
        } catch (error: any) {
            console.error("Briefing Error:", error);

            // Self-Healing: If API key is invalid/expired, clear local storage to fallback to env var
            if (error?.message?.includes('API key expired') || error?.message?.includes('API_KEY_INVALID')) {
                console.warn("⚠️ Invalid API Key detected. Clearing local override to use environment variable.");
                localStorage.removeItem('denta_vision_gemini_key');
            }

            if (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED') {
                console.warn("Gemini API limit reached, returning fallback briefing");
                return {
                    summary: "AI Brifing limiti aşıldı. Randevu listenizi kontrol ediniz.",
                    patients: appointments.map(apt => ({
                        name: apt.patientName,
                        time: apt.time,
                        procedure: apt.procedure,
                        urgency: 1,
                        required_supplies: []
                    }))
                };
            }

            return {
                summary: "Brifing şu an hazırlanamıyor. Lütfen daha sonra tekrar deneyin.",
                patients: []
            };
        }
    }

    async suggestPrescription(symptoms: string, procedure?: string): Promise<any> {
        const prompt = `
    Aşağıdaki şikayetlere ve/veya tedaviye göre bir diş hekimi reçetesi (ilaçlar) önerisi oluştur. 
    Lütfen sadece tıbbi tavsiye niteliğinde olmadığını belirten bir notla birlikte JSON döndür.
    
    Şikayetler: ${symptoms}
    Yapılan İşlem: ${procedure || 'Belirtilmedi'}
    
    Döndürülmesi gereken JSON yapısı (drugs dizisi en az 1, en fazla 3 ilaç içermelidir):
    {
      "drugs": [{ "name": string, "dosage": string, "frequency": string, "duration": string, "instructions": string }],
      "notes": string (Kullanım önerisi ve doktor notu)
    }
    `;

        try {
            const response = await this.client.models.generateContent({
                model: APP_CONSTANTS.MODELS.TEXT,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    temperature: 0,
                    topP: 0.1,
                    topK: 1
                }
            });
            return JSON.parse(response.text || "{}");
        } catch (error: any) {
            console.error("AI Prescription Suggestion Error:", error);

            if (error?.message?.includes('API key expired') || error?.message?.includes('API_KEY_INVALID')) {
                console.warn("⚠️ Invalid API Key detected. Clearing local override.");
                localStorage.removeItem('denta_vision_gemini_key');
            }
            return { drugs: [], notes: "Öneri şu an oluşturulamadı." };
        }
    }

    async generateTreatmentPlan(findings: string[], patientHistory: any = {}): Promise<any> {
        const prompt = `
    Role: DentaVision AI (Uzman Diş Hekimi).
    Task: Aşağıdaki görsel analiz bulgularına ve hasta geçmişine dayanarak kapsamlı, 3 fazlı bir diş tedavisi planı oluştur.
    
    GÖRSEL ANALİZ BULGULARI (YOLO Tespiti):
    ${findings.length > 0 ? findings.join('\n') : 'Belirgin bir görsel bulgu yok, ancak klinik muayene önerilir.'}

    HASTA GEÇMİŞİ:
    ${JSON.stringify(patientHistory, null, 2)}

    YÖNERGELER:
    1. Gelen görsel analiz bulgularını (YOLO) süzgeçten geçir. 'bed', 'chair', 'tv', 'person' gibi diş hekimliği ile alakasız veya absürt nesneleri KESİNLİKLE YOKSAY. 
    2. Eğer anlamlı bir bulgu yoksa (sadece alakasız nesneler varsa), genel bir diş muayenesi planı oluştur.
    3. Her bir mantıklı bulguyu (varsa) klinik bir işlemle eşleştir.
    4. Tedavileri mantıksal bir sıraya (fazlara) koy:
       - Faz 1 (Acil/Enfeksiyon): Ağrı, apse, çekim gerektiren durumlar.
       - Faz 2 (Restoratif): Dolgu, kanal, protez hazırlığı.
       - Faz 3 (İdame/Estetik): Temizlik, beyazlatma, kontroller.
    5. Her işlem için tahmini bir maliyet (ortalama TDB fiyatları, TL) ve işlem kodu (örn: 501, 702) uydurma ama gerçekçi olsun.
    
    DÖNDÜRÜLMESİ GEREKEN JSON:
    {
      "treatment_items": [
        {
          "procedureName": string (İşlem adı - Türkçe),
          "toothNumber": string (İlgili diş no veya bölge, örn: "46", "Alt Çene"),
          "phase": "urgent" | "restorative" | "maintenance",
          "cost": number (Tahmini fiyat),
          "rationale": string (Neden bu tedavi seçildi?)
        }
      ],
      "summary": string (Hasta için anlaşılır, motive edici kısa bir özet.)
    }
    `;

        try {
            const response = await this.client.models.generateContent({
                model: APP_CONSTANTS.MODELS.TEXT,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            treatment_items: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        procedureName: { type: Type.STRING },
                                        toothNumber: { type: Type.STRING },
                                        phase: { type: Type.STRING, enum: ["urgent", "restorative", "maintenance"] },
                                        cost: { type: Type.NUMBER },
                                        rationale: { type: Type.STRING }
                                    },
                                    required: ["procedureName", "phase", "cost", "rationale"]
                                }
                            },
                            summary: { type: Type.STRING }
                        },
                        required: ["treatment_items", "summary"]
                    },
                    temperature: 0,
                    topP: 0.1,
                    topK: 1
                }
            });
            return JSON.parse(response.text || "{}");
        } catch (error: any) {
            console.error("AI Treatment Plan Generation Error:", error);

            if (error?.message?.includes('API key expired') || error?.message?.includes('API_KEY_INVALID')) {
                console.warn("⚠️ Invalid API Key detected. Clearing local override.");
                localStorage.removeItem('denta_vision_gemini_key');
            }

            return {
                treatment_items: [],
                summary: "Tedavi planı oluşturulamadı. Lütfen manuel giriş yapın."
            };
        }
    }
}
