import React, { createContext, useContext, ReactNode } from 'react';
import { UserProfile } from '../../core/domain/entities/UserProfile';
import { useAuth } from './AuthContext';

interface UserContextType {
    user: UserProfile;
    updateUser: (updates: Partial<UserProfile>) => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user: authUser, updateProfile, isLoading } = useAuth();

    // Map AuthUser to UserProfile
    const user: UserProfile = authUser ? {
        id: authUser._id,
        name: authUser.name,
        title: authUser.title,
        specialty: authUser.specialty,
        email: authUser.email,
        clinicName: authUser.clinicName,
        preferences: {
            theme: authUser.preferences?.theme || 'light',
            notifications: authUser.preferences?.notifications ?? true
        },
        licenseNumber: '' // Not in AuthUser yet, default empty
    } : {
        // Fallback or empty state if needed, though AuthenticatedApp prevents null authUser
        id: '',
        name: '',
        title: '',
        specialty: '',
        email: '',
        clinicName: '',
        preferences: { theme: 'light', notifications: true },
        licenseNumber: ''
    };

    const updateUser = async (updates: Partial<UserProfile>) => {
        // Map updates back to AuthUser format if needed
        await updateProfile(updates);
    };

    return (
        <UserContext.Provider value={{ user, updateUser, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
