import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
    LayoutDashboard,
    UserPlus,
    ScanLine,
    FileText,
    Menu,
    X,
    Stethoscope,
    Settings,
    Users,
    CalendarDays,
    ArrowLeft,
    PieChart,
    FlaskConical,
    LogOut,
    Package
} from 'lucide-react';
import LanguageToggle from './components/LanguageToggle';
import ThemeToggle from './components/ThemeToggle';
import Disclaimer from './components/Disclaimer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NetworkStatus } from './components/NetworkStatus';
import LoginPage from './pages/LoginPage';
import { notificationService } from './services/PushNotificationService';
import { UserProvider, useUser } from './context/UserContext';
import { TreatmentProvider } from './context/TreatmentContext';
import { ToastProvider } from './context/ToastContext';
import { PatientProvider, usePatient } from './context/PatientContext';
import { AppointmentProvider } from './context/AppointmentContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrescriptionProvider } from './context/PrescriptionContext';
import { InventoryProvider } from './context/InventoryContext';

const Dashboard = React.lazy(() => import('./components/Dashboard'));
const PatientIntake = React.lazy(() => import('./components/PatientIntake'));
const ImagingAnalysis = React.lazy(() => import('./components/ImagingAnalysis'));
const TreatmentPlan = React.lazy(() => import('./components/TreatmentPlan'));
const ProfileSettings = React.lazy(() => import('./components/ProfileSettings'));
const PatientList = React.lazy(() => import('./components/PatientList'));
const Calendar = React.lazy(() => import('./components/Calendar'));
const PatientDetails = React.lazy(() => import('./components/PatientDetails'));
const FinancialDashboard = React.lazy(() => import('./components/FinancialDashboard'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const PatientLogin = React.lazy(() => import('./pages/portal/PatientLogin'));
const PatientDashboard = React.lazy(() => import('./pages/portal/PatientDashboard'));
const Inventory = React.lazy(() => import('./components/Inventory'));
const LabTracking = React.lazy(() => import('./components/LabTracking'));

enum View {
    DASHBOARD = 'DASHBOARD',
    PATIENTS = 'PATIENTS',
    PATIENT_DETAILS = 'PATIENT_DETAILS',
    CALENDAR = 'CALENDAR',
    INTAKE = 'INTAKE',
    IMAGING = 'IMAGING',
    TREATMENT = 'TREATMENT',
    SETTINGS = 'SETTINGS',
    FINANCIALS = 'FINANCIALS',
    INVENTORY = 'INVENTORY',
    LAB_TRACKING = 'LAB_TRACKING'
}

const Sidebar: React.FC<{
    currentView: View;
    onViewChange: (view: View) => void;
    isOpen: boolean;
    onClose: () => void;
}> = ({ currentView, onViewChange, isOpen, onClose }) => {
    const { user } = useUser();
    const { t, language } = useLanguage();
    const { logout } = useAuth();

    const iconColors: Record<View, string> = {
        [View.DASHBOARD]: 'text-blue-600',
        [View.PATIENTS]: 'text-teal-600',
        [View.PATIENT_DETAILS]: 'text-teal-600', // Added missing key
        [View.CALENDAR]: 'text-violet-600',
        [View.INTAKE]: 'text-emerald-600',
        [View.IMAGING]: 'text-indigo-600',
        [View.TREATMENT]: 'text-rose-600',
        [View.FINANCIALS]: 'text-amber-600',
        [View.INVENTORY]: 'text-cyan-600',
        [View.LAB_TRACKING]: 'text-fuchsia-600',
        [View.SETTINGS]: 'text-slate-600',
    };

    const NavItem = ({ view, icon: Icon, label }: { view: View; icon: React.ElementType; label: string }) => {
        const isActive = currentView === view;
        const iconColor = iconColors[view] || 'text-slate-600';

        return (
            <button
                onClick={() => {
                    onViewChange(view);
                    onClose();
                }}
                className={`group flex items-center w-full px-4 py-3 mb-1 text-sm font-medium transition-all rounded-xl duration-200 ${isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
            >
                <div className={`p-1.5 rounded-lg mr-3 transition-colors ${isActive ? 'bg-white shadow-sm' : 'bg-transparent group-hover:bg-white group-hover:shadow-sm'
                    }`}>
                    <Icon className={`w-5 h-5 ${isActive ? iconColor : 'text-slate-400 group-hover:' + iconColor}`} />
                </div>
                {label}
            </button>
        );
    };

    return (
        <aside
            className={`flex flex-col h-full bg-white border-r border-slate-200/60 
                fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl lg:shadow-none pt-[env(safe-area-inset-top)] lg:pt-0`}
        >
            <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100">
                <div className="flex items-center space-x-3 text-slate-800">
                    <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-200">
                        <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="block text-lg font-bold tracking-tight leading-none">DentaVision</span>
                        <span className="text-xs text-teal-600 font-semibold tracking-wide">AI PLATFORM</span>
                    </div>
                </div>
                <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
                <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {language === 'tr' ? 'Genel' : 'General'}
                </div>
                <NavItem view={View.DASHBOARD} icon={LayoutDashboard} label={t('app.dashboard')} />
                <NavItem view={View.PATIENTS} icon={Users} label={t('app.patients')} />
                <NavItem view={View.CALENDAR} icon={CalendarDays} label={t('app.calendar')} />

                <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {language === 'tr' ? 'Klinik' : 'Clinical'}
                </div>
                <NavItem view={View.INTAKE} icon={UserPlus} label={t('app.intake')} />
                <NavItem view={View.IMAGING} icon={ScanLine} label={t('app.imaging')} />
                <NavItem view={View.TREATMENT} icon={FileText} label={t('app.treatment')} />
                <NavItem view={View.LAB_TRACKING} icon={FlaskConical} label={language === 'tr' ? 'Laboratuvar' : 'Lab Tracking'} />

                <div className="mt-6 px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {language === 'tr' ? 'Yönetim' : 'Management'}
                </div>
                <NavItem view={View.FINANCIALS} icon={PieChart} label={language === 'tr' ? 'Mali Raporlar' : 'Financials'} />
                <NavItem view={View.INVENTORY} icon={Package} label={language === 'tr' ? 'Stok Yönetimi' : 'Inventory'} />

                <div className="pt-4 mt-4 border-t border-slate-100">
                    <NavItem view={View.SETTINGS} icon={Settings} label={t('app.settings')} />
                </div>
            </nav>

            <div className="flex-none p-4 border-t border-slate-100 bg-slate-50 pb-20 lg:pb-4 mb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold overflow-hidden border-2 border-white shadow-sm">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span>{user.name.charAt(0)}</span>
                        )}
                    </div>
                    <div className="text-xs min-w-0">
                        <p className="font-semibold text-slate-700 truncate">{user.title} {user.name}</p>
                        <p className="text-slate-500 truncate">{user.specialty}</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        logout();
                    }}
                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 transition-all rounded-lg hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100 bg-white shadow-sm"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    {language === 'tr' ? 'Çıkış Yap' : 'Log Out'}
                </button>
            </div>
        </aside>
    );
};

const AppContent: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useUser();
    const { t, language } = useLanguage();
    const { selectedPatient, selectPatient } = usePatient();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handlePatientSelect = (patient: any) => {
        selectPatient(patient.id || patient._id);
        setCurrentView(View.PATIENT_DETAILS);
    };

    const handleBackToList = () => {
        selectPatient(null);
        setCurrentView(View.PATIENTS);
    };

    const renderContent = () => {
        switch (currentView) {
            case View.DASHBOARD:
                return <Dashboard onViewChange={setCurrentView} />;
            case View.PATIENTS:
                return <PatientList onSelectPatient={handlePatientSelect} />;
            case View.PATIENT_DETAILS:
                return selectedPatient ? (
                    <PatientDetails patient={selectedPatient} onBack={handleBackToList} />
                ) : (
                    <PatientList onSelectPatient={handlePatientSelect} />
                );
            case View.CALENDAR:
                return <Calendar />;
            case View.INTAKE:
                return <PatientIntake />;
            case View.IMAGING:
                return <ImagingAnalysis />;
            case View.TREATMENT:
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return <TreatmentPlan patientId={selectedPatient?.id || (selectedPatient as any)?._id} />;
            case View.FINANCIALS:
                return <FinancialDashboard />;
            case View.INVENTORY:
                return <Inventory />;
            case View.LAB_TRACKING:
                return <LabTracking />;
            case View.SETTINGS:
                return <ProfileSettings />;
            default:
                return <Dashboard onViewChange={setCurrentView} />;
        }
    };

    return (
        <div className="flex h-screen h-dvh overflow-hidden bg-slate-50">
            <NetworkStatus />
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Component */}
            <Sidebar
                currentView={currentView}
                onViewChange={setCurrentView}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between min-h-[4rem] px-4 bg-white border-b border-slate-200 lg:px-8 sticky top-0 z-30 pt-[env(safe-area-inset-top)] transition-all">
                    <div className="flex items-center space-x-3 py-2">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 -ml-2 text-slate-500 rounded-md lg:hidden hover:bg-slate-100"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        {currentView !== View.DASHBOARD && (
                            <button
                                onClick={() => setCurrentView(View.DASHBOARD)}
                                className="hidden lg:flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1.5" />
                                {t('app.dashboard')}
                            </button>
                        )}
                        <h1 className="text-lg font-semibold text-slate-800 truncate max-w-[150px] sm:max-w-none">
                            {currentView === View.DASHBOARD && t('app.dashboard')}
                            {currentView === View.PATIENTS && t('app.patients')}
                            {currentView === View.CALENDAR && t('app.calendar')}
                            {currentView === View.INTAKE && t('app.intake')}
                            {currentView === View.IMAGING && t('app.imaging')}
                            {currentView === View.TREATMENT && t('app.treatment')}
                            {currentView === View.FINANCIALS && (language === 'tr' ? 'Mali Raporlar' : 'Financials')}
                            {currentView === View.INVENTORY && (language === 'tr' ? 'Stok Yönetimi' : 'Inventory Management')}
                            {currentView === View.LAB_TRACKING && (language === 'tr' ? 'Laboratuvar Takibi' : 'Laboratory Tracking')}
                            {currentView === View.SETTINGS && t('app.settings')}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 py-2">
                        <ThemeToggle />
                        <LanguageToggle />
                        <span className="hidden sm:inline-block px-3 py-1 text-xs font-medium text-teal-700 bg-teal-50 rounded-full border border-teal-100">
                            {user.clinicName}
                        </span>
                    </div>
                </header>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-2 md:p-4 lg:p-8 pb-8 lg:pb-8 mb-[env(safe-area-inset-bottom)]">
                    <ErrorBoundary>
                        <React.Suspense fallback={
                            <div className="flex items-center justify-center p-12">
                                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        }>
                            <div className="max-w-7xl mx-auto space-y-6">
                                {renderContent()}
                            </div>
                        </React.Suspense>
                    </ErrorBoundary>
                    <Disclaimer />
                </div>
            </main>
        </div>
    );
};

// App wrapper with auth check (Only handles secured routes now)
const AuthenticatedApp: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = import('react-router-dom').then(m => m.useNavigate);

    // Reset initialization
    React.useEffect(() => {
        if (isAuthenticated) {
            // Initialize Push Notifications when authenticated
            notificationService.init();
        }
    }, [isAuthenticated]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-700">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirection should be handled by the router or a Navigate component.
        return <Navigate to="/login" replace />;
    }

    return (
        <UserProvider>
            <NotificationProvider>
                <PatientProvider>
                    <AppointmentProvider>
                        <TreatmentProvider>
                            <PrescriptionProvider>
                                <InventoryProvider>
                                    <AppContent />
                                </InventoryProvider>
                            </PrescriptionProvider>
                        </TreatmentProvider>
                    </AppointmentProvider>
                </PatientProvider>
            </NotificationProvider>
        </UserProvider>
    );
};

const App: React.FC = () => (
    <ThemeProvider>
        <LanguageProvider>
            <ToastProvider>
                <AuthProvider>
                    <React.Suspense fallback={
                        <div className="min-h-screen flex items-center justify-center bg-teal-600">
                            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    }>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<LandingPage />} />

                            {/* Inside Routes, we need a separate way to handle the login success redirect if it doesn't use standard hooks.
                                LoginPage usually redirects inside its own component on success (e.g., navigate('/dashboard'))
                            */}
                            <Route path="/login" element={
                                <LoginPage onLoginSuccess={() => {
                                    window.location.href = '/dashboard';
                                }} />
                            } />

                            {/* Patient Portal Routes */}
                            <Route path="/portal/login" element={<PatientLogin />} />
                            <Route path="/portal/dashboard" element={
                                <TreatmentProvider>
                                    <PatientDashboard />
                                </TreatmentProvider>
                            } />

                            {/* Main Application with Sidebar (Secured) */}
                            <Route path="/*" element={<AuthenticatedApp />} />
                        </Routes>
                    </React.Suspense>
                </AuthProvider>
            </ToastProvider>
        </LanguageProvider>
    </ThemeProvider>
);

export default App;
