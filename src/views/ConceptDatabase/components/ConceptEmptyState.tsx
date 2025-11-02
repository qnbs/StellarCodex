import React, { memo } from 'react';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { useAppSelector } from '../../../store/hooks';
import { themes } from '../../../lib/constants';
import { translations } from '../../../lib/i18n';

export const ConceptEmptyState: React.FC<{ onAdd: () => void }> = memo(({ onAdd }) => {
    const { themeName, language } = useAppSelector((state) => state.ui);
    const theme = themes[themeName];
    const texts = translations[language];
    const t = texts.conceptDatabase.empty;
    return (
        <div className={`relative text-center py-24 px-4 border-2 border-dashed ${theme.accentBorder}/20 rounded-lg flex flex-col items-center justify-center gap-4 overflow-hidden bg-gray-900/20 animated-grid`}>
            <div className={`absolute inset-0 bg-radial-gradient from-gray-950/0 via-gray-950 to-gray-950`}></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className={`relative p-4 bg-gray-900/50 rounded-full border ${theme.accentBorder}/20`}><Icon name="BrainCircuit" className={`w-16 h-16 mx-auto ${theme.accentText}`} /><div className={`absolute -top-1 -right-1 w-5 h-5 ${theme.accentBg} rounded-full flex items-center justify-center`}><Icon name="Sparkles" className="w-3 h-3 text-white" /></div></div>
                <h3 className="text-xl font-orbitron text-white mt-4">{t.title}</h3>
                <p className="max-w-md text-gray-400">{t.subtitle}</p>
                <Button onClick={onAdd} leftIcon="Plus" className="mt-2">{t.button}</Button>
            </div>
        </div>
    );
});
