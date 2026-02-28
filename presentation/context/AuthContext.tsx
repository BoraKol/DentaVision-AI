import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../../infrastructure/services/ApiService';

export interface User {
    _id: string;
    email: string;
    name: string;
    title: string;
    specialty: string;
    clinicName: string;
    role: 'admin' | 'dentist' | 'assistant';
    avatar?: string;
    preferences?: {
        theme?: 'light' | 'dark';
        language?: 'en' | 'tr';
        notifications?: boolean;
    };
    geminiApiKey?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
    email: string;
    password: string;
    name: string;
    title?: string;
    specialty?: string;
    clinicName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUser));
                // Fetch the real key into memory on mount
                fetchGeminiApiKey();
            } catch (e) {
                console.error('Failed to parse stored user');
            }
        }
        setIsLoading(false);
    }, []);

    const fetchGeminiApiKey = async () => {
        try {
            const response = await authAPI.getGeminiKey();
            if (response.data && response.data.apiKey) {
                const { AppConfig } = await import('../../infrastructure/config/AppConfig');
                AppConfig.setGeminiKey(response.data.apiKey);
            }
        } catch (error) {
            console.error('Failed to fetch secure AI key:', error);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await authAPI.login({ email, password });
            const { token: newToken, ...userData } = response.data;

            setToken(newToken);
            setUser(userData);

            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // Re-fetch secure key into RAM after login
            await fetchGeminiApiKey();
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await authAPI.register(data);
            const { token: newToken, ...userData } = response.data;

            setToken(newToken);
            setUser(userData);

            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // Re-fetch secure key into RAM after register
            await fetchGeminiApiKey();
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Clear RAM key
        import('../../infrastructure/config/AppConfig').then(({ AppConfig }) => {
            AppConfig.setGeminiKey('');
        });
    };

    const updateProfile = async (data: Partial<User>) => {
        try {
            const response = await authAPI.updateProfile(data);
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));

            // If API key was updated, re-fetch the raw version into RAM
            if (data.geminiApiKey) {
                await fetchGeminiApiKey();
            }
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Profile update failed');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!token && !!user,
                login,
                register,
                logout,
                updateProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
