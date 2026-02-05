import React, { useState, useEffect } from 'react';
import { Plus, Search, TestTube, Clock, CheckCircle, Truck, AlertCircle, Calendar, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ConfirmModal from './common/ConfirmModal';
import { labJobsAPI } from '../infrastructure/services/ApiService';

interface LabJob {
    _id: string;
    patientName: string;
    doctorName: string;
    treatmentType: string;
    labName: string;
    status: 'Sent' | 'In Lab' | 'Received' | 'Delivered' | 'Cancelled';
    cost: number;
    currency: string;
    sentDate: string;
    expectedDate?: string;
    receivedDate?: string;
    notes?: string;
}

const LabTracking: React.FC = () => {
    const { language } = useLanguage();
    const [jobs, setJobs] = useState<LabJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingJob, setEditingJob] = useState<LabJob | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        patientName: '',
        treatmentType: 'Crown',
        labName: '',
        expectedDate: '',
        notes: '',
        cost: 0
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await labJobsAPI.getAll();
            if (response.data.success) {
                setJobs(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching lab jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const apiCall = editingJob
                ? labJobsAPI.update(editingJob._id, formData)
                : labJobsAPI.create(formData);

            const response = await apiCall;
            if (response.data.success) {
                fetchJobs();
                setShowModal(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error saving job:', error);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const response = await labJobsAPI.update(id, { status: newStatus });
            if (response.data.success) {
                fetchJobs();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = (id: string) => {
        setJobToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (jobToDelete) {
            try {
                const response = await labJobsAPI.delete(jobToDelete);
                if (response.data.success) {
                    fetchJobs();
                    setDeleteModalOpen(false);
                    setJobToDelete(null);
                }
            } catch (error) {
                console.error('Error deleting job:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            patientName: '',
            treatmentType: 'Crown',
            labName: '',
            expectedDate: '',
            notes: '',
            cost: 0
        });
        setEditingJob(null);
    };

    const handleEdit = (job: LabJob) => {
        setEditingJob(job);
        setFormData({
            patientName: job.patientName,
            treatmentType: job.treatmentType,
            labName: job.labName,
            expectedDate: job.expectedDate ? job.expectedDate.split('T')[0] : '',
            notes: job.notes || '',
            cost: job.cost
        });
        setShowModal(true);
    };

    const statusColors = {
        'Sent': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'In Lab': 'bg-blue-100 text-blue-800 border-blue-200',
        'Received': 'bg-purple-100 text-purple-800 border-purple-200',
        'Delivered': 'bg-green-100 text-green-800 border-green-200',
        'Cancelled': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const statusLabels = {
        'Sent': { tr: 'Gönderildi', en: 'Sent' },
        'In Lab': { tr: 'Laboratuvarda', en: 'In Lab' },
        'Received': { tr: 'Geldi', en: 'Received' },
        'Delivered': { tr: 'Teslim Edildi', en: 'Delivered' },
        'Cancelled': { tr: 'İptal', en: 'Cancelled' }
    };

    const filteredJobs = jobs.filter(job =>
        job.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.labName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && jobs.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <TestTube className="w-8 h-8 text-indigo-600" />
                        {language === 'tr' ? 'Laboratuvar Takibi' : 'Laboratory Tracking'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {jobs.length} {language === 'tr' ? 'aktif iş' : 'active jobs'}.
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    {language === 'tr' ? 'Yeni İş Ekle' : 'Add New Job'}
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder={language === 'tr' ? "Hasta veya laboratuvar ara..." : "Search patient or lab..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>

            {/* Grid Layout for Jobs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map(job => (
                    <div key={job._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow relative">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${statusColors[job.status]}`}>
                                {statusLabels[job.status][language]}
                            </span>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(job)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                    <Clock className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(job._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="font-bold text-slate-800 text-lg mb-1">{job.patientName}</h3>
                        <p className="text-slate-500 text-sm mb-4">{job.treatmentType} • {job.labName}</p>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{language === 'tr' ? 'Gönderim:' : 'Sent:'} {new Date(job.sentDate).toLocaleDateString()}</span>
                            </div>
                            {job.expectedDate && (
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{language === 'tr' ? 'Beklenen:' : 'Expected:'} {new Date(job.expectedDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>

                        {job.status !== 'Delivered' && (
                            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                {job.status === 'Sent' && (
                                    <button onClick={() => updateStatus(job._id, 'In Lab')} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors uppercase tracking-tight">
                                        {language === 'tr' ? 'Laboratuvara Ulaştı' : 'Reached Lab'}
                                    </button>
                                )}
                                {job.status === 'In Lab' && (
                                    <button onClick={() => updateStatus(job._id, 'Received')} className="flex-1 bg-purple-50 text-purple-600 py-2 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors uppercase tracking-tight">
                                        {language === 'tr' ? 'Muayenehaneye Geldi' : 'Received Back'}
                                    </button>
                                )}
                                {job.status === 'Received' && (
                                    <button onClick={() => updateStatus(job._id, 'Delivered')} className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors uppercase tracking-tight">
                                        {language === 'tr' ? 'Hastaya Takıldı' : 'Done & Delivered'}
                                    </button>
                                )}
                            </div>
                        )}

                        {job.status === 'Delivered' && (
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">{language === 'tr' ? 'Teslim Edildi' : 'Completed'}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Form Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-800">
                                {editingJob ? (language === 'tr' ? 'Siparişi Düzenle' : 'Edit Order') : (language === 'tr' ? 'Yeni Lab Siparişi' : 'New Lab Order')}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{language === 'tr' ? 'Hasta Adı' : 'Patient Name'}</label>
                                <input required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={formData.patientName} onChange={e => setFormData({ ...formData, patientName: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{language === 'tr' ? 'Laboratuvar' : 'Lab Name'}</label>
                                    <input required type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.labName} onChange={e => setFormData({ ...formData, labName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{language === 'tr' ? 'İşlem Tipi' : 'Restoration'}</label>
                                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.treatmentType} onChange={e => setFormData({ ...formData, treatmentType: e.target.value })}>
                                        <option value="Crown">Crown (Kron)</option>
                                        <option value="Bridge">Bridge (Köprü)</option>
                                        <option value="Denture">Denture (Protez)</option>
                                        <option value="Implant">Implant (İmplant Üstü)</option>
                                        <option value="Night Guard">Night Guard (Plak)</option>
                                        <option value="Other">Other (Diğer)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{language === 'tr' ? 'Beklenen Tarih' : 'Due Date'}</label>
                                    <input type="date" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.expectedDate} onChange={e => setFormData({ ...formData, expectedDate: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{language === 'tr' ? 'Maliyet (₺)' : 'Lab Cost (₺)'}</label>
                                    <input type="number" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.cost} onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) })} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
                                    {language === 'tr' ? 'İptal' : 'Cancel'}
                                </button>
                                <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                                    {editingJob ? (language === 'tr' ? 'Güncelle' : 'Update') : (language === 'tr' ? 'Kaydet' : 'Create Order')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ConfirmModal for deletion */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                type="danger"
                title={language === 'tr' ? 'Kaydı Sil' : 'Delete Order'}
                message={language === 'tr'
                    ? 'Bu laboratuvar kaydını silmek istediğinize emin misiniz?'
                    : 'Are you sure you want to delete this lab order?'}
            />
        </div>
    );
};

export default LabTracking;
