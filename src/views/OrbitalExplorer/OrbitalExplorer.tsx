import React, { memo, useState, ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { useAppSelector } from '../../store/hooks';
import { themes } from '../../lib/constants';
import { translations } from '../../lib/i18n';

export const OrbitalExplorer: React.FC = memo(() => {
    const { themeName, language } = useAppSelector((state) => state.ui);
    const theme = themes[themeName];
    const texts = translations[language];
    const t = texts.orbitalExplorer;
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    const InfoCard: React.FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
         <div className="space-y-1">
            <h4 className={`font-bold ${theme.accentText}`}>{title}</h4>
            <div className="pl-4 border-l-2 border-white/10 space-y-1 text-sm">{children}</div>
        </div>
    );
    
    return (
        <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`lg:col-span-2 bg-gray-900/50 border ${theme.accentBorder}/20 p-6 rounded-lg`}>
                <h2 className={`text-2xl font-orbitron ${theme.accentText} mb-4`}>{t.title}</h2>
                <div className="aspect-video w-full bg-black rounded-md flex items-center justify-center border border-cyan-900 overflow-hidden">
                     <svg width="100%" height="100%" viewBox="0 0 400 200">
                        <defs><radialGradient id="starGradient" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor='#ffddaa'/><stop offset="100%" stopColor='#ff8c00' stopOpacity="0" /></radialGradient><path id="orbitPath" d="M 50 100 A 150 75 0 1 0 350 100 A 150 75 0 1 0 50 100" fill="none" stroke="#0891b2" strokeWidth="0.5" strokeDasharray="2,2" /></defs>
                        <g><circle cx="200" cy="100" r="10" fill="url(#starGradient)"><animate attributeName="opacity" values="1;0.9;1" dur="3s" repeatCount="indefinite" /></circle></g>
                        <use href="#orbitPath" />
                        <g><circle cx="0" cy="0" r="4" fill="#67e8f9" /><animateMotion dur="12s" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines="0.65 0 0.35 1"><mpath href="#orbitPath" /></animateMotion></g>
                    </svg>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">{t.mock_note}</p>
            </div>
            <div className={`bg-gray-900/50 border ${theme.accentBorder}/20 p-6 rounded-lg flex flex-col`}>
                <h3 className={`text-xl font-orbitron ${theme.accentText} mb-4`}>{t.data_title}</h3>
                <div className="space-y-4 flex-grow text-sm">
                   <InfoCard title={t.star.name}><p><strong>{t.star_type}:</strong> {t.star.type}</p></InfoCard>
                   <InfoCard title={t.planet.name}>
                        <p><strong>{t.gravity}:</strong> {t.planet.gravity}</p><p><strong>{t.pressure}:</strong> {t.planet.pressure}</p><p><strong>{t.temp}:</strong> {t.planet.temperature}</p><p><strong>{t.orbital_period_label}:</strong> {t.planet.orbital_period}</p><p><strong>{t.semi_major_axis_label}:</strong> {t.planet.semi_major_axis}</p><p><strong>{t.tidal_lock_label}:</strong> {t.planet.tidal_lock}</p>
                   </InfoCard>
                </div>
                <Button onClick={() => setAnalysisResult(t.analysis_result)} className="mt-4 w-full">{t.button}</Button>
                {analysisResult && <p className="mt-4 text-xs bg-gray-900 p-2 rounded border border-gray-700">{analysisResult}</p>}
            </div>
        </div>
    );
});
