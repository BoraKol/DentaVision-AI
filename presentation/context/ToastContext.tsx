import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (message: string, type: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType, duration = 4000) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, (toast.duration || 4000) - 300);

        const removeTimer = setTimeout(() => {
            onClose();
        }, toast.duration || 4000);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [toast, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    };

    const bgStyles = {
        success: 'bg-emerald-50 border-emerald-200',
        error: 'bg-red-50 border-red-200',
        info: 'bg-blue-50 border-blue-200',
        warning: 'bg-amber-50 border-amber-200',
    };

    const textStyles = {
        success: 'text-emerald-800',
        error: 'text-red-800',
        info: 'text-blue-800',
        warning: 'text-amber-800',
    };

    return (
        <div
            className={`
                flex items-center p-4 rounded-xl shadow-lg border-2 backdrop-blur-sm
                min-w-[320px] max-w-md pointer-events-auto
                transform transition-all duration-300 ease-out
                ${bgStyles[toast.type]}
                ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
            `}
            style={{
                animation: isExiting ? 'none' : 'slideInRight 0.3s ease-out'
            }}
        >
            <div className="flex-shrink-0 mr-3">
                {icons[toast.type]}
            </div>
            <div className={`flex-1 text-sm font-medium ${textStyles[toast.type]}`}>
                {toast.message}
            </div>
            <button
                onClick={onClose}
                className="ml-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-all"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
