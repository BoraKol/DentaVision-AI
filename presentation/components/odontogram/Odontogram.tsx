import React, { useState } from 'react';
import Tooth from './Tooth';
import { useTreatment } from '../../context/TreatmentContext';
import { useLanguage } from '../../context/LanguageContext';
import { TreatmentItem } from '../../../core/domain/entities/TreatmentPlan';

interface OdontogramProps {
    patientId: string;
    readOnly?: boolean;
}

const Odontogram: React.FC<OdontogramProps> = ({ patientId, readOnly = false }) => {
    const { items, addItem } = useTreatment();
    const { t, language } = useLanguage();

    // State for selected tooth/surfaces to add action
    const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
    const [selectedSurfaces, setSelectedSurfaces] = useState<string[]>([]);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

    // Filter treatments for this patient
    const getTreatmentsForTooth = (toothId: string) => {
        return items
            .filter((t: TreatmentItem) => t.toothNumber === toothId && t.status !== 'completed' && t.status !== 'pending' ? false : true) // Simplistic filter, adjust as needed
            // Actually we want all items for this tooth
            .filter((t: TreatmentItem) => t.toothNumber === toothId)
            .flatMap((t: TreatmentItem) => {
                if (t.surfaces && t.surfaces.length > 0) {
                    return t.surfaces.map((s: string) => ({
                        surface: s,
                        status: t.status as 'planned' | 'completed' | 'existing',
                        color: t.status === 'completed' ? '#3b82f6' : (t.status === 'pending' ? '#ef4444' : undefined)
                    }));
                }
                return [{
                    surface: 'General',
                    status: t.status as 'planned' | 'completed' | 'existing',
                    color: t.status === 'completed' ? '#3b82f6' : '#ef4444'
                }];
            });
    };

    const handleSurfaceClick = (toothId: string, surface: string) => {
        if (readOnly) return;
        if (selectedTooth && selectedTooth !== toothId) {
            setSelectedTooth(toothId);
            setSelectedSurfaces([surface]);
        } else {
            setSelectedTooth(toothId);
            if (selectedSurfaces.includes(surface)) {
                setSelectedSurfaces(selectedSurfaces.filter(s => s !== surface));
            } else {
                setSelectedSurfaces([...selectedSurfaces, surface]);
            }
        }
        setIsActionMenuOpen(true);
    };

    const handleAddAction = (procedure: string) => {
        if (!selectedTooth) return;

        addItem(patientId, {
            procedureName: procedure,
            toothNumber: selectedTooth,
            surfaces: selectedSurfaces,
            // status is handled by backend default
            cost: 100, // Mock cost
            phase: 'restorative'
        });

        setSelectedTooth(null);
        setSelectedSurfaces([]);
        setIsActionMenuOpen(false);
    };

    // Render full mouth chart (Permanent Dentition)
    // Q1: 18, 17, 16, 15, 14, 13, 12, 11
    // Q2: 21, 22, 23, 24, 25, 26, 27, 28
    // Q3: 48, 47, 46, 45, 44, 43, 42, 41 (Mandibular Right - wait, standard chart Q3 is Left? FDI: 1=UR, 2=UL, 3=LL, 4=LR)
    // Correct FDI:
    // Upper Right (18-11) | Upper Left (21-28)
    // ----------------------------------------
    // Lower Right (48-41) | Lower Left (31-38)
    // Standard view is usually "As seeing the patient"
    // So Left side of screen is patient's Right.
    // Top Left Screen = Q1 (18-11)
    // Top Right Screen = Q2 (21-28)
    // Bot Left Screen = Q4 (48-41)
    // Bot Right Screen = Q3 (31-38)

    const quadrant1 = ['18', '17', '16', '15', '14', '13', '12', '11'];
    const quadrant2 = ['21', '22', '23', '24', '25', '26', '27', '28'];
    const quadrant4 = ['48', '47', '46', '45', '44', '43', '42', '41'];
    const quadrant3 = ['31', '32', '33', '34', '35', '36', '37', '38'];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">{language === 'tr' ? 'Diş Grafiği (Odontogram)' : 'Odontogram'}</h3>

            <div className="flex flex-col gap-8 max-w-4xl mx-auto overflow-x-auto pb-4">
                {/* Maxillary */}
                <div className="flex flex-col md:flex-row justify-center gap-8 pb-4 border-b border-slate-100 min-w-[600px] md:min-w-0">
                    {/* Q1 (Right) */}
                    <div className="flex gap-2 justify-end">
                        {quadrant1.map(id => (
                            <Tooth
                                key={id} id={id}
                                treatments={getTreatmentsForTooth(id)}
                                onSurfaceClick={(s) => handleSurfaceClick(id, s)}
                                selectedSurfaces={selectedTooth === id ? selectedSurfaces : []}
                            />
                        ))}
                    </div>
                    {/* Vertical Divider */}
                    <div className="hidden md:block w-px bg-slate-300"></div>
                    {/* Q2 (Left) */}
                    <div className="flex gap-2">
                        {quadrant2.map(id => (
                            <Tooth
                                key={id} id={id}
                                treatments={getTreatmentsForTooth(id)}
                                onSurfaceClick={(s) => handleSurfaceClick(id, s)}
                                selectedSurfaces={selectedTooth === id ? selectedSurfaces : []}
                            />
                        ))}
                    </div>
                </div>

                {/* Mandibular */}
                <div className="flex flex-col md:flex-row justify-center gap-8 pt-2 min-w-[600px] md:min-w-0">
                    {/* Q4 (Right) */}
                    <div className="flex gap-2 justify-end">
                        {quadrant4.map(id => (
                            <Tooth
                                key={id} id={id}
                                treatments={getTreatmentsForTooth(id)}
                                onSurfaceClick={(s) => handleSurfaceClick(id, s)}
                                selectedSurfaces={selectedTooth === id ? selectedSurfaces : []}
                            />
                        ))}
                    </div>
                    {/* Vertical Divider */}
                    <div className="hidden md:block w-px bg-slate-300"></div>
                    {/* Q3 (Left) */}
                    <div className="flex gap-2 justify-start">
                        {quadrant3.map(id => (
                            <Tooth
                                key={id} id={id}
                                treatments={getTreatmentsForTooth(id)}
                                onSurfaceClick={(s) => handleSurfaceClick(id, s)}
                                selectedSurfaces={selectedTooth === id ? selectedSurfaces : []}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Action Popover */}
            {isActionMenuOpen && selectedTooth && (
                <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="font-semibold text-slate-700">
                            Selected: <span className="text-teal-600">#{selectedTooth}</span>
                            {selectedSurfaces.length > 0 && ` (${selectedSurfaces.join(', ')})`}
                        </div>
                        <button onClick={() => { setIsActionMenuOpen(false); setSelectedTooth(null); setSelectedSurfaces([]); }} className="text-slate-400 hover:text-slate-600 font-sm">Cancel</button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <ActionButton label="Caries (Çürük)" color="bg-red-100 text-red-700 hover:bg-red-200" onClick={() => handleAddAction('Caries Repair')} />
                        <ActionButton label="Filling (Dolgu)" color="bg-blue-100 text-blue-700 hover:bg-blue-200" onClick={() => handleAddAction('Composite Filling')} />
                        <ActionButton label="Extraction (Çekim)" color="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => handleAddAction('Extraction')} />
                        <ActionButton label="Crown (Kron)" color="bg-yellow-100 text-yellow-700 hover:bg-yellow-200" onClick={() => handleAddAction('Zirconia Crown')} />
                        <ActionButton label="Root Canal (Kanal)" color="bg-purple-100 text-purple-700 hover:bg-purple-200" onClick={() => handleAddAction('Root Canal Treatment')} />
                    </div>
                </div>
            )}
        </div>
    );
};

const ActionButton = ({ label, color, onClick }: { label: string, color: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${color}`}
    >
        {label}
    </button>
);

export default Odontogram;
