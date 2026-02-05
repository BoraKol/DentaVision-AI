import React, { useState, useMemo, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS, tr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAppointment } from '../context/AppointmentContext';
import { usePatient } from '../context/PatientContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Appointment, AppointmentStatus } from '../../core/domain/entities/Appointment';
import DeleteConfirmationModal from './common/DeleteConfirmationModal';
import { X, Plus, Calendar as CalendarIcon, Clock, User, CheckCircle, Trash2, Edit2 } from 'lucide-react';

// Setup localizer for Big Calendar
const locales = {
    'en-US': enUS,
    'tr': tr,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// --- Appointment Modal ---
interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    slotInfo?: { start: Date; end: Date } | null;
    editingAppointment?: Appointment | null;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
    isOpen, onClose, slotInfo, editingAppointment
}) => {
    const { addAppointment, updateAppointment, deleteAppointment } = useAppointment();
    const { patients } = usePatient();
    const { addToast } = useToast();
    const { t, language } = useLanguage();

    // Helper to format date as YYYY-MM-DD
    const toDateString = (date: Date) => format(date, 'yyyy-MM-dd');
    const toTimeString = (date: Date) => format(date, 'HH:mm');

    const [formData, setFormData] = useState({
        patientId: '',
        date: '',
        time: '09:00',
        duration: 30,
        procedure: '',
        notes: '',
        status: 'scheduled' as AppointmentStatus
    });

    React.useEffect(() => {
        if (editingAppointment) {
            setFormData({
                patientId: editingAppointment.patientId,
                date: toDateString(new Date(editingAppointment.date)),
                time: editingAppointment.time,
                duration: editingAppointment.duration,
                procedure: editingAppointment.procedure,
                notes: editingAppointment.notes || '',
                status: editingAppointment.status
            });
        } else if (slotInfo) {
            setFormData({
                patientId: '',
                date: toDateString(slotInfo.start),
                time: toTimeString(slotInfo.start),
                duration: 30, // Default to 30 mins
                procedure: '',
                notes: '',
                status: 'scheduled'
            });
        }
    }, [editingAppointment, slotInfo, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.patientId) {
            addToast(t('appointment.selectPatientWarning'), 'warning');
            return;
        }
        if (!formData.procedure.trim()) {
            addToast(t('appointment.enterProcedure'), 'warning');
            return;
        }

        const patient = patients.find(p => p.id === formData.patientId);
        const appointmentData = {
            patientId: formData.patientId,
            patientName: patient?.name || (language === 'tr' ? 'Bilinmeyen Hasta' : 'Unknown Patient'),
            date: new Date(formData.date),
            time: formData.time,
            duration: formData.duration,
            procedure: formData.procedure,
            notes: formData.notes,
            status: formData.status
        };

        if (editingAppointment) {
            updateAppointment(editingAppointment.id, appointmentData);
            addToast(t('appointment.updated'), 'success');
        } else {
            addAppointment(appointmentData);
            addToast(t('appointment.created'), 'success');
        }
        onClose();
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (editingAppointment) {
            deleteAppointment(editingAppointment.id);
            addToast(t('appointment.deleted'), 'info');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800">
                            {editingAppointment ? t('appointment.editAppointment') : t('appointment.newAppointment')}
                        </h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* ... (existing form fields remain same) ... */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {t('patient.name')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.patientId}
                                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="">{t('appointment.selectPatient')}</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('appointment.date')}</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('appointment.time')}</label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('appointment.duration')}</label>
                                <select
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value={15}>15 {t('common.minutes')}</option>
                                    <option value={30}>30 {t('common.minutes')}</option>
                                    <option value={45}>45 {t('common.minutes')}</option>
                                    <option value={60}>1 {t('common.hour')}</option>
                                    <option value={90}>1.5 {t('common.hours')}</option>
                                    <option value={120}>2 {t('common.hours')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('appointment.status')}</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AppointmentStatus })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="scheduled">{t('appointment.scheduled')}</option>
                                    <option value="confirmed">{t('appointment.confirmed')}</option>
                                    <option value="completed">{t('appointment.completed')}</option>
                                    <option value="cancelled">{t('appointment.cancelled')}</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {t('appointment.procedure')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.procedure}
                                onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                placeholder={t('appointment.procedurePlaceholder')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('appointment.notes')}</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                placeholder={t('appointment.notesPlaceholder')}
                            />
                        </div>

                        <div className="flex justify-between pt-4 gap-3">
                            {editingAppointment && (
                                <button
                                    type="button"
                                    onClick={handleDeleteClick}
                                    className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg flex items-center"
                                >
                                    <Trash2 className="w-5 h-5 mr-1" />
                                    {t('common.delete')}
                                </button>
                            )}
                            <div className="flex space-x-3 ml-auto">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 shadow-sm"
                                >
                                    {editingAppointment ? t('common.update') : t('common.create')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                message={language === 'tr' ? 'Bu randevuyu silmek istediğinize emin misiniz?' : 'Are you sure you want to delete this appointment?'}
            />
        </>
    );
};

