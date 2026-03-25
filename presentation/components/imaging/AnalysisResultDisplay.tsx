import React from 'react';
import { AlertOctagon, Info, PlusCircle, FileDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface AnalysisResultDisplayProps {
    result: any;
    labels: any;
    urgencyBg: string;
    onAddToPlan: (finding: any) => void;
    onGenerateReport: () => void;
    isGenerating: boolean;
}

const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({
    result,
    labels,
    urgencyBg,
    onAddToPlan,
    onGenerateReport,
    isGenerating
}) => {
    const { language } = useLanguage();

    if (!result) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center h-full">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <AlertOctagon className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">{labels.analysisResults}</h3>
                <p className="text-slate-400 max-w-xs text-sm">
                    {language === 'tr' ? 'Sonuçları görmek için bir resim yükleyin ve analizi başlatın.' : 'Upload an image and start analysis to see results.'}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                    <Scan className="w-6 h-6 mr-2 text-teal-600" />
                    {labels.analysisResults}
                </h2>
                <button
                    onClick={onGenerateReport}
                    disabled={isGenerating}
                    className="flex items-center space-x-2 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-100 text-sm font-semibold transition-colors disabled:opacity-50"
                >
                    <FileDown className="w-4 h-4" />
                    <span>{isGenerating ? labels.generating : labels.downloadPdf}</span>
                </button>
            </div>

            <div className="space-y-6">
                {/* Gemini Result */}
                <div className="p-5 rounded-xl border border-teal-100 bg-gradient-to-br from-white to-teal-50/30">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mb-1">{labels.diagnosis}</div>
                            <h3 className="text-lg font-bold text-slate-800 leading-tight">{result.geminiResult.primary_diagnosis}</h3>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm ${urgencyBg}`}>
                            {language === 'tr' ? 'ACİLİYET' : 'URGENCY'}: {result.geminiResult.urgency}/5
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-teal-50 mb-6">
                        <div className="flex items-center text-teal-700 text-xs font-bold mb-2 uppercase italic">
                            <Info className="w-3.5 h-3.5 mr-1.5" />
                            {language === 'tr' ? 'AI ANALİZ ÖZETİ' : 'AI ANALYSIS SUMMARY'}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                            "{result.geminiResult.interpretation}"
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-700 mb-2">{labels.detailedFindings}</h3>
                        <ul className="space-y-2">
                            {result.geminiResult.findings && Array.isArray(result.geminiResult.findings) && result.geminiResult.findings.map((finding: any, idx: number) => (
                                <li key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-md text-sm text-slate-700 border-l-4 border-teal-500 group">
                                    <span>
                                        {typeof finding === 'object' && finding !== null
                                            ? `Tooth #${finding.toothNumber} - ${finding.condition}${finding.surfaces?.length > 0 ? ` (${finding.surfaces.join(', ')})` : ''}`
                                            : finding}
                                    </span>
                                    <button
                                        onClick={() => onAddToPlan(finding)}
                                        className="ml-2 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-teal-50 p-1 rounded"
                                        title={labels.addToTreatment}
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-4 border border-slate-200 rounded-lg">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">{language === 'tr' ? 'ÖNERİLEN İŞLEMLER' : 'RECOMMENDED PROCEDURES'}</span>
                            <ul className="space-y-1">
                                {result.geminiResult.recommendations && result.geminiResult.recommendations.map((rec: string, i: number) => (
                                    <li key={i} className="text-xs text-slate-500 flex items-start">
                                        <span className="mr-1.5 text-teal-500 mt-0.5">•</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-4 border border-slate-200 rounded-lg">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">{language === 'tr' ? 'KONTROL NOTLARI' : 'CHECK NOTES'}</span>
                            <p className="text-xs text-slate-500">
                                {language === 'tr' ? 'Klinik muayene ve radyografik bulgular birlikte değerlendirilmelidir.' : 'Clinical examination and radiographic findings should be evaluated together.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal Import for Scan
const Scan = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M7 12h10" /><path d="M12 7v10" /></svg>
);

export default AnalysisResultDisplay;
