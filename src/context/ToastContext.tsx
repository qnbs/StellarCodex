import React, { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { FeedbackState } from '../types';
import { FeedbackToast } from '../components/ui/FeedbackToast';

const ToastContext = createContext<{ addToast: (message: string, type?: FeedbackState['type']) => void } | null>(null);

export const useToast = () => useContext(ToastContext)!;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<FeedbackState[]>([]);
    
    const addToast = useCallback((message: string, type: FeedbackState['type'] = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(current => current.filter(t => t.id !== id)), 3500);
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-8 right-8 z-50 space-y-2">
                {toasts.map(toast => <FeedbackToast key={toast.id} {...toast} />)}
            </div>
        </ToastContext.Provider>
    );
};
