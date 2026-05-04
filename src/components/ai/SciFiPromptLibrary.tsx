import React from 'react';
import type { SciFiTemplateId } from '../../services/ai/prompts/sci-fi/templates';
import { SCI_FI_TEMPLATES } from '../../services/ai/prompts/sci-fi/templates';
import { themes } from '../../lib/constants';

type Props = { heading: string; themeKey: keyof typeof themes };

const IDS = Object.keys(SCI_FI_TEMPLATES) as SciFiTemplateId[];

export const SciFiPromptLibrary: React.FC<Props> = ({ heading, themeKey }) => {
    const theme = themes[themeKey];
    return (
        <div>
            <p className="text-gray-400 text-sm mb-2">{heading}</p>
            <ul className="flex flex-wrap gap-2">
                {IDS.map((id) => (
                    <li key={id}>
                        <span
                            className={`inline-block px-2 py-1 rounded text-xs border border-gray-600 ${theme.accentText}`}
                            title={SCI_FI_TEMPLATES[id].system.slice(0, 120)}
                        >
                            {id}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
