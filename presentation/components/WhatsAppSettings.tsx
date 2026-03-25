import React, { useState, useCallback } from 'react';
import { MessageCircle, Wifi, WifiOff, QrCode, RefreshCw, Phone, CheckCircle2 } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import { useLanguage } from '../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface WhatsAppStatus {
    status: string;
    qrCode: string | null;
    connectedPhone: string | null;
    isReady: boolean;
}

const WhatsAppSettings: React.FC = () => {
    const { language } = useLanguage();
    const [waStatus, setWaStatus] = useState<WhatsAppStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/whatsapp/status`, { headers: getAuthHeaders() });
            const data = await res.json();
            if (data.success) setWaStatus(data.data);
        } catch (e) {
            console.error('WhatsApp status fetch error:', e);
        }
    }, []);

    const handleConnect = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/api/whatsapp/connect`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success) {
                setWaStatus(data.data);
                // Poll for status updates every 3 seconds
                const pollInterval = setInterval(async () => {
                    const statusRes = await fetch(`${API_URL}/api/whatsapp/status`, { headers: getAuthHeaders() });
                    const statusData = await statusRes.json();
                    if (statusData.success) {
                        setWaStatus(statusData.data);
                        if (statusData.data.status === 'CONNECTED') {
                            clearInterval(pollInterval);
                        }
                    }
                }, 3000);

                // Stop polling after 2 minutes
                setTimeout(() => clearInterval(pollInterval), 120000);
            }
        } catch (e: any) {
            setError(e.message || 'Bağlantı hatası');
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        setLoading(true);
        try {
            await fetch(`${API_URL}/api/whatsapp/disconnect`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            setWaStatus({ status: 'DISCONNECTED', qrCode: null, connectedPhone: null, isReady: false });
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch status on mount
    React.useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const isConnected = waStatus?.status === 'CONNECTED';
    const hasQR = waStatus?.status === 'QR_READY' && waStatus?.qrCode;

    return (
        <GlassCard className="!p-0 overflow-hidden">
            {/* Header */}
            <div className={`p-5 flex items-center justify-between ${isConnected ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-slate-700 to-slate-800'} text-white`}>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/20">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">WhatsApp Entegrasyonu</h3>
                        <p className="text-sm opacity-80">
                            {isConnected ? 'Bağlı ve Aktif' : 'Bağlı Değil'}
                        </p>
                    </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${isConnected ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-200'}`}>
                    {isConnected ? (
                        <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> Online</span>
                    ) : (
                        <span className="flex items-center gap-1"><WifiOff className="w-3 h-3" /> Offline</span>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm font-medium border border-red-200">
                        ⚠️ {error}
                    </div>
                )}

                {/* Connected State */}
                {isConnected && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="font-bold text-green-800">WhatsApp Bağlı</p>
                                <p className="text-sm text-green-600 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    +{waStatus?.connectedPhone || 'Bilinmiyor'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                            <h4 className="font-bold text-slate-700 text-sm">Otomatik Mesajlar Aktif:</h4>
                            <ul className="text-sm text-slate-600 space-y-1">
                                <li>✅ Randevu oluşturulduğunda hasta bilgilendirilir</li>
                                <li>✅ Randevu iptal edildiğinde hasta bilgilendirilir</li>
                                <li>✅ Randevudan 1 gün önce hatırlatma gönderilir</li>
                                <li>✅ Yeni hasta kaydında karşılama mesajı gönderilir</li>
                            </ul>
                        </div>

                        <button
                            onClick={handleDisconnect}
                            disabled={loading}
                            className="w-full py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition-colors"
                        >
                            {loading ? 'Bağlantı Kesiliyor...' : 'Bağlantıyı Kes'}
                        </button>
                    </div>
                )}

                {/* QR Code State */}
                {hasQR && !isConnected && (
                    <div className="space-y-4 text-center">
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <QrCode className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <p className="font-bold text-blue-800 mb-1">QR Kodu Tarağın</p>
                            <p className="text-sm text-blue-600">
                                Telefonunuzda WhatsApp → Bağlı Cihazlar → Cihaz Bağla yolunu izleyin
                            </p>
                        </div>
                        
                        {/* QR Code Display */}
                        <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-300 inline-block mx-auto">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(waStatus.qrCode!)}`}
                                alt="WhatsApp QR Code"
                                className="w-[250px] h-[250px]"
                            />
                        </div>

                        <button
                            onClick={fetchStatus}
                            className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 mx-auto"
                        >
                            <RefreshCw className="w-4 h-4" /> Durumu Yenile
                        </button>
                    </div>
                )}

                {/* Disconnected State */}
                {!isConnected && !hasQR && (
                    <div className="space-y-4 text-center">
                        <div className="py-8">
                            <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium mb-1">WhatsApp Bağlı Değil</p>
                            <p className="text-sm text-slate-400">
                                Klinik telefonunuzun WhatsApp'ını bağlayarak otomatik mesajlaşmayı aktifleştirin.
                            </p>
                        </div>
                        <button
                            onClick={handleConnect}
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Bağlantı Kuruluyor...
                                </>
                            ) : (
                                <>
                                    <QrCode className="w-5 h-5" />
                                    WhatsApp'ı Bağla
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </GlassCard>
    );
};

export default WhatsAppSettings;
