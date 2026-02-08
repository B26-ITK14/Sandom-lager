/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { COLORS } from '../styles/colors';
import type { ColorTokens } from '../styles/colors';

type Theme = 'light' | 'dark';
type ThemePreference = Theme | 'system';

interface ThemeContextType {
    theme: Theme;
    preference: ThemePreference;
    colors: ColorTokens;
    toggleTheme: () => void;
    setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [preference, setPreference] = useState<ThemePreference>(() => {
        if (typeof window === 'undefined') return 'system';
        const savedPreference = window.localStorage.getItem('theme');
        if (savedPreference === 'light' || savedPreference === 'dark' || savedPreference === 'system') {
            return savedPreference;
        }
        return 'system';
    });

    const [systemTheme, setSystemTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

        const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (event: MediaQueryListEvent) => {
            setSystemTheme(event.matches ? 'dark' : 'light');
        };

        mediaQueryList.addEventListener('change', handleChange);
        return () => mediaQueryList.removeEventListener('change', handleChange);
    }, []);

    const theme: Theme = preference === 'system' ? systemTheme : preference;

    // Persist preference and apply theme/tokens to document root
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        root.style.colorScheme = theme;

        window.localStorage.setItem('theme', preference);

        const tokens = COLORS[theme];
        for (const [tokenName, tokenValue] of Object.entries(tokens)) {
            const kebab = tokenName.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
            root.style.setProperty(`--color-${kebab}`, tokenValue);
        }
    }, [preference, theme]);

    const toggleTheme = () => {
        setPreference(theme === 'light' ? 'dark' : 'light');
    };

    const value = {
        theme,
        preference,
        colors: COLORS[theme],
        toggleTheme,
        setPreference,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
