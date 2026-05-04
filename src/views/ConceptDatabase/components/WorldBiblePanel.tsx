import React, { useCallback, useEffect, useState } from 'react';
import type { Concept, WorldBible } from '../../../types';
import { databaseService } from '../../../services/database';
import { generateWorldBibleFromConcepts } from '../../../services/worldbuilding/bibleGenerator';
import { useAppSelector } from '../../../store/hooks';
import { themes } from '../../../lib/constants';

type Props = {
    concepts: Concept[];
    themeKey: keyof typeof themes;
    labels: { bible_section: string; generate_bible: string };
};

export const WorldBiblePanel: React.FC<Props> = ({ concepts, themeKey, labels }) => {
    const theme = themes[themeKey];
    const prefs = useAppSelector((s) => s.aiPreferences);
    const [bibles, setBibles] = useState<WorldBible[]>([]);
    const [title, setTitle] = useState('Main Setting');
    const [busy, setBusy] = useState(false);

    const refresh = useCallback(async () => {
        setBibles(await databaseService.getAllWorldBibles());
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const onGenerate = async () => {
        if (concepts.length === 0) return;
        setBusy(true);
        try {
            await generateWorldBibleFromConcepts(title, concepts, prefs.primaryProvider, prefs.routingMode);
            await refresh();
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={`mb-8 p-4 rounded-lg border border-gray-800 bg-gray-900/40`}>
            <h3 className={`text-lg font-bold mb-3 ${theme.accentText}`}>{labels.bible_section}</h3>
            <div className="flex flex-wrap gap-2 items-center mb-4">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-sm flex-1 min-w-[160px]"
                    aria-label="Bible title"
                />
                <button
                    type="button"
                    disabled={busy || concepts.length === 0}
                    onClick={() => void onGenerate()}
                    className={`px-4 py-1 rounded text-sm ${theme.accentBg} text-white disabled:opacity-40`}
                >
                    {busy ? '…' : labels.generate_bible}
                </button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {bibles.map((b) => (
                    <article key={b.id} className="border border-gray-800 rounded p-3 bg-black/20">
                        <h4 className="font-semibold text-white mb-1">{b.title}</h4>
                        <pre className="whitespace-pre-wrap text-xs text-gray-400 font-sans">{b.bodyMarkdown}</pre>
                    </article>
                ))}
            </div>
        </div>
    );
};
