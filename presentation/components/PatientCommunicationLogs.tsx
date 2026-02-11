import React, { useEffect, useState } from 'react';
import { MessageSquare, Mail, Smartphone, Clock, CheckCircle, XCircle } from 'lucide-react';
import { patientsAPI } from '../../infrastructure/services/ApiService';
import { useLanguage } from '../context/LanguageContext';

interface CommunicationLog {
    _id: string;
    type: 'SMS' | 'EMAIL' | 'PUSH';
    recipient: string;
    title?: string;
    message: string;
    status: 'SENT' | 'FAILED' | 'PENDING';
    sentAt: string;
}

const PatientCommunicationLogs: React.FC<{ patientId: string }> = ({ patientId }) => {
    const [logs, setLogs] = useState<CommunicationLog[]>([]);
    const [loading, setLoading] = useState(true);
    const { t, language } = useLanguage();

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await patientsAPI.getLogs(patientId);
                if (res.data.success) {
                    setLogs(res.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch logs:', error);
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            fetchLogs();
        }
    }, [patientId]);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Yükleniyor...</div>;
    }

    if (logs.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">
                    {language === 'tr' ? 'Henüz iletişim kaydı bulunmuyor.' : 'No communication logs found.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {logs.map((log) => (
                <div key={log._id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${log.type === 'SMS' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                        {log.type === 'SMS' ? <Smartphone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold text-slate-800">
                                    {log.type === 'SMS' ? 'SMS' : (log.title || 'Email')}
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5">{log.recipient}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(log.sentAt).toLocaleString('tr-TR')}
                                </span>
                                {log.status === 'SENT' ? (
                                    <span className="bg-green-50 text-green-700 text-[10px] px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Sent
                                    </span>
                                ) : (
                                    <span className="bg-red-50 text-red-700 text-[10px] px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
                                        <XCircle className="w-3 h-3" /> Failed
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="mt-3 bg-slate-50 p-3 rounded-lg text-sm text-slate-600 border border-slate-100">
                            {/* If email content is HTML, strip tags for preview or show safe HTML */}
                            {log.type === 'EMAIL' ? (
                                <div className="line-clamp-3 text-xs font-mono text-slate-500">
                                    (HTML Content - {log.message.substring(0, 100)}...)
                                </div>
                            ) : (
                                log.message
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PatientCommunicationLogs;
