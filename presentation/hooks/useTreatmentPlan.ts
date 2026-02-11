import { useState, useMemo } from 'react';
import { useTreatment } from '../context/TreatmentContext';
import { usePatient } from '../context/PatientContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { enabizAPI } from '../../infrastructure/services/ApiService';
import { TreatmentItem, TreatmentPhase } from '../../core/domain/entities/TreatmentPlan';

export const useTreatmentPlan = (initialPatientId?: string) => {
    const { items, addItem, deleteItem, updateItemStatus, fetchTreatments, loading } = useTreatment();
    const { patients, selectedPatient, selectPatient } = usePatient();
    const { addToast } = useToast();
    const { t, language } = useLanguage();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPatientResults, setShowPatientResults] = useState(false);
    const [isSendingENabiz, setIsSendingENabiz] = useState(false);
    const [newItem, setNewItem] = useState<Partial<TreatmentItem>>({
        phase: 'restorative',
        status: 'pending'
    });

    const activePatient = selectedPatient || (initialPatientId ? patients.find(p => p.id === initialPatientId) : null);
    const patientId = activePatient?.id;

    const filteredPatients = useMemo(() => {
        return patients.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5);
    }, [patients, searchTerm]);

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

    const handleSendENabiz = async () => {
        if (!patientId || items.length === 0) return;

        setIsSendingENabiz(true);
        addToast(language === 'tr' ? 'E-Nabız gönderimi başlatıldı...' : 'Sending to E-Nabız...', 'info');

        try {
            const res = await enabizAPI.sendTreatment({
                patientId,
                treatmentData: items
            });

            if (res.data.success) {
                if (res.data.data.success) {
                    addToast(language === 'tr' ? 'E-Nabız gönderimi başarılı!' : 'Successfully sent to E-Nabız!', 'success');
                } else {
                    addToast(language === 'tr' ? 'E-Nabız reddetti: ' + res.data.data.response?.resultMessage : 'E-Nabız rejected: ' + res.data.data.response?.resultMessage, 'error');
                }
            }
        } catch (error) {
            console.error(error);
            addToast(language === 'tr' ? 'E-Nabız bağlantı hatası.' : 'E-Nabız connection error.', 'error');
        } finally {
            setIsSendingENabiz(false);
        }
    };

    return {
        // State
        items,
        loading,
        activePatient,
        patientId,
        searchTerm,
        setSearchTerm,
        showPatientResults,
        setShowPatientResults,
        filteredPatients,
        isAddModalOpen,
        setIsAddModalOpen,
        isAIModalOpen,
        setIsAIModalOpen,
        newItem,
        setNewItem,
        isSendingENabiz,

        // Actions
        selectPatient,
        addItem, // Exposed for AI Modal
        handleAddItem,
        handleDeleteItem: (id: string, name: string) => {
            deleteItem(id);
            addToast(
                language === 'tr'
                    ? `"${name}" tedavi planından silindi.`
                    : `"${name}" removed from treatment plan.`,
                'info'
            );
        },
        handleSendENabiz,
        updateItemStatus,
        fetchTreatments,

        // Utils
        addToast,
        t,
        language
    };
};
