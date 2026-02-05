import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'dentavision_theme';

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>('light');

    // Load theme preference from localStorage or system preference
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && (stored === 'light' || stored === 'dark')) {
                setThemeState(stored as Theme);
            } else {
                // Check system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setThemeState(prefersDark ? 'dark' : 'light');
            }
        } catch (e) {
            console.error('Failed to load theme preference', e);
        }
    }, []);

    // Apply theme class to document
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        try {
            localStorage.setItem(STORAGE_KEY, newTheme);
        } catch (e) {
            console.error('Failed to save theme preference', e);
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    }, [theme, setTheme]);

    const isDark = theme === 'dark';

    return (
        <ThemeContext.Provider value={{
            theme,
            setTheme,
            toggleTheme,
            isDark
        }}>
            {children}
        </ThemeContext.Provider>
    );
};
