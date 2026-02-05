import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { exportService } from '../../infrastructure/services/ExportService';

interface ExportMenuProps {
    type: 'patients' | 'appointments' | 'treatment';
    data: any[];
    disabled?: boolean;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ type, data, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToast();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExport = (format: 'csv' | 'excel') => {
        if (data.length === 0) {
            addToast('Dışa aktarılacak veri bulunamadı.', 'warning');
            setIsOpen(false);
            return;
        }

        try {
            switch (type) {
                case 'patients':
                    if (format === 'excel') {
                        exportService.exportPatients(data);
                    } else {
                        exportService.exportToCSV({
                            headers: ['ID', 'Ad Soyad', 'Yaş', 'Cinsiyet'],
                            rows: data.map(p => [p.id, p.name, p.age, p.gender]),
                            filename: 'hastalar'
                        });
                    }
                    break;
                case 'appointments':
                    if (format === 'excel') {
                        exportService.exportAppointments(data);
                    } else {
                        exportService.exportToCSV({
                            headers: ['ID', 'Hasta', 'Tarih', 'Saat', 'İşlem'],
                            rows: data.map(a => [a.id, a.patientName, new Date(a.date).toLocaleDateString('tr-TR'), a.time, a.procedure]),
                            filename: 'randevular'
                        });
                    }
                    break;
                case 'treatment':
                    if (format === 'excel') {
                        exportService.exportTreatmentPlan(data);
                    } else {
                        exportService.exportToCSV({
                            headers: ['İşlem Adı', 'Diş No', 'Faz', 'Durum', 'Ücret'],
                            rows: data.map(i => [i.procedureName, i.toothNumber || '-', i.phase, i.status, i.cost || 0]),
                            filename: 'tedavi_plani'
                        });
                    }
                    break;
            }
            addToast('Veriler başarıyla dışa aktarıldı.', 'success');
        } catch (error) {
            console.error('Export error:', error);
            addToast('Dışa aktarma sırasında hata oluştu.', 'error');
        }

        setIsOpen(false);
    };

    const getLabel = () => {
        switch (type) {
            case 'patients': return 'Hasta Listesi';
            case 'appointments': return 'Randevular';
            case 'treatment': return 'Tedavi Planı';
            default: return 'Veriler';
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-colors
                    ${disabled
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                    }
                `}
            >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Dışa Aktar</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && !disabled && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                    <div className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                        {getLabel()} İndir
                    </div>

                    <button
                        onClick={() => handleExport('excel')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        <div className="text-left">
                            <div className="font-medium">Excel (CSV)</div>
                            <div className="text-xs text-slate-500">Tüm alanlar dahil</div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleExport('csv')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div className="text-left">
                            <div className="font-medium">CSV (Basit)</div>
                            <div className="text-xs text-slate-500">Temel alanlar</div>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExportMenu;
