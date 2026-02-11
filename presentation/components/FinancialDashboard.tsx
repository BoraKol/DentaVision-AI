import React, { useState, useEffect } from 'react';
import {
    TrendingUp, TrendingDown, DollarSign, Plus,
    Filter, Calendar as CalendarIcon, Download, Trash2,
    PieChart as PieChartIcon, Users as UsersIcon, CreditCard
} from 'lucide-react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
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
    const [doctorStats, setDoctorStats] = useState<any[]>([]);
    const [paymentStats, setPaymentStats] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'payments'>('overview');
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

    const { token } = useAuth();
    const { addToast } = useToast();
    const { language } = useLanguage();

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    const fetchFinancialData = async () => {
        try {
            const [transRes, statsRes, doctorRes, paymentRes] = await Promise.all([
                api.get('/financials'),
                api.get('/financials/stats'),
                api.get('/financials/reports/doctor-performance'),
                api.get('/financials/reports/payment-methods')
            ]);
            setTransactions(transRes.data.data || []);
            setStats(statsRes.data.data || { income: 0, expense: 0, balance: 0 });
            setDoctorStats(doctorRes.data.data || []);
            setPaymentStats(paymentRes.data.data || []);
        } catch (err) {
            console.error(err);
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

            {/* Tabs Navigation */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    {language === 'tr' ? 'Genel Bakış' : 'Overview'}
                </button>
                <button
                    onClick={() => setActiveTab('doctors')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'doctors' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    {language === 'tr' ? 'Hekim Performansı' : 'Doctor Performance'}
                </button>
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'payments' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    {language === 'tr' ? 'Ödeme Analizi' : 'Payment Analysis'}
                </button>
            </div>

            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4">
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
            )}

            {/* Doctor Performance Tab */}
            {activeTab === 'doctors' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4">{language === 'tr' ? 'Hekim Ciro Dağılımı' : 'Revenue by Doctor'}</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={doctorStats}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="doctorName" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                    <Bar dataKey="totalIncome" fill="#0d9488" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4">{language === 'tr' ? 'Detaylı Hekim Tablosu' : 'Detailed Doctor Table'}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-2">Hekim</th>
                                        <th className="px-4 py-2 text-right">Ciro</th>
                                        <th className="px-4 py-2 text-right">Prim (%)</th>
                                        <th className="px-4 py-2 text-right">Hakediş</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doctorStats.map((doc, index) => (
                                        <tr key={index} className="border-b hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-900">{doc.doctorName}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(doc.totalIncome)}</td>
                                            <td className="px-4 py-3 text-right text-slate-500">%{doc.commissionRate}</td>
                                            <td className="px-4 py-3 text-right font-bold text-teal-600">{formatCurrency(doc.estimatedCommission)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Analysis Tab */}
            {activeTab === 'payments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                        <h3 className="font-bold text-slate-800 mb-4 w-full text-left">{language === 'tr' ? 'Ödeme Yöntemi Dağılımı' : 'Payment Method Distribution'}</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={paymentStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="totalAmount"
                                        nameKey="_id"
                                    >
                                        {paymentStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4">{language === 'tr' ? 'Tahsilat Detayları' : 'Collection Details'}</h3>
                        <div className="space-y-4">
                            {paymentStats.map((stat, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-8 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <div>
                                            <p className="font-medium text-slate-800 uppercase">{stat._id.replace('_', ' ')}</p>
                                            <p className="text-xs text-slate-500">{stat.count} {language === 'tr' ? 'İşlem' : 'Transactions'}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-slate-700">{formatCurrency(stat.totalAmount)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

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
