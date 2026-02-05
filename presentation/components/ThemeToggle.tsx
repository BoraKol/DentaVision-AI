import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            title={theme === 'light' ? 'Karanlık Moda Geç' : 'Aydınlık Moda Geç'}
        >
            <Sun className={`w-5 h-5 text-amber-500 absolute transition-all duration-300 ${theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
                }`} />
            <Moon className={`w-5 h-5 text-slate-400 absolute transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
                }`} />
        </button>
    );
};

export default ThemeToggle;
