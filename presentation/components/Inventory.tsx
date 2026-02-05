import React, { useState } from 'react';
import { useInventory, InventoryItem } from '../context/InventoryContext';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ConfirmModal from './common/ConfirmModal';

const Inventory: React.FC = () => {
    const { items, loading, addItem, updateItem, deleteItem } = useInventory();
    const { language } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // Category localization map
    const categoryMap: Record<string, { tr: string, en: string }> = {
        'Sarf Malzeme': { tr: 'Sarf Malzeme', en: 'Consumables' },
        'Enstrüman': { tr: 'Enstrüman', en: 'Instruments' },
        'İmplant': { tr: 'İmplant', en: 'Implants' },
        'İlaç': { tr: 'İlaç', en: 'Medicine' },
        'Diğer': { tr: 'Diğer', en: 'Other' }
    };

    const getCategoryLabel = (cat: string) => categoryMap[cat]?.[language] || cat;

    // Form state
    const [formData, setFormData] = useState<Omit<InventoryItem, '_id' | 'lastRestocked'>>({
        name: '',
        category: 'Sarf Malzeme',
        quantity: 0,
        unit: language === 'tr' ? 'Adet' : 'Pcs',
        minLevel: 5,
        cost: 0,
        supplier: '',
        expirationDate: '',
        notes: ''
    });

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'Sarf Malzeme',
            quantity: 0,
            unit: language === 'tr' ? 'Adet' : 'Pcs',
            minLevel: 5,
            cost: 0,
            supplier: '',
            expirationDate: '',
            notes: ''
        });
        setEditingItem(null);
    };

    const handleDeleteClick = (id: string) => {
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            await deleteItem(itemToDelete);
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            await updateItem(editingItem._id, formData);
        } else {
            await addItem(formData);
        }
        setShowModal(false);
        resetForm();
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            minLevel: item.minLevel,
            cost: item.cost,
            supplier: item.supplier || '',
            expirationDate: item.expirationDate ? item.expirationDate.split('T')[0] : '',
            notes: item.notes || ''
        });
        setShowModal(true);
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lowStockItems = items.filter(item => item.quantity <= item.minLevel);

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Package className="w-8 h-8 text-teal-600" />
                        {language === 'tr' ? 'Stok Yönetimi' : 'Inventory Management'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {items.length} {language === 'tr' ? 'ürün listeleniyor' : 'items listed'}. {lowStockItems.length > 0 && <span className="text-red-500 font-medium">({lowStockItems.length} {language === 'tr' ? 'kritik stok' : 'critically low'})</span>}
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    {language === 'tr' ? 'Yeni Ürün Ekle' : 'Add New Item'}
                </button>
            </div>

            {/* Low Stock Alerts */}
            {lowStockItems.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                        <h3 className="text-red-800 font-medium text-sm">{language === 'tr' ? 'Kritik Stok Uyarıları' : 'Low Stock Alerts'}</h3>
                        <ul className="mt-1 space-y-1">
                            {lowStockItems.map(item => (
                                <li key={item._id} className="text-red-600 text-sm">
                                    • {item.name}: <strong>{item.quantity}</strong> {item.unit} (Min: {item.minLevel})
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder={language === 'tr' ? "Ürün adı veya kategori ara..." : "Search by name or category..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">{language === 'tr' ? 'Ürün Adı' : 'Product Name'}</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">{language === 'tr' ? 'Kategori' : 'Category'}</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">{language === 'tr' ? 'Miktar' : 'Quantity'}</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">{language === 'tr' ? 'Birim Fiyat' : 'Unit Cost'}</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">{language === 'tr' ? 'SKT' : 'Expiry'}</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">{language === 'tr' ? 'İşlemler' : 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredItems.map(item => (
                            <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-medium text-slate-800">{item.name}</div>
                                    {item.supplier && <div className="text-xs text-slate-400">{item.supplier}</div>}
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                                        {getCategoryLabel(item.category)}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className={`font-semibold ${item.quantity <= item.minLevel ? 'text-red-600' : 'text-slate-700'}`}>
                                        {item.quantity} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-600">
                                    {item.cost > 0 ? `₺${item.cost.toLocaleString()}` : '-'}
                                </td>
                                <td className="p-4">
                                    {item.expirationDate ? (
                                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            {new Date(item.expirationDate).toLocaleDateString()}
                                        </div>
                                    ) : '-'}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(item._id)}
                                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredItems.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        Aradığınız kriterlere uygun ürün bulunamadı.
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800">
                                {editingItem
                                    ? (language === 'tr' ? 'Ürün Düzenle' : 'Edit Item')
                                    : (language === 'tr' ? 'Yeni Ürün Ekle' : 'Add New Item')}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'tr' ? 'Ürün Adı' : 'Product Name'}</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'tr' ? 'Kategori' : 'Category'}</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                    >
                                        <option value="Sarf Malzeme">{language === 'tr' ? 'Sarf Malzeme' : 'Consumables'}</option>
                                        <option value="Enstrüman">{language === 'tr' ? 'Enstrüman' : 'Instruments'}</option>
                                        <option value="İmplant">{language === 'tr' ? 'İmplant' : 'Implants'}</option>
                                        <option value="İlaç">{language === 'tr' ? 'İlaç' : 'Medicine'}</option>
                                        <option value="Diğer">{language === 'tr' ? 'Diğer' : 'Other'}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'tr' ? 'Tedarikçi' : 'Supplier'}</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        value={formData.supplier}
                                        onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'tr' ? 'Miktar' : 'Quantity'}</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'tr' ? 'Birim' : 'Unit'}</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder={language === 'tr' ? "Adet, Kutu" : "Pcs, Box"}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'tr' ? 'Kritik Seviye' : 'Min Level'}</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        value={formData.minLevel}
                                        onChange={e => setFormData({ ...formData, minLevel: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'tr' ? 'Birim Maliyet' : 'Unit Cost'} (₺)</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        value={formData.cost}
                                        onChange={e => setFormData({ ...formData, cost: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'tr' ? 'Son Kullanma (Opsiyonel)' : 'Expiry Date (Optional)'}</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        value={formData.expirationDate}
                                        onChange={e => setFormData({ ...formData, expirationDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    {language === 'tr' ? 'İptal' : 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-sm"
                                >
                                    {editingItem ? (language === 'tr' ? 'Güncelle' : 'Update') : (language === 'tr' ? 'Kaydet' : 'Save')}
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
                    ? 'Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.'
                    : 'Are you sure you want to delete this item? This action cannot be undone.'}
            />
        </div>
    );
};

export default Inventory;
