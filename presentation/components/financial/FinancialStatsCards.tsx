import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';

interface StatsProps {
    stats: { income: number, expense: number, balance: number };
    invoicedIncome: number;
    nonInvoicedIncome: number;
    formatCurrency: (amount: number) => string;
    language: string;
}

const FinancialStatsCards: React.FC<StatsProps> = ({
    stats, invoicedIncome, nonInvoicedIncome, formatCurrency, language
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4">
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
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mr-4">
                    <FileText className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">{language === 'tr' ? 'Faturalı Gelir' : 'Invoiced Income'}</p>
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(invoicedIncome)}</p>
                    <p className="text-xs text-slate-400 mt-1">{language === 'tr' ? 'Vergi Bekleyen:' : 'Pending:'} {formatCurrency(nonInvoicedIncome)}</p>
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
    );
};

export default React.memo(FinancialStatsCards);
