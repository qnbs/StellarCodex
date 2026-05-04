import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setOllamaModels } from '../../store/slices/localModelsSlice';
import { discoverOllamaModels } from '../../services/ai/adapters/ollamaAdapter';
import { themes } from '../../lib/constants';

type Props = { ollamaUrl: string; labels: { discover: string }; themeKey: keyof typeof themes };

export const LocalModelsPanel: React.FC<Props> = ({ ollamaUrl, labels, themeKey }) => {
    const dispatch = useAppDispatch();
    const theme = themes[themeKey];
    const models = useAppSelector((s) => s.localModels.ollamaModels);

    const handleDiscover = async () => {
        const list = await discoverOllamaModels(ollamaUrl);
        dispatch(setOllamaModels(list));
    };

    return (
        <div className="space-y-2">
            <button
                type="button"
                onClick={() => void handleDiscover()}
                className={`px-4 py-2 rounded-md ${theme.accentBg} text-white font-semibold`}
            >
                {labels.discover}
            </button>
            {models.length > 0 && (
                <ul className="text-sm text-gray-400 max-h-32 overflow-y-auto list-disc pl-5">
                    {models.map((m) => (
                        <li key={m}>{m}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};
