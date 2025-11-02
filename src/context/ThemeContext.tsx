import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { Theme, ThemeName } from '../types';
import { THEMES, themes } from '../lib/constants';

interface ThemeContextType {
    theme: Theme;
    setTheme: (name: ThemeName) => void;
    themeName: ThemeName;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => useContext(ThemeContext)!;

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [themeName, setThemeName] = useState<ThemeName>(() => (localStorage.getItem('hsc-theme') as ThemeName) || THEMES.cyan);

    useEffect(() => {
        const bodyClass = document.body.classList;
        bodyClass.remove('theme-cyan', 'theme-amber');
        bodyClass.add(`theme-${themeName}`);
    }, [themeName]);

    const setTheme = useCallback((name: ThemeName) => {
        localStorage.setItem('hsc-theme', name);
        setThemeName(name);
    }, []);

    const value = { theme: themes[themeName], setTheme, themeName };
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
