import React, { ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';
import { LocaleProvider } from './LocaleContext';
import { DatabaseProvider } from './DatabaseContext';
import { ViewProvider } from './ViewContext';
import { ToastProvider } from './ToastContext';

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => (
    <ThemeProvider>
        <LocaleProvider>
            <DatabaseProvider>
                <ViewProvider>
                    <ToastProvider>{children}</ToastProvider>
                </ViewProvider>
            </DatabaseProvider>
        </LocaleProvider>
    </ThemeProvider>
);
