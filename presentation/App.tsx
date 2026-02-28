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
    FlaskConical
} from 'lucide-react';
import Disclaimer from './components/Disclaimer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NetworkStatus } from './components/NetworkStatus';
import Sidebar, { View } from './components/layout/Sidebar';
import Header from './components/layout/Header';
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



const AppContent: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user } = useUser();
    const { t, language } = useLanguage();
    const { selectedPatient, selectPatient } = usePatient();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

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
                isCollapsed={isCollapsed}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <Header
                    currentView={currentView}
                    onViewChange={setCurrentView}
                    toggleSidebar={toggleSidebar}
                    toggleCollapse={toggleCollapse}
                    t={t}
                />

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
