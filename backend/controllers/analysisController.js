const Analysis = require('../models/Analysis');
const Patient = require('../models/Patient');
const geminiService = require('../services/geminiService');

exports.createAnalysis = async (req, res, next) => {
    try {
        const { patientId, imageUrl, notes } = req.body;
        const clinicName = req.user.clinicName;

        const patient = await Patient.findOne({ _id: patientId, clinicName });
        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient not found' });
        }

        let aiFindings = [];
        let aiDiagnosis = 'Görüntü Analizi';
        let aiDetails = null;

        if (imageUrl && imageUrl.startsWith('data:image')) {
            // It's a base64 image, we can analyze it
            const base64Data = imageUrl.split(',')[1];
            try {
                const analysisResult = await geminiService.analyzeRadiograph(base64Data);
                if (analysisResult) {
                    aiFindings = analysisResult.findings || [];
                    aiDiagnosis = analysisResult.primary_diagnosis || 'AI Destekli Radyolojik Analiz';
                    aiDetails = {
                        interpretation: analysisResult.interpretation,
                        urgency: analysisResult.urgency,
                        recommendations: analysisResult.recommendations,
                        icd_10_codes: analysisResult.icd_10_codes
                    };
                }
            } catch (aiErr) {
                console.error("AI Analysis failed but continuing with manual save:", aiErr);
                aiDiagnosis = 'Radyolojik Analiz (AI Hatası)';
            }
        }

        const analysis = await Analysis.create({
            userId: req.user._id,
            patientId,
            imageUrl,
            diagnosis: aiDiagnosis,
            findings: aiFindings,
            aiDetails,
            notes
        });

        // Update patient references
        patient.analyses.push(analysis._id);
        patient.analysisCount += 1;
        await patient.save();

        res.status(201).json({
            success: true,
            data: analysis
        });
    } catch (err) {
        next(err);
    }
};

exports.getPatientAnalyses = async (req, res, next) => {
    try {
        const patient = await Patient.findOne({ _id: req.params.patientId, clinicName: req.user.clinicName });
        if (!patient) {
             return res.status(404).json({ success: false, error: 'Patient not found' });
        }

        const analyses = await Analysis.find({ patientId: req.params.patientId })
            .sort({ date: -1 })
            .populate('userId', 'name');

        res.status(200).json({
            success: true,
            count: analyses.length,
            data: analyses
        });
    } catch (err) {
        next(err);
    }
};
