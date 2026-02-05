import React from 'react';
import { Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    isDeleting?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isDeleting = false
}) => {
    const { t, language } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 transform transition-all scale-100">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                        {title || (language === 'tr' ? 'Silme Onayı' : 'Delete Confirmation')}
                    </h3>
                    <p className="text-slate-600 mb-6">
                        {message || t('common.areYouSure')}
                    </p>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                            disabled={isDeleting}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className={`flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-sm transition-colors flex items-center justify-center ${isDeleting ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {isDeleting ? '...' : (language === 'tr' ? 'Evet, Sil' : 'Delete')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