// --- Main Calendar Component ---
interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: Appointment;
}

const Calendar: React.FC = () => {
    const { appointments } = useAppointment();
    const { t, language } = useLanguage();

    // Note: Delete logic moved to AppointmentModal directly via context, but we can also handle it here.

    const [view, setView] = useState<View>(Views.WEEK);
    const [date, setDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [slotInfo, setSlotInfo] = useState<{ start: Date; end: Date } | null>(null);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);


    // Filter valid appointments & Map to Calendar Events
    const events: CalendarEvent[] = useMemo(() => {
        return appointments
            .filter(apt => apt.date && apt.time && !isNaN(new Date(apt.date).getTime()))
            .map(apt => {
                // Construct Date object safely
                const dateStr = format(new Date(apt.date), 'yyyy-MM-dd');
                const start = new Date(`${dateStr}T${apt.time}`); // Local time construction
                const end = new Date(start.getTime() + (apt.duration || 30) * 60000);

                // Safely get patient name:
                // 1. apt.patientName (if stored directly)
                // 2. apt.patientId.name (if populated)
                // 3. Look up by ID from patients context (if available)
                let patientName = apt.patientName;
                if (!patientName && apt.patientId && typeof apt.patientId === 'object' && (apt.patientId as any).name) {
                    patientName = (apt.patientId as any).name;
                }

                const defaultName = language === 'tr' ? 'Bilinmeyen Hasta' : 'Unknown Patient';

                return {
                    id: apt.id,
                    title: `${patientName || defaultName} - ${apt.procedure}`,
                    start,
                    end,
                    resource: apt
                };
            });
    }, [appointments]);

    const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
        setSlotInfo(slotInfo);
        setEditingAppointment(null);
        setIsModalOpen(true);
    }, []);

    const handleSelectEvent = useCallback((event: CalendarEvent) => {
        setEditingAppointment(event.resource);
        setSlotInfo(null);
        setIsModalOpen(true);
    }, []);

    const eventStyleGetter = (event: CalendarEvent) => {
        const status = event.resource.status;
        let backgroundColor = '#3b82f6'; // blue-500

        switch (status) {
            case 'confirmed': backgroundColor = '#10b981'; break; // green-500
            case 'completed': backgroundColor = '#64748b'; break; // slate-500
            case 'cancelled': backgroundColor = '#ef4444'; break; // red-500
            case 'no_show': backgroundColor = '#f97316'; break; // orange-500
            case 'scheduled': default: backgroundColor = '#0f766e'; break; // teal-700
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }
        };
    };

    return (
        <div className="h-screen flex flex-col p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-2xl font-bold text-slate-800">{t('appointment.title')}</h2>
                <button
                    onClick={() => {
                        setSlotInfo({ start: new Date(), end: new Date() });
                        setEditingAppointment(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {t('appointment.newAppointment')}
                </button>
            </div>

            <div className="flex-1 text-sm font-medium">
                <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 'calc(100vh - 200px)' }}
                    views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                    view={view}
                    onView={setView}
                    date={date}
                    onNavigate={setDate}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    culture={language === 'tr' ? 'tr' : 'en-US'}
                    messages={language === 'tr' ? {
                        next: "İleri",
                        previous: "Geri",
                        today: "Bugün",
                        month: "Ay",
                        week: "Hafta",
                        day: "Gün",
                        agenda: "Ajanda",
                        date: "Tarih",
                        time: "Saat",
                        event: "Randevu",
                        noEventsInRange: "Bu aralıkta randevu yok."
                    } : undefined}
                    components={{
                        agenda: {
                            event: ({ event }) => <div className="font-semibold">{event.title}</div>
                        },
                        event: ({ event }) => (
                            <div className="flex items-center h-full overflow-hidden px-1">
                                <span className="text-[11px] font-medium opacity-90 mr-1 whitespace-nowrap">
                                    {format(event.start, 'HH:mm')}
                                </span>
                                <span className="text-xs font-bold truncate">
                                    {event.title}
                                </span>
                            </div>
                        )
                    }}
                    formats={{
                        eventTimeRangeFormat: () => ""
                    }}
                />
            </div>

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                slotInfo={slotInfo}
                editingAppointment={editingAppointment}
            />
        </div>
    );
};

export default Calendar;
