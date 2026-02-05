/**
 * ExportService - Handles CSV and Excel-like exports
 */

export interface ExportableData {
    headers: string[];
    rows: (string | number | undefined)[][];
    filename: string;
}

class ExportService {
    /**
     * Export data to CSV format
     */
    exportToCSV(data: ExportableData): void {
        const csvContent = this.generateCSV(data.headers, data.rows);
        this.downloadFile(csvContent, `${data.filename}.csv`, 'text/csv;charset=utf-8;');
    }

    /**
     * Export data to Excel-compatible format (CSV with BOM for UTF-8)
     */
    exportToExcel(data: ExportableData): void {
        // Add BOM for Excel to properly recognize UTF-8
        const BOM = '\uFEFF';
        const csvContent = BOM + this.generateCSV(data.headers, data.rows);
        this.downloadFile(csvContent, `${data.filename}.csv`, 'text/csv;charset=utf-8;');
    }

    /**
     * Export patients list
     */
    exportPatients(patients: any[]): void {
        const headers = ['ID', 'Ad Soyad', 'Yaş', 'Cinsiyet', 'Telefon', 'E-posta', 'Tıbbi Geçmiş', 'Kayıt Tarihi'];
        const rows = patients.map(p => [
            p.id,
            p.name,
            p.age,
            p.gender === 'Male' ? 'Erkek' : p.gender === 'Female' ? 'Kadın' : 'Diğer',
            p.phone || '',
            p.email || '',
            p.history || '',
            p.createdAt ? new Date(p.createdAt).toLocaleDateString('tr-TR') : ''
        ]);

        this.exportToExcel({
            headers,
            rows,
            filename: `hastalar_${this.getDateString()}`
        });
    }

    /**
     * Export appointments list
     */
    exportAppointments(appointments: any[]): void {
        const headers = ['ID', 'Hasta', 'Tarih', 'Saat', 'Süre (dk)', 'İşlem', 'Durum', 'Notlar'];
        const statusMap: Record<string, string> = {
            scheduled: 'Planlandı',
            confirmed: 'Onaylandı',
            completed: 'Tamamlandı',
            cancelled: 'İptal',
            no_show: 'Gelmedi'
        };

        const rows = appointments.map(a => [
            a.id,
            a.patientName,
            new Date(a.date).toLocaleDateString('tr-TR'),
            a.time,
            a.duration,
            a.procedure,
            statusMap[a.status] || a.status,
            a.notes || ''
        ]);

        this.exportToExcel({
            headers,
            rows,
            filename: `randevular_${this.getDateString()}`
        });
    }

    /**
     * Export treatment plan items
     */
    exportTreatmentPlan(items: any[]): void {
        const headers = ['ID', 'İşlem Adı', 'Diş No', 'Faz', 'Durum', 'Ücret (₺)'];
        const phaseMap: Record<string, string> = {
            urgent: 'Acil',
            restorative: 'Restoratif',
            maintenance: 'İdame'
        };
        const statusMap: Record<string, string> = {
            pending: 'Bekliyor',
            in_progress: 'Yapılıyor',
            completed: 'Tamamlandı'
        };

        const rows = items.map(i => [
            i.id,
            i.procedureName,
            i.toothNumber || '-',
            phaseMap[i.phase] || i.phase,
            statusMap[i.status] || i.status,
            i.cost || 0
        ]);

        // Add total row
        const total = items.reduce((sum, i) => sum + (i.cost || 0), 0);
        rows.push(['', '', '', '', 'TOPLAM', total]);

        this.exportToExcel({
            headers,
            rows,
            filename: `tedavi_plani_${this.getDateString()}`
        });
    }

    private generateCSV(headers: string[], rows: (string | number | undefined)[][]): string {
        const escape = (val: any): string => {
            if (val === undefined || val === null) return '';
            const str = String(val);
            // Escape quotes and wrap in quotes if contains special chars
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const headerLine = headers.map(escape).join(',');
        const dataLines = rows.map(row => row.map(escape).join(','));

        return [headerLine, ...dataLines].join('\n');
    }

    private downloadFile(content: string, filename: string, mimeType: string): void {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    private getDateString(): string {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
}

export const exportService = new ExportService();
