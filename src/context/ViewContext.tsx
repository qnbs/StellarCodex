import React, { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { View } from '../types';
import { VIEWS } from '../lib/constants';

interface ViewContextType {
    currentView: View;
    setView: (view: View) => void;
}

const ViewContext = createContext<ViewContextType | null>(null);

export const useView = () => useContext(ViewContext)!;

export const ViewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentView, setView] = useState<View>(VIEWS.ORBITAL);
    const value = { currentView, setView: useCallback(setView, []) };
    return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
};
