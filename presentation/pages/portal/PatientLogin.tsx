import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // We might need a separate context for patients later, but for now we'll handle token manually or reuse
import api from '../../../infrastructure/services/ApiService';
import { useToast } from '../../context/ToastContext';
import { Lock, Phone, ArrowRight } from 'lucide-react';

const PatientLogin: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post('/portal/login', { phone, password });

            if (res.data.success) {
                // Store patient token specifically
                localStorage.setItem('patientToken', res.data.token);
                localStorage.setItem('patientUser', JSON.stringify(res.data.data));

                addToast('Giriş başarılı', 'success');
                navigate('/portal/dashboard');
            }
        } catch (err: any) {
            addToast(err.response?.data?.message || 'Giriş başarısız', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-700">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-400">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Hasta Girişi</h1>
                        <p className="text-slate-400">Röntgen ve analizlerinize erişmek için giriş yapın.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Telefon Numarası
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <input
                                    type="tel"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg leading-5 bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-colors"
                                    placeholder="5XX XXX XX XX"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Şifre
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg leading-5 bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-colors"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Giriş Yap
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
                <div className="px-8 py-4 bg-slate-700/50 border-t border-slate-700 text-center">
                    <p className="text-xs text-slate-400">
                        Şifrenizi bilmiyorsanız lütfen kliniğinizle iletişime geçin.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PatientLogin;
