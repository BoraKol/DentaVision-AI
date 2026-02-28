import React, { ReactNode } from 'react';
import { UserProvider } from './UserContext';
import { TreatmentProvider } from './TreatmentContext';
import { ToastProvider } from './ToastContext';
import { PatientProvider } from './PatientContext';
import { AppointmentProvider } from './AppointmentContext';
import { LanguageProvider } from './LanguageContext';
import { ThemeProvider } from './ThemeContext';
import { NotificationProvider } from './NotificationContext';
import { AuthProvider } from './AuthContext';
import { PrescriptionProvider } from './PrescriptionContext';
import { InventoryProvider } from './InventoryContext';
import { TaskProvider } from './TaskContext';

interface GlobalProviderProps {
    children: ReactNode;
}

/**
 * GlobalProvider consolidates all context providers into a single flat component.
 * This adheres to Clean Architecture by centralizing state orchestration and
 * prevents "Provider Hell" in App.tsx.
 */
const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <ToastProvider>
                    <AuthProvider>
                        <UserProvider>
                            <NotificationProvider>
                                <PatientProvider>
                                    <AppointmentProvider>
                                        <TreatmentProvider>
                                            <PrescriptionProvider>
                                                <InventoryProvider>
                                                    <TaskProvider>
                                                        {children}
                                                    </TaskProvider>
                                                </InventoryProvider>
                                            </PrescriptionProvider>
                                        </TreatmentProvider>
                                    </AppointmentProvider>
                                </PatientProvider>
                            </NotificationProvider>
                        </UserProvider>
                    </AuthProvider>
                </ToastProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
};

export default GlobalProvider;
