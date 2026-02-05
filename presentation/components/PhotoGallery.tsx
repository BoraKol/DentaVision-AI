import React, { useState, useEffect } from 'react';
import { Upload, X, Trash2, Image as ImageIcon, ZoomIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { photosAPI } from '../infrastructure/services/ApiService';
import DeleteConfirmationModal from './common/DeleteConfirmationModal';

interface Photo {
    _id: string;
    url: string;
    type: 'intraoral' | 'extraoral' | 'xray' | 'other';
    notes: string;
    createdAt: string;
}

interface PhotoGalleryProps {
    patientId: string;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ patientId }) => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [uploading, setUploading] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
    const { addToast } = useToast();

    // Use the base URL for images from environment or fallback
    const API_URL = import.meta.env.VITE_API_URL || 'https://dentavision-backend.onrender.com/api';
    const IMAGE_BASE_URL = API_URL.replace('/api', '');

    useEffect(() => {
        fetchPhotos();
    }, [patientId]);

    const fetchPhotos = async () => {
        try {
            const response = await photosAPI.getAllByPatient(patientId);
            if (response.data.success || Array.isArray(response.data)) {
                setPhotos(Array.isArray(response.data) ? response.data : response.data.data);
            }
        } catch (error) {
            console.error('Error fetching photos:', error);
            addToast('Fotoğraflar yüklenirken hata oluştu', 'error');
        }
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', selectedType === 'all' ? 'other' : selectedType);

        setUploading(true);
        try {
            await photosAPI.upload(patientId, formData);
            addToast('Fotoğraf başarıyla yüklendi', 'success');
            fetchPhotos();
        } catch (error) {
            console.error('Upload error:', error);
            addToast('Yükleme başarısız', 'error');
        } finally {
            setUploading(false);
        }
    };

    const confirmDelete = async () => {
        if (!photoToDelete) return;

        try {
            await photosAPI.delete(photoToDelete);
            setPhotos(photos.filter(p => p._id !== photoToDelete));
            addToast('Fotoğraf silindi', 'info');
            if (selectedPhoto?._id === photoToDelete) setSelectedPhoto(null);
            setDeleteModalOpen(false);
            setPhotoToDelete(null);
        } catch (error) {
            addToast('Silme işlemi başarısız', 'error');
        }
    };

    const handleDeleteClick = (photoId: string) => {
        setPhotoToDelete(photoId);
        setDeleteModalOpen(true);
    };

    const filteredPhotos = selectedType === 'all'
        ? photos
        : photos.filter(p => p.type === selectedType);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full">
                    {['all', 'intraoral', 'extraoral', 'xray'].map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${selectedType === type
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                <label className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors shadow-sm ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Upload className="w-4 h-4" />
                    <span>{uploading ? 'Yükleniyor...' : 'Fotoğraf Yükle'}</span>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </label>
            </div>

            {filteredPhotos.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Bu kategoride henüz fotoğraf yok.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredPhotos.map(photo => (
                        <div
                            key={photo._id}
                            className="group relative aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 cursor-pointer shadow-sm"
                            onClick={() => setSelectedPhoto(photo)}
                        >
                            <img
                                src={`${IMAGE_BASE_URL}${photo.url}`}
                                alt="Patient photo"
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    className="p-1.5 bg-white/90 text-slate-700 rounded-full hover:bg-white shadow-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPhoto(photo);
                                    }}
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                                <button
                                    className="p-1.5 bg-red-500/90 text-white rounded-full hover:bg-red-600 shadow-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(photo._id);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-[10px] rounded backdrop-blur-sm uppercase font-bold tracking-wider">
                                {new Date(photo.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedPhoto && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4" onClick={() => setSelectedPhoto(null)}>
                    <button
                        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={`${IMAGE_BASE_URL}${selectedPhoto.url}`}
                        alt="Full size"
                        className="max-w-full max-h-[90vh] rounded-xl shadow-2xl animate-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/90 text-xs font-bold uppercase tracking-widest bg-white/10 px-6 py-2 rounded-full backdrop-blur-md border border-white/10">
                        {new Date(selectedPhoto.createdAt).toLocaleDateString()} • {selectedPhoto.type}
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Fotoğrafı Sil"
                message="Bu fotoğrafı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
            />
        </div>
    );
};

export default PhotoGallery;
