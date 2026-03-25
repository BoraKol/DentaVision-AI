import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface Patient {
    id: string;
    name: string;
    age?: number | string;
}

interface PatientSearchProps {
    selectedPatient: Patient | null;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    showResults: boolean;
    setShowResults: (value: boolean) => void;
    filteredPatients: Patient[];
    onSelect: (id: string) => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({
    selectedPatient,
    searchTerm,
    onSearchChange,
    showResults,
    setShowResults,
    filteredPatients,
    onSelect
}) => {
    const { language } = useLanguage();

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>{language === 'tr' ? 'Hasta Seçimi' : 'Patient Selection'}</span>
                {selectedPatient && <span className="text-teal-600 bg-teal-50 px-2 py-0.5 rounded text-xs">{selectedPatient.name}</span>}
            </h2>
            <div className="relative">
                <input
                    type="text"
                    placeholder={selectedPatient ? selectedPatient.name : (language === 'tr' ? 'Hasta ara...' : 'Search patient...')}
                    value={searchTerm}
                    onChange={(e) => {
                        onSearchChange(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                />
                {showResults && searchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => onSelect(p.id)}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0 text-sm"
                                >
                                    <span className="font-medium text-slate-800">{p.name}</span>
                                    <span className="text-xs text-slate-500">{p.age}</span>
                                </button>
                            ))
                        ) : (
                            <div className="p-3 text-center text-xs text-slate-500 italic">
                                {language === 'tr' ? 'Sonuç yok' : 'No results'}
                            </div>
                        )}
                    </div>
                )}
                {showResults && searchTerm && (
                    <div className="fixed inset-0 z-40" onClick={() => setShowResults(false)} />
                )}
            </div>
        </div>
    );
};

export default PatientSearch;
