import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    type = 'danger'
}) => {
    const { language } = useLanguage();

    if (!isOpen) return null;

    const defaultTitle = type === 'danger'
        ? (language === 'tr' ? 'Silme Onayı' : 'Confirm Deletion')
        : (language === 'tr' ? 'Dikkat' : 'Warning');

    const defaultMessage = type === 'danger'
        ? (language === 'tr' ? 'Bu kaydı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.' : 'Are you sure you want to delete this record? This action cannot be undone.')
        : (language === 'tr' ? 'Emin misiniz?' : 'Are you sure?');

    const defaultConfirm = type === 'danger'
        ? (language === 'tr' ? 'Sil' : 'Delete')
        : (language === 'tr' ? 'Devam Et' : 'Continue');

    const defaultCancel = language === 'tr' ? 'İptal' : 'Cancel';

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center animate-in fade-in zoom-in duration-200">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                    {type === 'danger' ? (
                        <Trash2 className="w-6 h-6 text-red-600" />
                    ) : (
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    )}
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {title || defaultTitle}
                </h3>

                <p className="text-slate-500 mb-6">
                    {message || defaultMessage}
                </p>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                    >
                        {cancelText || defaultCancel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white rounded-lg shadow-sm transition-colors font-medium ${type === 'danger'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-yellow-600 hover:bg-yellow-700'
                            }`}
                    >
                        {confirmText || defaultConfirm}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
