import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GlobalProvider from './context/GlobalProvider';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';


import AuthGuard from './components/AuthGuard';
import RootLayout from './components/layout/RootLayout';

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

const AppRouter: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
            <Route path="/login" element={<LoginPage onLoginSuccess={() => window.location.href = '/dashboard'} />} />

            {/* Portal Routes */}
            <Route path="/portal/login" element={<PatientLogin />} />
            <Route path="/portal/dashboard" element={<PatientDashboard />} />

            {/* Authenticated Dashboard Routes */}
            <Route element={<AuthGuard><RootLayout /></AuthGuard>}>
                <Route path="/dashboard" element={<Dashboard onViewChange={() => { }} />} />
                <Route path="/patients" element={<PatientList onSelectPatient={() => { }} />} />
                <Route path="/patients/:id" element={<PatientDetails />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/intake" element={<PatientIntake />} />
                <Route path="/imaging" element={<ImagingAnalysis />} />
                <Route path="/treatment" element={<TreatmentPlan />} />
                <Route path="/financials" element={<FinancialDashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/lab-tracking" element={<LabTracking />} />
                <Route path="/tasks" element={<TaskBoard />} />
                <Route path="/settings" element={<ProfileSettings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

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

