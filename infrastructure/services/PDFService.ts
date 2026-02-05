import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IPDFService, ReportData } from '../../core/domain/interfaces/IPDFService';

export class PDFService implements IPDFService {

    // Helper to transliterate Turkish characters if font loading fails
    private transliterate(text: string): string {
        if (!text) return "";
        return text
            .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
            .replace(/ü/g, 'u').replace(/Ü/g, 'U')
            .replace(/ş/g, 's').replace(/Ş/g, 'S')
            .replace(/ı/g, 'i').replace(/İ/g, 'I')
            .replace(/ö/g, 'o').replace(/Ö/g, 'O')
            .replace(/ç/g, 'c').replace(/Ç/g, 'C');
    }

    async generateReport(data: ReportData): Promise<void> {
        const doc = new jsPDF();
        let useTransliteration = true; // Default to true until font loads

        // --- Fonts & Setup ---
        try {
            // Using GitHub Raw for better CORS support
            const fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/apache/roboto/Roboto-Regular.ttf';
            const fontBytes = await fetch(fontUrl).then(res => {
                if (!res.ok) throw new Error("Font fetch failed");
                return res.arrayBuffer();
            });

            // Convert to base64
            const uint8Array = new Uint8Array(fontBytes);
            let binaryString = '';
            for (let i = 0; i < uint8Array.length; i++) {
                binaryString += String.fromCharCode(uint8Array[i]);
            }
            const base64Font = window.btoa(binaryString);

            doc.addFileToVFS('Roboto-Regular.ttf', base64Font);
            doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
            doc.setFont('Roboto');
            useTransliteration = false; // Font loaded successfully
        } catch (e) {
            console.error("Font loading failed, falling back to Helvetica with transliteration.", e);
            doc.setFont("helvetica");
            useTransliteration = true;
        }

        // Text processor wrapper
        const t = (text: string | undefined | null) => {
            const safeText = text || "";
            return useTransliteration ? this.transliterate(safeText) : safeText;
        };

        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        let yPos = 20;

        // --- Header ---
        // Clinic Name
        doc.setFontSize(22);
        doc.setTextColor(0, 128, 128); // Teal color
        doc.text(t(data.doctor.clinicName), margin, yPos);

        // Doctor Info
        doc.setFontSize(10);
        doc.setTextColor(100);
        yPos += 8;
        doc.text(t(`${data.doctor.title} ${data.doctor.name}`), margin, yPos);
        yPos += 5;
        doc.text(t(data.doctor.specialty), margin, yPos);
        yPos += 5;
        doc.text(t(data.doctor.email), margin, yPos);

        // Date
        const dateStr = data.date.toLocaleDateString('tr-TR');
        doc.setFontSize(10);
        doc.setTextColor(50);
        doc.text(t(`Tarih: ${dateStr}`), pageWidth - margin - 30, 20);

        // Line separator
        yPos += 10;
        doc.setDrawColor(200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        // --- Patient Info ---
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(t("Hasta Bilgileri"), margin, yPos);
        yPos += 10;

        doc.setFontSize(11);
        doc.setTextColor(60);
        doc.text(t(`Ad Soyad: ${data.patient.name}`), margin, yPos);
        yPos += 6;
        doc.text(t(`Cinsiyet: ${data.patient.gender === 'Male' ? 'Erkek' : 'Kadın'}`), margin, yPos);
        yPos += 6;
        doc.text(t(`Yaş: ${data.patient.age}`), margin, yPos);

        // --- Radiograph Image ---
        if (data.radiographImage) {
            yPos += 10;
            // Add image
            const imgData = data.radiographImage;
            const imgProps = doc.getImageProperties(imgData);
            const imgWidth = 100;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            // Check if page break needed
            if (yPos + imgHeight > 280) {
                doc.addPage();
                yPos = 20;
            }

            doc.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 10;
        }

        // --- Analysis Findings ---
        if (yPos > 240) { doc.addPage(); yPos = 20; }

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(t("Radyografik Analiz Bulguları"), margin, yPos);
        yPos += 10;

        // Findings Table
        const rawFindings = data.analysis.findings;
        const findingsData = (rawFindings && Array.isArray(rawFindings) && rawFindings.length > 0)
            ? rawFindings.map(f => [t(f)])
            : [[t('Bulgu bulunamadı')]];

        autoTable(doc, {
            startY: yPos,
            head: [[t('Bulgular')]],
            body: findingsData,
            theme: 'grid',
            headStyles: { fillColor: [0, 128, 128] },
            styles: { font: useTransliteration ? "helvetica" : "Roboto", overflow: 'linebreak', cellPadding: 3 },
            columnStyles: { 0: { cellWidth: 'auto' } },
            margin: { left: margin, right: margin }
        });

        // Update yPos
        // @ts-ignore
        yPos = doc.lastAutoTable.finalY + 15;

        // --- Diagnosis ---
        if (yPos > 250) { doc.addPage(); yPos = 20; }

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(t("Teşhis (Diagnosis):"), margin, yPos);
        yPos += 7;
        doc.setFontSize(11);
        doc.setTextColor(60);

        const diagnosisText = data.analysis.diagnosis || "Teşhis belirtilmedi.";

        // Split text to fit width
        const splitDiagnosis = doc.splitTextToSize(t(diagnosisText), pageWidth - (margin * 2));
        doc.text(splitDiagnosis, margin, yPos);
        yPos += (splitDiagnosis.length * 6) + 10;

        // --- Recommendations ---
        if (yPos > 250) { doc.addPage(); yPos = 20; }

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(t("Önerilen Tedavi Planı & İşlemler:"), margin, yPos);
        yPos += 7;

        const rawRecommendations = data.analysis.recommendations;
        const recData = (rawRecommendations && Array.isArray(rawRecommendations) && rawRecommendations.length > 0)
            ? rawRecommendations.map(r => [t(r)])
            : [[t('Öneri bulunamadı')]];

        autoTable(doc, {
            startY: yPos,
            head: [[t('Öneriler')]],
            body: recData,
            theme: 'striped',
            headStyles: { fillColor: [70, 70, 70] },
            styles: { font: useTransliteration ? "helvetica" : "Roboto", cellPadding: 3 },
            margin: { left: margin, right: margin }
        });

        // --- Treatment Plan ---
        if (data.treatmentPlan && data.treatmentPlan.length > 0) {
            // @ts-ignore
            yPos = doc.lastAutoTable.finalY + 15;
            if (yPos > 250) { doc.addPage(); yPos = 20; }

            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(t("Planlanan Tedaviler:"), margin, yPos);
            yPos += 7;

            const planData = data.treatmentPlan.map(item => [
                t(item.toothNumber || '-'),
                t(item.procedureName),
                t(item.phase === 'urgent' ? 'Acil' : item.phase === 'restorative' ? 'Restoratif' : 'İdame'),
                t(item.status === 'pending' ? 'Bekliyor' : item.status === 'in_progress' ? 'İşlemde' : 'Tamamlandı'),
                t(item.cost ? `${item.cost} TL` : '-')
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [[t('Diş No'), t('İşlem'), t('Faz'), t('Durum'), t('Ücret')]],
                body: planData,
                theme: 'grid',
                headStyles: { fillColor: [0, 102, 204] },
                styles: { font: useTransliteration ? "helvetica" : "Roboto", fontSize: 9, cellPadding: 3 },
                margin: { left: margin, right: margin }
            });
        }

        // --- Footer ---
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(t(`Sayfa ${i} / ${pageCount} - DentaVision AI tarafından oluşturulmuştur.`), pageWidth / 2, 290, { align: 'center' });
        }

        // Save
        doc.save(`DentaVision_Report_${data.patient.name.replace(/\s+/g, '_')}.pdf`);
    }
}
