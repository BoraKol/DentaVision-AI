import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, AlertCircle } from 'lucide-react';
import api from '../../infrastructure/services/ApiService';
import { useToast } from '../context/ToastContext';

interface Message {
    _id: string;
    direction: 'INBOUND' | 'OUTBOUND';
    message: string;
    sentAt: string;
    provider: string;
}

interface PatientWhatsAppChatProps {
    patientId: string;
}

const PatientWhatsAppChat: React.FC<PatientWhatsAppChatProps> = ({ patientId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToast();

    const fetchHistory = async () => {
        try {
            const response = await api.get(`/whatsapp/${patientId}/history`);
            if (response.data && response.data.success) {
                setMessages(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load WA history', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        // Optional: Set up polling or WebSocket for real-world app
        const intervalId = setInterval(fetchHistory, 5000); // refresh every 5s for demo
        return () => clearInterval(intervalId);
    }, [patientId]);

    useEffect(() => {
        // Scroll to bottom on new message
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            await api.post('/whatsapp/send', {
                patientId,
                message: newMessage
            });
            addToast('Mesaj gönderildi', 'success');
            setNewMessage('');
            fetchHistory(); // refresh immediately
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Mesaj gönderilemedi', 'error');
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="p-4 text-center text-slate-500">Geçmiş yükleniyor...</div>;

    return (
        <div className="flex flex-col h-[500px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-emerald-600 text-white p-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold">WhatsApp & AI Asistan</h3>
                        <p className="text-emerald-100 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                            AI Asistan devrede
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#efeae2]">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                        <Bot className="w-10 h-10 text-emerald-600 opacity-50" />
                        <p>Henüz WhatsApp mesajı yok.</p>
                        <p className="text-xs text-center max-w-sm">
                            Klinik asistanı veya hastadan gelen mesajlar burada görünecektir. AI mesajları otomatik yanıtlar.
                        </p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isOutbound = msg.direction === 'OUTBOUND';
                        const showAvatar = idx === 0 || messages[idx - 1].direction !== msg.direction;

                        return (
                            <div key={msg._id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-4 group`}>
                                {!isOutbound && showAvatar && (
                                    <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                {!isOutbound && !showAvatar && <div className="w-10"></div>}

                                <div className={`max-w-[75%] rounded-2xl px-4 py-2 relative shadow-sm ${isOutbound
                                        ? 'bg-[#d9fdd3] text-slate-800 rounded-tr-sm'
                                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
                                    }`}>
                                    {isOutbound && msg.provider?.includes('Gemini') && (
                                        <div className="text-[10px] text-emerald-600 font-bold mb-1 flex items-center gap-1">
                                            <Bot className="w-3 h-3" /> AI Asistan
                                        </div>
                                    )}
                                    <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                                    <div className="text-[10px] text-slate-500 text-right mt-1 w-full relative">
                                        {new Date(msg.sentAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-slate-200">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Mesaj yazın..."
                        disabled={sending}
                        className="flex-1 px-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-full transition-all text-sm outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95"
                    >
                        {sending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send className="w-5 h-5 ml-1" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PatientWhatsAppChat;
