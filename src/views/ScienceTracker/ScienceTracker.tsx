import React, { memo } from 'react';
import { useAppSelector } from '../../store/hooks';
import { themes } from '../../lib/constants';
import { translations } from '../../lib/i18n';

export const ScienceTracker: React.FC = memo(() => {
    const { themeName, language } = useAppSelector((state) => state.ui);
    const theme = themes[themeName];
    const texts = translations[language];
    const t = texts.scienceTracker;

    const InfoCard: React.FC<{item: {title: string; summary?: string; implications?: string; analysis?: string}}> = ({item}) => (
        <div className={`bg-gray-900/50 border ${theme.accentBorder}/10 p-4 rounded-lg`}>
            <h4 className={`font-bold ${theme.accentText} mb-1`}>{item.title}</h4>
            {item.summary && <p className="text-sm text-gray-400 mb-2">{item.summary}</p>}
            {item.analysis && <p className="text-sm text-gray-400">{item.analysis}</p>}
            {item.implications && <p className="text-xs text-cyan-200/70 border-l-2 border-cyan-500/50 pl-2"><span className="font-bold">Implications: </span>{item.implications}</p>}
        </div>
    );
    
    return (
        <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6"><h2 className={`text-2xl font-orbitron ${theme.accentText} mb-4`}>{t.feed_title}</h2>{t.scienceFeed.map((item, index) => <InfoCard key={index} item={item} />)}</div>
            <div className="space-y-6"><h2 className={`text-2xl font-orbitron ${theme.accentText} mb-4`}>{t.analysis_title}</h2>{t.literaryAnalysis.map((item, index) => <InfoCard key={index} item={item} />)}</div>
        </div>
    );
});
