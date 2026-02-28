import React, { useMemo } from 'react';
import { Filter, FileText, Trash2 } from 'lucide-react';

interface Transaction {
    _id: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    category: string;
    date: string;
    description: string;
    paymentMethod: string;
    invoiceStatus?: 'PENDING' | 'GENERATED' | 'FAILED';
    invoiceDocumentUrl?: string;
    invoiceId?: string;
}

interface ListProps {
    transactions: Transaction[];
    formatCurrency: (amount: number) => string;
    onDeleteClick: (id: string) => void;
    language: string;
}

const TransactionList: React.FC<ListProps> = ({ transactions, formatCurrency, onDeleteClick, language }) => {

    // Memoizing empty state row slightly optimizes re-renders when list is empty
    const EmptyState = useMemo(() => (
        <tr>
            <td colSpan={7} className="px-6 py-10 text-center text-slate-400 italic">
                {language === 'tr' ? 'Henüz işlem kaydı bulunmuyor.' : 'No transactions found.'}
            </td>
        </tr>
    ), [language]);

    return (
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
                            <th className="px-6 py-3 font-semibold text-center">{language === 'tr' ? 'Fatura' : 'Invoice'}</th>
                            <th className="px-6 py-3 font-semibold text-right">{language === 'tr' ? 'Tutar' : 'Amount'}</th>
                            <th className="px-6 py-3 font-semibold text-center">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {transactions.length === 0 ? EmptyState : (
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
                                    <td className="px-6 py-4 text-center">
                                        {t.type === 'INCOME' ? (
                                            t.invoiceStatus === 'GENERATED' ? (
                                                <a href={t.invoiceDocumentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors" title={t.invoiceId}>
                                                    <FileText className="w-3 h-3" /> E-Fatura
                                                </a>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                                    Bekliyor
                                                </span>
                                            )
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </td>
                                    <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => onDeleteClick(t._id)}
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
    );
};

export default React.memo(TransactionList);
