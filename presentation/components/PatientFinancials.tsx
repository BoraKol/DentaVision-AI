import React, { useState, useEffect } from 'react';
import {
    Wallet, Plus, Trash2, ArrowUpRight,
    ArrowDownLeft, DollarSign, CreditCard,
    FileText, Calendar, AlertCircle
} from 'lucide-react';
import { useFinancial, Transaction } from '../context/FinancialContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useTreatment } from '../context/TreatmentContext';

interface PatientFinancialsProps {
    patientId: string;
}

const PatientFinancials: React.FC<PatientFinancialsProps> = ({ patientId }) => {
    const {
        transactions, loading, fetchPatientTransactions,
        addTransaction, deleteTransaction, totals
    } = useFinancial();
    const { language } = useLanguage();
    const { addToast } = useToast();
    const { items: treatments } = useTreatment();

    const [isAdding, setIsAdding] = useState(false);
    const [newTransaction, setNewTransaction] = useState({
        type: 'INCOME' as const,
        amount: 0,
        category: 'Ödeme',
        description: '',
        paymentMethod: 'CASH' as const
    });

    useEffect(() => {
        if (patientId) {
            fetchPatientTransactions(patientId);
        }
    }, [patientId, fetchPatientTransactions]);

    const handleSave = async () => {
        if (newTransaction.amount <= 0) {
            addToast(language === 'tr' ? 'Lütfen geçerli bir tutar girin.' : 'Please enter a valid amount.', 'warning');
            return;
        }

        try {
            await addTransaction({
                ...newTransaction,
                patientId
            });
            addToast(language === 'tr' ? 'İşlem başarıyla eklendi.' : 'Transaction added successfully.', 'success');
            setIsAdding(false);
            setNewTransaction({
                type: 'INCOME',
                amount: 0,
                category: 'Ödeme',
                description: '',
                paymentMethod: 'CASH'
            });
        } catch (error) {
            addToast(language === 'tr' ? 'İşlem kaydedilemedi.' : 'Failed to save transaction.', 'error');
        }
    };

    const totalTreatmentCost = treatments.reduce((sum, item) => sum + (item.cost || 0), 0);
    const remainingBalance = totalTreatmentCost - totals.income;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-50 p-3 rounded-xl">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 uppercase">
                        {language === 'tr' ? 'Toplam Tedavi Tutarı' : 'Total Treatment Cost'}
                    </p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                        ₺{totalTreatmentCost.toLocaleString('tr-TR')}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-teal-50 p-3 rounded-xl">
                            <ArrowDownLeft className="w-6 h-6 text-teal-600" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 uppercase">
                        {language === 'tr' ? 'Toplam Ödenen' : 'Total Paid'}
                    </p>
                    <p className="text-2xl font-bold text-teal-600 mt-1">
                        ₺{totals.income.toLocaleString('tr-TR')}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${remainingBalance > 0 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                            {remainingBalance > 0 ? <AlertCircle className="w-6 h-6" /> : <span className="text-xl font-bold">₺</span>}
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 uppercase">
                        {language === 'tr' ? 'Kalan Borç' : 'Outstanding Balance'}
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${remainingBalance > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                        ₺{remainingBalance.toLocaleString('tr-TR')}
                    </p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-teal-600" />
                    {language === 'tr' ? 'Finansal İşlemler' : 'Financial Transactions'}
                </h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${isAdding ? 'bg-slate-100 text-slate-600' : 'bg-teal-600 text-white hover:bg-teal-700'
                        }`}
                >
                    {isAdding ? (language === 'tr' ? 'Vazgeç' : 'Cancel') : (
                        <>
                            <Plus className="w-4 h-4" />
                            {language === 'tr' ? 'Yeni İşlem' : 'New Transaction'}
                        </>
                    )}
                </button>
            </div>

            {/* Add Transaction Form */}
            {isAdding && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-teal-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase">
                                {language === 'tr' ? 'İşlem Tipi' : 'Transaction Type'}
                            </label>
                            <select
                                className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                value={newTransaction.type}
                                onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as any })}
                            >
                                <option value="INCOME">{language === 'tr' ? 'Tahsilat (Gelir)' : 'Collection (Income)'}</option>
                                <option value="EXPENSE">{language === 'tr' ? 'İade / Gider' : 'Refund / Expense'}</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase">
                                {language === 'tr' ? 'Tutar' : 'Amount'}
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">₺</span>
                                <input
                                    type="number"
                                    className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 pl-7 text-sm focus:ring-2 focus:ring-teal-500 outline-none font-bold"
                                    value={newTransaction.amount}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase">
                                {language === 'tr' ? 'Ödeme Yöntemi' : 'Payment Method'}
                            </label>
                            <select
                                className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                value={newTransaction.paymentMethod}
                                onChange={(e) => setNewTransaction({ ...newTransaction, paymentMethod: e.target.value as any })}
                            >
                                <option value="CASH">{language === 'tr' ? 'Nakit' : 'Cash'}</option>
                                <option value="CREDIT_CARD">{language === 'tr' ? 'Kredi Kartı' : 'Credit Card'}</option>
                                <option value="TRANSFER">{language === 'tr' ? 'Havale/EFT' : 'Transfer'}</option>
                            </select>
                        </div>
                        <div className="md:col-span-3 space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase">
                                {language === 'tr' ? 'Açıklama' : 'Description'}
                            </label>
                            <input
                                className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder={language === 'tr' ? 'İşlem detayları...' : 'Transaction details...'}
                                value={newTransaction.description}
                                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-50 rounded-lg"
                        >
                            {language === 'tr' ? 'İptal' : 'Cancel'}
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-teal-600 text-white px-8 py-2 rounded-lg font-bold shadow-md hover:bg-teal-700 transition-all"
                        >
                            {language === 'tr' ? 'İşlemi Kaydet' : 'Save Transaction'}
                        </button>
                    </div>
                </div>
            )}

            {/* Transactions List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">{language === 'tr' ? 'Tarih' : 'Date'}</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">{language === 'tr' ? 'Kategori/Açıklama' : 'Category/Desc'}</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">{language === 'tr' ? 'Yöntem' : 'Method'}</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">{language === 'tr' ? 'Tutar' : 'Amount'}</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" />
                                </td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                    {language === 'tr' ? 'Henüz finansal işlem bulunmuyor.' : 'No financial transactions found.'}
                                </td>
                            </tr>
                        ) : (
                            transactions.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-300" />
                                            {t.date.toLocaleDateString('tr-TR')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-700">{t.category}</p>
                                        <p className="text-xs text-slate-400">{t.description || '-'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                            <CreditCard className="w-3.5 h-3.5" />
                                            {t.paymentMethod}
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold ${t.type === 'INCOME' ? 'text-teal-600' : 'text-red-600'}`}>
                                        {t.type === 'INCOME' ? '+' : '-'} ₺{t.amount.toLocaleString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => deleteTransaction(t.id)}
                                            className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatientFinancials;
