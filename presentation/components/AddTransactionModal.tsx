import React, { useState } from 'react';
import { X, DollarSign, Tag, FileText, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../../infrastructure/services/ApiService';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { token } = useAuth();
    const { addToast } = useToast();
    const { language } = useLanguage();

    const [formData, setFormData] = useState({
        type: 'INCOME',
        amount: '',
        category: '',
        description: '',
        paymentMethod: 'CASH',
        date: new Date().toISOString().split('T')[0]
    });

    const categories = {
        INCOME: ['Muayene', 'Dolgu', 'Kanal Tedavisi', 'İmplant', 'Ortodonti', 'Diğer Gelir'],
        EXPENSE: ['Kira', 'Malzeme', 'Maaş', 'Elektrik/Su/İnternet', 'Laboratuvar', 'Pazarlama', 'Diğer Gider']
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/financials', {
                ...formData,
                amount: parseFloat(formData.amount)
            });
            addToast('İşlem kaydedildi', 'success');
            onSuccess();
        } catch (err) {
            addToast('Hata oluştu', 'error');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-800">
                        {language === 'tr' ? 'Yeni İşlem Ekle' : 'Add New Transaction'}
                    </h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Type Toggle */}
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'INCOME', category: '' })}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${formData.type === 'INCOME' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Gelir
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'EXPENSE', category: '' })}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${formData.type === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Gider
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Amount */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Tutar (₺)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="number"
                                    required
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Date */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Tarih</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Kategori</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none appearance-none"
                            >
                                <option value="">Kategori Seçin</option>
                                {categories[formData.type as keyof typeof categories].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Ödeme Yöntemi</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none appearance-none"
                            >
                                <option value="CASH">Nakit</option>
                                <option value="CREDIT_CARD">Kredi Kartı</option>
                                <option value="TRANSFER">Havale/EFT</option>
                                <option value="INSURANCE">Sigorta</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Açıklama</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none resize-none"
                                placeholder="Opsiyonel detaylar..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-all"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 px-4 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all ${formData.type === 'INCOME' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                }`}
                        >
                            {language === 'tr' ? 'Kaydet' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionModal;
