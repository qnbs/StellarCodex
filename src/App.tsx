import React, { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { MainContent } from './views/MainContent';
import { useAppSelector } from './store/hooks';
import { FeedbackToast } from './components/ui/FeedbackToast';

export const App: React.FC = () => {
    const themeName = useAppSelector((state) => state.ui.themeName);
    const language = useAppSelector((state) => state.ui.language);
    const toasts = useAppSelector((state) => state.ui.toasts);

    useEffect(() => {
        const bodyClass = document.body.classList;
        bodyClass.remove('theme-cyan', 'theme-amber');
        bodyClass.add(`theme-${themeName}`);
    }, [themeName]);

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    return (
        <div className="min-h-screen bg-gray-950 text-gray-200 font-sans">
            <Header />
            <main className="container mx-auto">
                <MainContent />
            </main>
            <div className="fixed bottom-8 right-8 z-50 space-y-2">
                {toasts.map(toast => <FeedbackToast key={toast.id} {...toast} />)}
            </div>
        </div>
    );
};
