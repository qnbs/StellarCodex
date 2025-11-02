import React, { memo } from 'react';
import { VIEWS, themes } from '../../lib/constants';
import { Icon } from '../ui/Icon';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setView } from '../../store/slices/uiSlice';
import { translations } from '../../lib/i18n';

export const Header: React.FC = memo(() => {
    const dispatch = useAppDispatch();
    const { currentView, themeName, language } = useAppSelector((state) => state.ui);
    const theme = themes[themeName];
    const texts = translations[language];

    const navItems = [
        { id: VIEWS.ORBITAL, label: texts.header.nav.orbital, icon: 'Orbit' },
        { id: VIEWS.DATABASE, label: texts.header.nav.database, icon: 'DatabaseZap' },
        { id: VIEWS.TRACKER, label: texts.header.nav.tracker, icon: 'Satellite' },
        { id: VIEWS.SETTINGS, label: texts.header.nav.settings, icon: 'Settings' },
        { id: VIEWS.HELP, label: texts.header.nav.help, icon: 'HelpCircle' },
    ] as const;

    return (
        <header className={`bg-gray-950/70 backdrop-blur-sm border-b ${theme.accentBorder}/20 p-4 sticky top-0 z-20`}>
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Icon name="Rocket" className={`w-8 h-8 ${theme.accentText}`} />
                    <h1 className="text-xl md:text-2xl font-orbitron text-white hidden sm:block">{texts.header.title}</h1>
                </div>
                <nav className="flex items-center gap-1 md:gap-2">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => dispatch(setView(item.id))} aria-current={currentView === item.id ? 'page' : undefined} className={`flex items-center gap-2 px-2 md:px-3 py-2 rounded-md text-sm font-bold transition-all duration-300 transform active:scale-95 ${currentView === item.id ? `bg-cyan-500/20 ${theme.accentText} shadow-lg` : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                            <Icon name={item.icon} className="w-4 h-4" />
                            <span className="hidden md:inline">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </header>
    );
});
