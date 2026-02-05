import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, TestTube, Clock, CheckCircle, Truck, AlertCircle, Calendar, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ConfirmModal from './common/ConfirmModal';

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
            const res = await fetch('http://localhost:3000/api/lab-jobs');
            const data = await res.json();
            if (data.success) {
                setJobs(data.data);
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
            const url = editingJob
                ? `http://localhost:3000/api/lab-jobs/${editingJob._id}`
                : 'http://localhost:3000/api/lab-jobs';

            const method = editingJob ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.success) {
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
            const res = await fetch(`http://localhost:3000/api/lab-jobs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchJobs();
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
                await fetch(`http://localhost:3000/api/lab-jobs/${jobToDelete}`, { method: 'DELETE' });
                fetchJobs();
                setDeleteModalOpen(false);
                setJobToDelete(null);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredJobs.map(job => (
                    <div key={job._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[job.status]}`}>
                                {statusLabels[job.status][language]}
                            </span>
                            <div className="relative group">
                                <button className="text-slate-400 hover:text-slate-600">•••</button>
                                <div className="absolute right-0 top-6 w-32 bg-white rounded-lg shadow-xl border border-slate-100 hidden group-hover:block z-10 overflow-hidden">
                                    <button onClick={() => handleEdit(job)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700">
                                        {language === 'tr' ? 'Düzenle' : 'Edit'}
                                    </button>
                                    <button onClick={() => handleDelete(job._id)} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600">
                                        {language === 'tr' ? 'Sil' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <h3 className="font-bold text-slate-800 text-lg mb-1">{job.patientName}</h3>
                        <p className="text-slate-500 text-sm mb-4">{job.treatmentType} • {job.labName}</p>

                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 bg-slate-50 p-2 rounded">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{language === 'tr' ? 'Gönderim:' : 'Sent:'} {new Date(job.sentDate).toLocaleDateString()}</span>
                        </div>

                        {job.status !== 'Delivered' && (
                            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                {job.status === 'Sent' && (
                                    <button onClick={() => updateStatus(job._id, 'In Lab')} className="flex-1 bg-blue-50 text-blue-600 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                                        {language === 'tr' ? 'Lab\'a Ulaştı' : 'Reached Lab'}
                                    </button>
                                )}
                                {job.status === 'In Lab' && (
                                    <button onClick={() => updateStatus(job._id, 'Received')} className="flex-1 bg-purple-50 text-purple-600 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors">
                                        {language === 'tr' ? 'Teslim Alındı' : 'Received'}
                                    </button>
                                )}
                                {job.status === 'Received' && (
                                    <button onClick={() => updateStatus(job._id, 'Delivered')} className="flex-1 bg-green-50 text-green-600 py-1.5 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                                        {language === 'tr' ? 'Hastaya Takıldı' : 'Completed'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800">
                                {editingJob ? (language === 'tr' ? 'İşi Düzenle' : 'Edit Job') : (language === 'tr' ? 'Yeni İş Ekle' : 'Add New Job')}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'tr' ? 'Hasta Adı' : 'Patient Name'}</label>
                                <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={formData.patientName} onChange={e => setFormData({ ...formData, patientName: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'tr' ? 'Laboratuvar' : 'Lab Name'}</label>
                                    <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        value={formData.labName} onChange={e => setFormData({ ...formData, labName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'tr' ? 'İşlem Tipi' : 'Treatment Type'}</label>
                                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'tr' ? 'Beklenen Tarih' : 'Expected Date'}</label>
                                    <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        value={formData.expectedDate} onChange={e => setFormData({ ...formData, expectedDate: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'tr' ? 'Maliyet (₺)' : 'Cost (₺)'}</label>
                                    <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        value={formData.cost} onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'tr' ? 'Notlar' : 'Notes'}</label>
                                <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" rows={3}
                                    value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                                    {language === 'tr' ? 'İptal' : 'Cancel'}
                                </button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm">
                                    {editingJob ? (language === 'tr' ? 'Güncelle' : 'Update') : (language === 'tr' ? 'Kaydet' : 'Save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                type="danger"
                message={language === 'tr'
                    ? 'Bu kaydı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.'
                    : 'Are you sure you want to delete this record? This action cannot be undone.'}
            />
        </div>
    );
};

export default LabTracking;
