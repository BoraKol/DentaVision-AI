import React, { useState, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    UserPlus,
    ScanLine,
    FileText,
} from 'lucide-react';
import Disclaimer from './components/Disclaimer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NetworkStatus } from './components/NetworkStatus';
import Sidebar, { View } from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginPage from './pages/LoginPage';
import { notificationService } from './services/PushNotificationService';
import { useUser } from './context/UserContext';
import { usePatient } from './context/PatientContext';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import GlobalProvider from './context/GlobalProvider';


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
const TaskBoard = React.lazy(() => import('./components/TaskBoard'));


const AppContent: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { t } = useLanguage();
    const { selectedPatient, selectPatient } = usePatient();
    const location = useLocation();

    // Mapping location to View enum for Sidebar/Header compatibility
    const getViewFromPath = (path: string): View => {
        if (path.includes('/patients/')) return View.PATIENT_DETAILS;
        if (path.includes('/patients')) return View.PATIENTS;
        if (path.includes('/calendar')) return View.CALENDAR;
        if (path.includes('/intake')) return View.INTAKE;
        if (path.includes('/imaging')) return View.IMAGING;
        if (path.includes('/treatment')) return View.TREATMENT;
        if (path.includes('/financials')) return View.FINANCIALS;
        if (path.includes('/inventory')) return View.INVENTORY;
        if (path.includes('/lab-tracking')) return View.LAB_TRACKING;
        if (path.includes('/tasks')) return View.TASKS;
        if (path.includes('/settings')) return View.SETTINGS;
        return View.DASHBOARD;
    };

    const currentView = getViewFromPath(location.pathname);

    return (
        <div className="flex h-screen h-dvh overflow-hidden bg-slate-50">
            <NetworkStatus />
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isCollapsed}
            />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                    t={t}
                />

                <div className="flex-1 overflow-y-auto p-2 md:p-4 lg:p-8 pb-8 lg:pb-8 mb-[env(safe-area-inset-bottom)]">
                    <ErrorBoundary>
                        <Suspense fallback={
                            <div className="flex items-center justify-center p-12">
                                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        }>
                            <div className="max-w-7xl mx-auto space-y-6">
                                <Routes>
                                    <Route path="/" element={<Dashboard onViewChange={() => { }} />} />
                                    <Route path="/patients" element={<PatientList onSelectPatient={(p) => selectPatient(p.id || p._id)} />} />
                                    <Route path="/patients/:id" element={<PatientDetails patient={selectedPatient} onBack={() => selectPatient(null)} />} />
                                    <Route path="/calendar" element={<Calendar />} />
                                    <Route path="/intake" element={<PatientIntake />} />
                                    <Route path="/imaging" element={<ImagingAnalysis />} />
                                    <Route path="/treatment" element={<TreatmentPlan patientId={selectedPatient?.id || (selectedPatient as any)?._id} />} />
                                    <Route path="/financials" element={<FinancialDashboard />} />
                                    <Route path="/inventory" element={<Inventory />} />
                                    <Route path="/lab-tracking" element={<LabTracking />} />
                                    <Route path="/tasks" element={<TaskBoard />} />
                                    <Route path="/settings" element={<ProfileSettings />} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </div>
                        </Suspense>
                    </ErrorBoundary>
                    <Disclaimer />
                </div>
            </main>
        </div>
    );
};

const AuthenticatedApp: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    React.useEffect(() => {
        if (isAuthenticated) {
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
        return <Navigate to="/login" replace />;
    }

    return <AppContent />;
};

const Home: React.FC = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <AppContent /> : <LandingPage />;
};

const AppRouter: React.FC = () => (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage onLoginSuccess={() => window.location.href = '/'} />} />
        <Route path="/portal/login" element={<PatientLogin />} />
        <Route path="/portal/dashboard" element={<PatientDashboard />} />
        <Route path="/*" element={<AuthenticatedApp />} />
    </Routes>
);

const App: React.FC = () => (
    <GlobalProvider>
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-teal-600">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <AppRouter />
        </Suspense>
    </GlobalProvider>
);

export default App;

