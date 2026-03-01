import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    UserPlus,
    ScanLine,
    FileText,
    Settings,
    Users,
    CalendarDays,
    PieChart,
    FlaskConical,
    LogOut,
    Package,
    Stethoscope,
    ListTodo,
    X
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import BranchSwitcher from './BranchSwitcher';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed }) => {
    const { user } = useUser();
    const { t, language } = useLanguage();
    const { logout } = useAuth();

    const NavItem = ({ to, icon: Icon, label, colorClass }: { to: string; icon: React.ElementType; label: string; colorClass: string }) => {
        return (
            <NavLink
                to={to}
                onClick={onClose}
                className={({ isActive }) => `group flex items-center ${isCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'w-full px-4'} py-3 mb-1 text-sm font-medium transition-all rounded-xl duration-200 ${isActive
                    ? 'bg-slate-100 text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                title={isCollapsed ? label : undefined}
            >
                {({ isActive }) => (
                    <>
                        <div className={`p-1.5 rounded-lg ${isCollapsed ? '' : 'mr-3'} transition-colors ${isActive ? 'bg-white shadow-sm' : 'bg-transparent group-hover:bg-white group-hover:shadow-sm'
                            }`}>
                            <Icon className={`w-5 h-5 ${isActive ? colorClass : 'text-slate-400 group-hover:' + colorClass}`} />
                        </div>
                        {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
                    </>
                )}
            </NavLink>
        );
    };

    return (
        <aside
            className={`flex flex-col h-full bg-white border-r border-slate-200/60 
                fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                ${isCollapsed ? 'lg:w-20' : 'lg:w-72'} w-72 
                shadow-2xl lg:shadow-none pt-[env(safe-area-inset-top)] lg:pt-0 overflow-hidden`}
        >
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-20 px-6 border-b border-slate-100`}>
                <Link to="/" className="flex items-center space-x-3 text-slate-800">
                    <div className="w-10 h-10 shrink-0 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-200">
                        <Stethoscope className="w-6 h-6" />
                    </div>
                    {!isCollapsed && (
                        <div className="whitespace-nowrap">
                            <span className="block text-lg font-bold tracking-tight leading-none">DentaVision</span>
                            <span className="text-xs text-teal-600 font-semibold tracking-wide">AI PLATFORM</span>
                        </div>
                    )}
                </Link>
                <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <BranchSwitcher isCollapsed={isCollapsed} />

            <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden">
                {!isCollapsed ? (
                    <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {t('app.general')}
                    </div>
                ) : <div className="h-6"></div>}
                <NavItem to="/dashboard" icon={LayoutDashboard} label={t('app.dashboard')} colorClass="text-blue-600" />
                <NavItem to="/patients" icon={Users} label={t('app.patients')} colorClass="text-teal-600" />
                <NavItem to="/calendar" icon={CalendarDays} label={t('app.calendar')} colorClass="text-violet-600" />

                {!isCollapsed ? (
                    <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {t('app.clinical')}
                    </div>
                ) : <div className="mt-6 border-t border-slate-100 mb-2"></div>}
                <NavItem to="/intake" icon={UserPlus} label={t('app.intake')} colorClass="text-emerald-600" />
                <NavItem to="/imaging" icon={ScanLine} label={t('app.imaging')} colorClass="text-indigo-600" />
                <NavItem to="/treatment" icon={FileText} label={t('app.treatment')} colorClass="text-rose-600" />
                <NavItem to="/lab-tracking" icon={FlaskConical} label={t('app.labTracking')} colorClass="text-fuchsia-600" />

                {!isCollapsed ? (
                    <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {t('app.management')}
                    </div>
                ) : <div className="mt-6 border-t border-slate-100 mb-2"></div>}
                <NavItem to="/financials" icon={PieChart} label={t('app.financial')} colorClass="text-amber-600" />
                <NavItem to="/inventory" icon={Package} label={t('app.inventory')} colorClass="text-cyan-600" />

                <div className="pt-4 mt-4 border-t border-slate-100">
                    <NavItem to="/tasks" icon={ListTodo} label={t('app.tasks')} colorClass="text-orange-600" />
                    <NavItem to="/settings" icon={Settings} label={t('app.settings')} colorClass="text-slate-600" />
                </div>
            </nav>


            <div className={`flex-none ${isCollapsed ? 'p-2' : 'p-4'} border-t border-slate-100 bg-slate-50 pb-20 lg:pb-4 mb-[env(safe-area-inset-bottom)]`}>
                <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center space-x-3'} mb-4`}>
                    <div className="w-10 h-10 shrink-0 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold overflow-hidden border-2 border-white shadow-sm">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span>{user?.name?.charAt(0)}</span>
                        )}
                    </div>
                    {!isCollapsed && (
                        <div className="text-xs min-w-0">
                            <p className="font-semibold text-slate-700 truncate">{user.title} {user.name}</p>
                            <p className="text-slate-500 truncate">{user.specialty}</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={logout}
                    className={`flex items-center justify-center ${isCollapsed ? 'w-10 h-10 p-0 rounded-full mx-auto' : 'w-full px-4 py-2 rounded-lg'} text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100 bg-white shadow-sm`}
                    title={isCollapsed ? (language === 'tr' ? 'Çıkış Yap' : 'Log Out') : undefined}
                >
                    <LogOut className={`w-4 h-4 ${isCollapsed ? '' : 'mr-2'}`} />
                    {!isCollapsed && (language === 'tr' ? 'Çıkış Yap' : 'Log Out')}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
