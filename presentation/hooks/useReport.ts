import { useState, useMemo } from 'react';
import { PDFService } from '../../infrastructure/services/PDFService';
import { GenerateReportUseCase } from '../../core/application/use-cases/GenerateReportUseCase';
import { ReportData } from '../../core/domain/interfaces/IPDFService';
import { useToast } from '../context/ToastContext';

export const useReport = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const { addToast } = useToast();

    // Simple DI
    const pdfService = useMemo(() => new PDFService(), []);
    const generateReportUseCase = useMemo(() => new GenerateReportUseCase(pdfService), [pdfService]);

    const generateReport = async (data: ReportData) => {
        setIsGenerating(true);
        try {
            await generateReportUseCase.execute(data);
            addToast("Rapor başarıyla oluşturuldu!", 'success');
        } catch (e) {
            console.error("Report generation failed", e);
            addToast("Rapor oluşturulurken bir hata oluştu.", 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    return { generateReport, isGenerating };
};
