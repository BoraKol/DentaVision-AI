import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import api from '../../../infrastructure/services/ApiService';

interface TrendDataPoint {
    month: string;
    income: number;
    expense: number;
    profit: number;
    txCount: number;
}

interface ForecastPoint {
    month: string;
    predictedIncome: number;
    confidence: number;
}

interface KPIs {
    currentMonthIncome: number;
    lastMonthIncome: number;
    monthlyGrowthRate: number;
    currentMonthTransactions: number;
    avgTransactionSize: number;
}

const FinancialTrends: React.FC = () => {
    const [trends, setTrends] = useState<TrendDataPoint[]>([]);
    const [forecast, setForecast] = useState<ForecastPoint[]>([]);
    const [kpis, setKPIs] = useState<KPIs | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trendsRes, kpisRes] = await Promise.all([
                    api.get('/financials/reports/trends?months=12'),
                    api.get('/financials/reports/kpis')
                ]);
                setTrends(trendsRes.data?.trends || []);
                setForecast(trendsRes.data?.forecast || []);
                setKPIs(kpisRes.data || null);
                console.log('Trends data:', trendsRes.data);
                console.log('KPIs data:', kpisRes.data);
            } catch (err) {
                console.error('Trend data fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

    const formatMonth = (val: string) => {
        const [year, month] = val.split('-');
        const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
        return `${months[parseInt(month) - 1]} '${year.slice(2)}`;
    };

    // Merge trend data with forecast for the combined chart
    const combinedChartData = [
        ...trends.map(t => ({ ...t, predictedIncome: null as number | null })),
        ...forecast.map(f => ({
            month: f.month,
            income: null as number | null,
            expense: null as number | null,
            profit: null as number | null,
            txCount: null as number | null,
            predictedIncome: f.predictedIncome
        }))
    ];

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI Cards */}
            {kpis && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KPICard
                        icon={DollarSign}
                        label="Bu Ay Gelir"
                        value={formatCurrency(kpis.currentMonthIncome)}
                        change={kpis.monthlyGrowthRate}
                        bg="bg-emerald-50"
                        color="text-emerald-600"
                    />
                    <KPICard
                        icon={BarChart3}
                        label="Geçen Ay Gelir"
                        value={formatCurrency(kpis.lastMonthIncome)}
                        bg="bg-blue-50"
                        color="text-blue-600"
                    />
                    <KPICard
                        icon={Target}
                        label="Ort. İşlem Tutarı"
                        value={formatCurrency(kpis.avgTransactionSize)}
                        bg="bg-violet-50"
                        color="text-violet-600"
                    />
                    <KPICard
                        icon={TrendingUp}
                        label="Bu Ay İşlem"
                        value={String(kpis.currentMonthTransactions)}
                        bg="bg-amber-50"
                        color="text-amber-600"
                    />
                </div>
            )}

            {/* Main Trend Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-violet-500" />
                    Gelir & Gider Trendi (Son 12 Ay + 3 Ay Tahmin)
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                    Kesikli çizgiler, doğrusal regresyon ile hesaplanan gelecek 3 aylık gelir tahminidir.
                </p>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={combinedChartData}>
                        <defs>
                            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v: number) => `₺${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                        <Tooltip
                            formatter={(value: any, name: string | undefined) => {
                                if (value === null) return ['-', name || ''];
                                const labels: Record<string, string> = { income: 'Gelir', expense: 'Gider', predictedIncome: '🔮 Tahmin' };
                                return [formatCurrency(value), labels[name || ''] || (name || '')];
                            }}
                            labelFormatter={(label: any) => formatMonth(String(label))}
                        />
                        <Legend
                            formatter={(value: any) => {
                                const map: Record<string, string> = { income: 'Gelir', expense: 'Gider', predictedIncome: '🔮 Tahmin' };
                                return map[String(value)] || String(value);
                            }}
                        />
                        <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2.5} connectNulls={false} dot={{ r: 3 }} />
                        <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} connectNulls={false} dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="predictedIncome" stroke="#8b5cf6" strokeWidth={2.5} strokeDasharray="8 4" dot={{ r: 4, fill: '#8b5cf6' }} connectNulls={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Forecast Cards */}
            {forecast.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        🔮 Gelecek 3 Ay Gelir Tahmini
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {forecast.map((f, i) => (
                            <div key={f.month} className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-5 border border-violet-100">
                                <p className="text-sm text-violet-500 font-medium mb-1">{formatMonth(f.month)}</p>
                                <p className="text-2xl font-bold text-slate-800">{formatCurrency(f.predictedIncome)}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="h-1.5 flex-1 bg-violet-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-violet-500 rounded-full transition-all"
                                            style={{ width: `${f.confidence}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-violet-600 font-medium">{f.confidence}%</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Güven Skoru</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// KPI Card component
const KPICard = ({ icon: Icon, label, value, change, bg, color }: {
    icon: React.ElementType; label: string; value: string; change?: number; bg: string; color: string;
}) => (
    <div className={`${bg} rounded-xl p-4 border border-slate-100`}>
        <div className="flex items-center justify-between mb-2">
            <div className={`p-2 bg-white rounded-lg shadow-sm`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            {change !== undefined && (
                <span className={`text-xs font-bold flex items-center gap-0.5 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {Math.abs(change)}%
                </span>
            )}
        </div>
        <p className="text-xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
);

export default FinancialTrends;
