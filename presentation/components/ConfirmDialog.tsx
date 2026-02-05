import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    variant = 'danger'
}) => {
    const { t, language } = useLanguage();

    if (!isOpen) return null;

    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    icon: 'bg-red-100 text-red-600',
                    button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
                };
            case 'warning':
                return {
                    icon: 'bg-amber-100 text-amber-600',
                    button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
                };
            case 'info':
                return {
                    icon: 'bg-blue-100 text-blue-600',
                    button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
                };
        }
    };

    const styles = getVariantStyles();
    const defaultTitle = language === 'tr' ? 'Onay Gerekli' : 'Confirmation Required';
    const defaultConfirmText = language === 'tr' ? 'Onayla' : 'Confirm';
    const defaultCancelText = language === 'tr' ? 'İptal' : 'Cancel';

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-6 pt-8 text-center">
                    {/* Icon */}
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${styles.icon} flex items-center justify-center`}>
                        <AlertTriangle className="w-8 h-8" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {title || defaultTitle}
                    </h3>

                    {/* Message */}
                    <p className="text-slate-600 mb-6 leading-relaxed">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-slate-700 font-medium bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
                        >
                            {cancelText || defaultCancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            className={`px-6 py-2.5 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.button}`}
                        >
                            {confirmText || defaultConfirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
