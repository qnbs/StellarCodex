import React, { memo, ReactNode } from 'react';
import { Language, ThemeName } from '../../types';
import { themes, LANGUAGES } from '../../lib/constants';
import { Button } from '../../components/ui/Button';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { translations } from '../../lib/i18n';
import { setTheme, setLanguage, showToast } from '../../store/slices/uiSlice';
import { clearAllConcepts } from '../../store/slices/conceptsSlice';

export const Settings: React.FC = memo(() => {
    const dispatch = useAppDispatch();
    const { themeName, language } = useAppSelector(state => state.ui);
    const theme = themes[themeName];
    const texts = translations[language];
    const t = texts.settings;
    
    const handleClearDB = async () => {
        if (window.confirm(t.data.confirm)) { 
            try {
                await dispatch(clearAllConcepts()).unwrap();
                dispatch(showToast({ message: t.feedback.db_cleared, type: 'success' })); 
            } catch(e) {
                dispatch(showToast({ message: texts.conceptDatabase.feedback.error, type: 'error' }));
            }
        }
    };
    const handleThemeChange = (key: ThemeName) => { 
        dispatch(setTheme(key)); 
        dispatch(showToast({ message: t.feedback.theme_updated(themes[key].name) }));
    }
    const handleLanguageChange = (lang: Language) => { 
        dispatch(setLanguage(lang)); 
        dispatch(showToast({ message: t.feedback.language_updated(lang === 'en' ? 'English' : 'Deutsch') }));
    }
    
    const SettingsCard: React.FC<{title:string; description:string; children: ReactNode; variant?:'normal'|'danger'}> = ({title, description, children, variant='normal'}) => (
        <div className={`${variant === 'danger' ? 'bg-red-900/20 border-red-500/30' : `bg-gray-900/50 border-${theme.accentBorder}/20`} border p-6 rounded-lg`}>
            <h3 className={`text-xl font-bold mb-2 ${variant === 'danger' && 'text-red-300'}`}>{title}</h3>
            <p className={`${variant === 'danger' ? 'text-red-400' : 'text-gray-400'} mb-4`}>{description}</p>
            {children}
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <h2 className={`text-3xl font-orbitron ${theme.accentText} mb-8`}>{t.title}</h2>
            <div className="space-y-8">
                <SettingsCard title={t.theme.title} description={t.theme.description}>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(Object.keys(themes) as ThemeName[]).map(key => (
                            <button key={key} onClick={() => handleThemeChange(key)} className={`p-4 rounded-lg border-2 transition-all transform active:scale-95 ${themeName === key ? `${themes[key].accentBorder}` : 'border-gray-700 hover:border-gray-500'}`}>
                                <div className="flex items-center gap-4"><div className={`w-8 h-8 rounded-full ${themes[key].accentBg}`}></div><span className="text-lg font-bold">{themes[key].name}</span></div>
                            </button>
                        ))}
                    </div>
                </SettingsCard>
                <SettingsCard title={t.language.title} description={t.language.description}>
                     <div className="flex bg-gray-900 p-1 rounded-md">
                        <button onClick={() => handleLanguageChange(LANGUAGES.en)} className={`w-full py-2 rounded-md transition-colors transform active:scale-95 ${language === 'en' ? `${theme.accentBg} text-white font-bold` : 'hover:bg-gray-800 text-gray-300'}`}>English</button>
                        <button onClick={() => handleLanguageChange(LANGUAGES.de)} className={`w-full py-2 rounded-md transition-colors transform active:scale-95 ${language === 'de' ? `${theme.accentBg} text-white font-bold` : 'hover:bg-gray-800 text-gray-300'}`}>Deutsch</button>
                    </div>
                </SettingsCard>
                <SettingsCard title={t.data.title} description={t.data.description} variant="danger">
                    <Button onClick={handleClearDB} variant="danger" leftIcon="Trash2">{t.data.button}</Button>
                </SettingsCard>
            </div>
        </div>
    );
});
