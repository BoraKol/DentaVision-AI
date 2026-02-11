import React, { memo } from 'react';
import { Trash2 } from 'lucide-react';
import { TreatmentItem, TreatmentPhase } from '../../core/domain/entities/TreatmentPlan';

interface TreatmentItemCardProps {
    item: TreatmentItem;
    onDelete: (id: string, name: string) => void;
    onStatusChange: (id: string, status: string) => void;
    formatCurrency: (amount: number) => string;
    t: (key: string) => string;
    language: string;
}

const TreatmentItemCard: React.FC<TreatmentItemCardProps> = ({
    item,
    onDelete,
    onStatusChange,
    formatCurrency,
    t,
    language
}) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex items-start space-x-3 overflow-hidden">
                    {item.toothNumber && (
                        <span className="min-w-[1.75rem] h-6 w-auto px-1.5 flex items-center justify-center bg-slate-100 text-slate-600 text-xs font-bold rounded shrink-0">
                            {item.toothNumber}
                        </span>
                    )}
                    <h4 className="font-medium text-slate-800 break-words leading-tight">{item.procedureName}</h4>
                </div>
                <button
                    onClick={() => onDelete(item.id, item.procedureName)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1 -m-1 shrink-0"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-50">
                <div className="flex items-center">
                    <select
                        value={item.status}
                        onChange={(e) => onStatusChange(item.id, e.target.value)}
                        className={`px-2 py-1.5 rounded-md border-0 ring-1 ring-inset ${item.status === 'completed' ? 'bg-green-50 ring-green-200 text-green-700' :
                            item.status === 'in_progress' ? 'bg-blue-50 ring-blue-200 text-blue-700' :
                                'bg-slate-50 ring-slate-200 text-slate-600'
                            } text-[10px] uppercase tracking-wider font-bold cursor-pointer focus:ring-2 focus:ring-teal-600 outline-none`}
                    >
                        <option value="pending">{t('treatment.pending')}</option>
                        <option value="in_progress">{t('treatment.inProgress')}</option>
                        <option value="completed">{t('appointment.completed')}</option>
                    </select>
                </div>
                {item.cost && (
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 uppercase tracking-tighter mb-0.5">{t('treatment.cost')}</span>
                        <span className="font-mono font-bold text-slate-700 text-sm">
                            {formatCurrency(item.cost)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(TreatmentItemCard);
