import React, { useState } from 'react';
import { ChevronDown, MapPin, Check, Building2 } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

interface BranchSwitcherProps {
    isCollapsed: boolean;
}

const BranchSwitcher: React.FC<BranchSwitcherProps> = ({ isCollapsed }) => {
    const { user, updateUser } = useUser();
    const { token } = useAuth();
    const { addToast } = useToast();
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleBranchSwitch = async (branchName: string) => {
        if (branchName === user.activeBranch || isUpdating) return;

        setIsUpdating(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const res = await axios.put(
                `${(import.meta as any).env.VITE_API_URL}/api/auth/active-branch`,
                { branchName },
                config
            );

            if (res.data.success) {
                // Update local contexts
                await updateUser({ activeBranch: branchName });
                addToast(`${branchName} şubesine geçildi`, 'success');
                // Reload or trigger a global refetch if necessary
                // window.location.reload(); // Hard reload is safest for complex data isolation
            }
        } catch (error) {
            console.error('Branch switch failed:', error);
            addToast('Şube değiştirilemedi', 'error');
        } finally {
            setIsUpdating(false);
            setIsOpen(false);
        }
    };

    // Hide branch switcher if user has only one branch (no switching needed)
    if (!user.branches || user.branches.length <= 1) {
        return null;
    }

    if (isCollapsed) {
        return (
            <div className="relative flex justify-center py-4 group">
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-200 transition-all border border-slate-200 shadow-sm"
                >
                    <Building2 className="w-5 h-5" />
                </div>

                {isOpen && (
                    <div className="absolute left-full ml-2 top-0 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-[60] animate-in slide-in-from-left-2 duration-200">
                        {user.branches.map((branch) => (
                            <button
                                key={branch}
                                onClick={() => handleBranchSwitch(branch)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${user.activeBranch === branch
                                    ? 'bg-teal-50 text-teal-700'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <span className="truncate">{branch}</span>
                                {user.activeBranch === branch && <Check className="w-3 h-3 text-teal-600" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative px-4 py-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isUpdating}
                className={`w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div className="text-left min-w-0">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{t('app.branchSelection')}</span>
                        <span className="block text-sm font-bold text-slate-700 truncate">{user.activeBranch}</span>
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[55]" onClick={() => setIsOpen(false)} />
                    <div className="absolute left-4 right-4 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('app.allBranches')}</div>
                        {user.branches.map((branch) => (
                            <button
                                key={branch}
                                onClick={() => handleBranchSwitch(branch)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${user.activeBranch === branch
                                    ? 'bg-teal-50 text-teal-700'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <Building2 className={`w-4 h-4 ${user.activeBranch === branch ? 'text-teal-600' : 'text-slate-400'}`} />
                                    <span>{branch}</span>
                                </div>
                                {user.activeBranch === branch && (
                                    <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-teal-600" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default BranchSwitcher;
