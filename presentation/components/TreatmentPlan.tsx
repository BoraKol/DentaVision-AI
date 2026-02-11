import React, { useState } from 'react';
import {
  FileText, Plus, CheckCircle,
  AlertTriangle, Trash2
} from 'lucide-react';
import { TreatmentItem, TreatmentPhase } from '../../core/domain/entities/TreatmentPlan';
import { useTreatment } from '../context/TreatmentContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { usePatient } from '../context/PatientContext';
import Odontogram from './odontogram/Odontogram';
import { AITreatmentModal } from './treatment/AITreatmentModal';
import { Search, User as UserIcon, Sparkles } from 'lucide-react';

interface TreatmentPlanProps {
  patientId?: string;
}

const TreatmentPlan: React.FC<TreatmentPlanProps> = ({ patientId: initialPatientId }) => {
  const { items, addItem, deleteItem, updateItemStatus, fetchTreatments, loading } = useTreatment();
  const { patients, selectedPatient, selectPatient } = usePatient();
  const { addToast } = useToast();
  const { t, language } = useLanguage();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [newItem, setNewItem] = useState<Partial<TreatmentItem>>({
    phase: 'restorative',
    status: 'pending'
  });

  const activePatient = selectedPatient || (initialPatientId ? patients.find(p => p.id === initialPatientId) : null);
  const patientId = activePatient?.id;

  React.useEffect(() => {
    if (patientId) {
      fetchTreatments(patientId);
    }
  }, [patientId]);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const phases: { id: TreatmentPhase; labelKey: string; color: string; icon: any }[] = [
    { id: 'urgent', labelKey: 'treatment.urgent', color: 'bg-red-50 text-red-700 border-red-200', icon: AlertTriangle },
    { id: 'restorative', labelKey: 'treatment.restorative', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: FileText },
    { id: 'maintenance', labelKey: 'treatment.maintenance', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
  ];

  const getPhaseLabel = (phase: TreatmentPhase) => {
    const phaseLabels: Record<TreatmentPhase, { tr: string; en: string }> = {
      urgent: { tr: 'Faz 1: Acil / Enfeksiyon Kontrolü', en: 'Phase 1: Urgent / Infection Control' },
      restorative: { tr: 'Faz 2: Restoratif / Fonksiyonel', en: 'Phase 2: Restorative / Functional' },
      maintenance: { tr: 'Faz 3: İdame / Estetik', en: 'Phase 3: Maintenance / Aesthetic' }
    };
    return phaseLabels[phase][language as 'tr' | 'en'] || phaseLabels[phase].en;
  };

  const handleAddItem = () => {
    if (!newItem.procedureName) {
      addToast(language === 'tr' ? 'Lütfen işlem adı girin.' : 'Please enter procedure name.', 'warning');
      return;
    }

    if (!patientId) {
      addToast(language === 'tr' ? 'Lütfen önce bir hasta seçin.' : 'Please select a patient first.', 'warning');
      return;
    }

    addItem(patientId, {
      procedureName: newItem.procedureName,
      toothNumber: newItem.toothNumber,
      phase: newItem.phase as TreatmentPhase,
      cost: newItem.cost
    });

    addToast(
      language === 'tr'
        ? `"${newItem.procedureName}" tedavi planına eklendi.`
        : `"${newItem.procedureName}" added to treatment plan.`,
      'success'
    );
    setIsAddModalOpen(false);
    setNewItem({ phase: 'restorative', status: 'pending' });
  };

  const handleDeleteItem = (id: string, name: string) => {
    deleteItem(id);
    addToast(
      language === 'tr'
        ? `"${name}" tedavi planından silindi.`
        : `"${name}" removed from treatment plan.`,
      'info'
    );
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US') + ' ₺';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col items-center justify-center gap-6 mb-8 mt-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800">{t('treatment.title')}</h2>
          <p className="text-slate-500 mt-2">{t('treatment.subtitle')}</p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xl">
          {/* 1. New Procedure (Top) */}
          <button
            onClick={() => {
              if (!patientId) {
                addToast(language === 'tr' ? 'Lütfen önce bir hasta seçin.' : 'Please select a patient first.', 'warning');
                return;
              }
              setIsAddModalOpen(true);
            }}
            className="order-1 flex items-center justify-center px-6 py-3.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-sm w-full font-semibold text-base"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('treatment.newProcedure')}
          </button>

          {/* 2. Patient Search (Middle) */}
          <div className="order-2 relative group w-full z-20">
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-teal-500 transition-all shadow-sm">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={activePatient ? activePatient.name : (language === 'tr' ? 'Hasta ara...' : 'Search patient...')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowPatientResults(true);
                }}
                onFocus={() => setShowPatientResults(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredPatients.length > 0) {
                    selectPatient(filteredPatients[0].id);
                    setSearchTerm('');
                    setShowPatientResults(false);
                  }
                }}
                className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-base placeholder:text-slate-400"
              />
              {activePatient && !searchTerm && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md text-xs font-medium border border-teal-100">
                  <UserIcon className="w-3 h-3" />
                  {language === 'tr' ? 'Seçili' : 'Selected'}
                </div>
              )}
            </div>

            {showPatientResults && searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        selectPatient(p.id);
                        setSearchTerm('');
                        setShowPatientResults(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.age} {language === 'tr' ? 'yaş' : 'y/o'}</p>
                      </div>
                      <Plus className="w-4 h-4 text-slate-400" />
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500 italic">
                    {language === 'tr' ? 'Hasta bulunamadı.' : 'No patient found.'}
                  </div>
                )}
              </div>
            )}
            {showPatientResults && searchTerm && (
              <div className="fixed inset-0 z-40" onClick={() => setShowPatientResults(false)} />
            )}
          </div>

          {/* 3. AI Suggest (Bottom) */}
          <button
            onClick={() => {
              if (!patientId) {
                addToast(language === 'tr' ? 'Lütfen önce bir hasta seçin.' : 'Please select a patient first.', 'warning');
                return;
              }
              setIsAIModalOpen(true);
            }}
            className="order-3 flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-md w-full border border-violet-500/30 active:scale-95 font-semibold text-base"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {language === 'tr' ? 'AI Öneri' : 'AI Suggest'}
          </button>
        </div>
      </div>

      {patientId && (
        <AITreatmentModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          patientId={patientId}
          onPlanGenerated={(planItems) => {
            planItems.forEach((item: any) => {
              addItem(patientId, {
                procedureName: item.procedureName,
                toothNumber: item.toothNumber,
                phase: item.phase,
                cost: item.cost
              });
            });
            addToast(language === 'tr' ? 'AI planı başarıyla uygulandı.' : 'AI plan applied successfully.', 'success');
          }}
        />
      )}

      {/* Kanban / Phases Grid */}
      <div className="flex-1 overflow-x-auto">
        {!patientId ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border-2 border-dashed border-slate-200 animate-in fade-in duration-500 max-w-3xl mx-auto w-full">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-6">
              <UserIcon className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">
              {language === 'tr' ? 'Hasta Seçilmedi' : 'No Patient Selected'}
            </h3>
            <p className="text-slate-500 max-w-md mb-8 text-lg">
              {language === 'tr'
                ? 'Yeni bir tedavi planı oluşturmak veya mevcut bir planı görmek için lütfen arama kutusunu kullanarak bir hasta seçin.'
                : 'Please select a patient using the search box above to create a new treatment plan or view an existing one.'}
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-50 px-4 py-2 rounded-full">
                <Search className="w-4 h-4" />
                <span>{language === 'tr' ? 'Yukarıdaki kutudan arama yapın' : 'Use the search box above'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 h-full pb-4 overflow-y-auto">
            <div className="w-full overflow-x-auto">
              <Odontogram patientId={patientId} />
            </div>

            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x">
              {phases.map((phase) => (
                <div key={phase.id} className="flex-1 flex flex-col bg-slate-50 rounded-xl border border-slate-200 min-w-[300px] md:min-w-[350px] snap-center">
                  {/* Phase Header */}
                  <div className={`p-4 border-b border-slate-200 rounded-t-xl flex items-center justify-between ${phase.color.replace('text-', 'bg-opacity-20 ')}`}>
                    <div className="flex items-center space-x-2 font-semibold">
                      <phase.icon className="w-5 h-5" />
                      <span>{getPhaseLabel(phase.id)}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-white/50 rounded-full">
                      {items.filter(i => i.phase === phase.id).length}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
                    {items.filter(i => i.phase === phase.id).map((item) => (
                      <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
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
                            onClick={() => handleDeleteItem(item.id, item.procedureName)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1 -m-1 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-50">
                          <div className="flex items-center">
                            <select
                              value={item.status}
                              onChange={(e) => updateItemStatus(item.id, e.target.value)}
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
                    ))}

                    {items.filter(i => i.phase === phase.id).length === 0 && (
                      <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                        <p className="text-sm">
                          {language === 'tr' ? 'Bu fazda işlem yok.' : 'No procedures in this phase.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer Summary */}
                  <div className="p-3 bg-white border-t border-slate-200 rounded-b-xl text-right">
                    <span className="text-xs text-slate-500 font-medium">{t('treatment.total')}: </span>
                    <span className="text-sm font-bold text-slate-800">
                      {formatCurrency(items
                        .filter(i => i.phase === phase.id)
                        .reduce((sum, i) => sum + (i.cost || 0), 0))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">{t('treatment.newProcedure')}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">X</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('treatment.toothNumber')} ({language === 'tr' ? 'Opsiyonel' : 'Optional'})
                </label>
                <input
                  type="text"
                  placeholder={language === 'tr' ? 'Örn: 16, 24' : 'E.g., 16, 24'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={newItem.toothNumber || ''}
                  onChange={(e) => setNewItem({ ...newItem, toothNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('treatment.procedureName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={language === 'tr' ? 'Örn: Kompozit Dolgu' : 'E.g., Composite Filling'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={newItem.procedureName || ''}
                  onChange={(e) => setNewItem({ ...newItem, procedureName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('treatment.phase')}</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    value={newItem.phase}
                    onChange={(e) => setNewItem({ ...newItem, phase: e.target.value as any })}
                  >
                    <option value="urgent">{t('treatment.urgent')}</option>
                    <option value="restorative">{t('treatment.restorative')}</option>
                    <option value="maintenance">{t('treatment.maintenance')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('treatment.cost')} (₺)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    value={newItem.cost || ''}
                    onChange={(e) => setNewItem({ ...newItem, cost: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAddItem}
                className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 shadow-sm"
              >
                {t('common.add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentPlan;