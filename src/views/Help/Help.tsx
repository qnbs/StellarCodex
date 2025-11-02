import React, { memo, useState, ReactNode } from 'react';
import { Icon } from '../../components/ui/Icon';
import { useAppSelector } from '../../store/hooks';
import { themes } from '../../lib/constants';
import { translations } from '../../lib/i18n';

export const Help: React.FC = memo(() => {
    const { themeName, language } = useAppSelector((state) => state.ui);
    const theme = themes[themeName];
    const texts = translations[language];
    const t = texts.help;
    const [openSection, setOpenSection] = useState<string | null>(null);

    const AccordionItem: React.FC<{id: string; title: string; children: ReactNode;}> = ({ id, title, children }) => {
        const isOpen = openSection === id;
        return (
            <div className={`border-b ${theme.accentBorder}/20 last:border-b-0`}>
                <button onClick={() => setOpenSection(isOpen ? null : id)} className="w-full text-left flex justify-between items-center p-4 hover:bg-gray-800/50 transition-colors">
                    <h4 className="text-lg font-bold">{title}</h4>
                    <Icon name="ChevronDown" className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>
                <div className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out ${isOpen && 'grid-rows-[1fr]'}`}><div className="overflow-hidden"><div className="p-4 pt-0 text-gray-400">{children}</div></div></div>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <h2 className={`text-3xl font-orbitron ${theme.accentText} mb-4`}>{t.title}</h2>
            <p className="mb-8 text-gray-400">{t.intro}</p>
            <div className={`bg-gray-900/50 border ${theme.accentBorder}/20 rounded-lg mb-8`}>
                {(Object.entries(t.sections)).map(([key, section]) => {
                    const typedSection = section as { title: string; content: string };
                    return (<AccordionItem key={key} id={key} title={typedSection.title}>{typedSection.content}</AccordionItem>);
                })}
            </div>
            <h3 className={`text-2xl font-orbitron ${theme.accentText} mb-4`}>{t.faq.title}</h3>
            <div className="space-y-4 mb-8">
                <div><h4 className="font-bold">{t.faq.q1}</h4><p className="text-gray-400">{t.faq.a1}</p></div>
                <div><h4 className="font-bold">{t.faq.q2}</h4><p className="text-gray-400">{t.faq.a2}</p></div>
            </div>
        </div>
    );
});
