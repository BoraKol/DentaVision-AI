import React, { useState, useEffect } from 'react';
import {
    TrendingUp, TrendingDown, DollarSign, Plus,
    Filter, Calendar as CalendarIcon, Download, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../../infrastructure/services/ApiService';
import AddTransactionModal from './AddTransactionModal';
import DeleteConfirmationModal from './common/DeleteConfirmationModal';

interface Transaction {
    _id: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    category: string;
    date: string;
    description: string;
    paymentMethod: string;
}

const FinancialDashboard: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

    const { token } = useAuth();
    const { addToast } = useToast();
    const { language } = useLanguage();

    const fetchFinancialData = async () => {
        try {
            const [transRes, statsRes] = await Promise.all([
                api.get('/financials'),
                api.get('/financials/stats')
            ]);
            setTransactions(transRes.data.data || []);
            setStats(statsRes.data.data || { income: 0, expense: 0, balance: 0 });
        } catch (err) {
            addToast('Veriler yüklenemedi', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinancialData();
    }, [token]);

    const handleDeleteClick = (id: string) => {
        setTransactionToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!transactionToDelete) return;
        try {
            await api.delete(`/financials/${transactionToDelete}`);
            addToast('İşlem silindi', 'success');
            fetchFinancialData();
            setIsDeleteModalOpen(false);
        } catch (err) {
            addToast('Silme başarısız', 'error');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            {/* Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        {language === 'tr' ? 'Finansal Durum' : 'Financial Overview'}
                    </h2>
                    <p className="text-slate-500 text-sm">
                        {language === 'tr' ? 'Klinik gelir ve giderlerinizi takip edin' : 'Track your clinic income and expenses'}
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center px-4 py-2.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 shadow-sm transition-all"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {language === 'tr' ? 'Yeni İşlem' : 'Add Transaction'}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mr-4">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">{language === 'tr' ? 'Toplam Gelir' : 'Total Income'}</p>
                        <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats?.income || 0)}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mr-4">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">{language === 'tr' ? 'Toplam Gider' : 'Total Expense'}</p>
                        <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats?.expense || 0)}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center ring-2 ring-teal-500/20">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mr-4">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">{language === 'tr' ? 'Net Bakiye' : 'Net Balance'}</p>
                        <p className={`text-2xl font-bold ${(stats?.balance || 0) >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
                            {formatCurrency(stats?.balance || 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">{language === 'tr' ? 'Son İşlemler' : 'Recent Transactions'}</h3>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-3 font-semibold">{language === 'tr' ? 'Tarih' : 'Date'}</th>
                                <th className="px-6 py-3 font-semibold">{language === 'tr' ? 'Kategori' : 'Category'}</th>
                                <th className="px-6 py-3 font-semibold">{language === 'tr' ? 'Açıklama' : 'Description'}</th>
                                <th className="px-6 py-3 font-semibold">{language === 'tr' ? 'Yöntem' : 'Method'}</th>
                                <th className="px-6 py-3 font-semibold text-right">{language === 'tr' ? 'Tutar' : 'Amount'}</th>
                                <th className="px-6 py-3 font-semibold text-center">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic">
                                        Henüz işlem kaydı bulunmuyor.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(t.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${t.type === 'INCOME' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                }`}>
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                                            {t.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 font-medium uppercase">
                                            {t.paymentMethod.replace('_', ' ')}
                                        </td>
                                        <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDeleteClick(t._id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
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

            <AddTransactionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    fetchFinancialData();
                }}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="İşlemi Sil"
                message="Bu finansal işlemi silmek istediğinize emin misiniz? Bu işlem bakiye raporlarını etkileyecektir."
            />
        </div>
    );
};

export default FinancialDashboard;
