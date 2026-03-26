import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, PenTool, Check, AlertCircle } from 'lucide-react';
import api from '../../../infrastructure/services/ApiService';
import { useToast } from '../../context/ToastContext';

interface ConsentFormSignerProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
    patientName: string;
    onSuccess: (url: string) => void;
}

const ConsentFormSigner: React.FC<ConsentFormSignerProps> = ({ isOpen, onClose, patientId, patientName, onSuccess }) => {
    const sigCanvas = useRef<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formType, setFormType] = useState('KVKK ve Aydınlatma Metni');
    const { addToast } = useToast();

    // Lock body scroll when modal is open (better for tablets)
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const clearSignature = () => {
        if (sigCanvas.current) {
            sigCanvas.current.clear();
        }
    };

    const handleSave = async () => {
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            addToast('Lütfen imza atınız', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            const signatureDataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');

            const content = `
                DentaVision Kliniği'ne başvurarak tıbbi durumum ve uygulanacak tedaviler hakkında bilgilendirildim. 
                6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, kimlik, iletişim, sağlık ve görsel verilerimin (röntgen, fotoğraf vb.) 
                teşhis, tedavi, randevu planlaması ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenmesine, güvenli ortamlarda saklanmasına 
                ve gerektiğinde ilgili kamu kurumlarına (e-Nabız, SGK vb.) aktarılmasına açık rıza gösteriyorum.
                
                Tarafıma uygulanacak tıbbi/diş tedavi işlemlerinin risklerini, alternatiflerini, tedavi sonrasında dikkat etmem gereken hususları anladım 
                ve kendi özgür irademle tıbbi müdahaleyi kabul ediyorum.
            `.trim();

            const response = await api.post(`/patients/${patientId}/consent`, {
                formType,
                content,
                signatureDataUrl
            });

            addToast('Onam formu başarıyla oluşturuldu ve eklendi', 'success');
            onSuccess(response.data.data.url);
            onClose();
        } catch (error: any) {
            console.error(error);
            addToast(error.response?.data?.error || 'Form oluşturulurken bir hata oluştu', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh] overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center">
                            <PenTool className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Dijital Onam İmzası</h2>
                            <p className="text-sm text-slate-500">Hasta: <span className="font-semibold text-slate-700">{patientName}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="overflow-y-auto flex-1 p-6 bg-slate-50">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-slate-800">KVKK ve Aydınlatılmış Onam Metni</h3>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">Okunması Zorunludur</span>
                        </div>
                        <div className="prose prose-sm text-slate-600 text-justify max-w-none">
                            <p>
                                DentaVision Kliniği'ne başvurarak tıbbi durumum ve uygulanacak tedaviler hakkında bilgilendirildim. 
                                6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, kimlik, iletişim, sağlık ve görsel verilerimin (röntgen, fotoğraf vb.) 
                                teşhis, tedavi, randevu planlaması ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenmesine, güvenli ortamlarda saklanmasına 
                                ve gerektiğinde ilgili kamu kurumlarına (e-Nabız, SGK vb.) aktarılmasına açık rıza gösteriyorum.
                            </p>
                            <p>
                                Tarafıma uygulanacak tıbbi/diş tedavi işlemlerinin risklerini, alternatiflerini, tedavi sonrasında dikkat etmem gereken hususları anladım 
                                ve kendi özgür irademle tıbbi müdahaleyi kabul ediyorum.
                            </p>
                        </div>
                    </div>

                    {/* Signature Pad */}
                    <div className="bg-white rounded-xl border-2 border-dashed border-teal-200 p-2 relative">
                        <div className="absolute top-4 left-4 flex items-center gap-2 text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg text-sm font-medium z-10 pointer-events-none">
                            <PenTool className="w-4 h-4" /> Buraya İmzalayınız
                        </div>
                        
                        <SignatureCanvas 
                            ref={sigCanvas}
                            penColor="#0f172a"
                            velocityFilterWeight={0.7}
                            minWidth={1.5}
                            maxWidth={3}
                            canvasProps={{
                                className: 'w-full h-64 sm:h-80 cursor-crosshair rounded-lg bg-transparent'
                            }}
                        />
                        
                        <div className="absolute bottom-4 right-4 text-xs text-slate-400 pointer-events-none">
                            Dokunmatik ekran veya fare ile imza atın
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button 
                        onClick={clearSignature}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <X className="w-4 h-4" /> Temizle
                    </button>
                    
                    <button 
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-2.5 bg-teal-600 text-white font-medium hover:bg-teal-700 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Check className="w-5 h-5" /> Onayla ve Kaydet
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConsentFormSigner;
