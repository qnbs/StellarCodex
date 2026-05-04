import React, { useCallback, useEffect, useState } from 'react';
import type { Concept, ConceptEdge } from '../../../types';
import { databaseService } from '../../../services/database';
import { themes } from '../../../lib/constants';

type Props = {
    concepts: Concept[];
    themeKey: keyof typeof themes;
    labels: {
        graph_section: string;
        relation_placeholder: string;
        add_edge: string;
    };
};

export const ConceptGraphPanel: React.FC<Props> = ({ concepts, themeKey, labels }) => {
    const theme = themes[themeKey];
    const [edges, setEdges] = useState<ConceptEdge[]>([]);
    const [fromId, setFromId] = useState<number | ''>('');
    const [toId, setToId] = useState<number | ''>('');
    const [relation, setRelation] = useState('depends_on');

    const refresh = useCallback(async () => {
        setEdges(await databaseService.getAllConceptEdges());
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const addEdge = async () => {
        if (fromId === '' || toId === '' || fromId === toId) return;
        await databaseService.addConceptEdge({
            sourceConceptId: fromId,
            targetConceptId: toId,
            relationType: relation || 'related',
        });
        setFromId('');
        setToId('');
        await refresh();
    };

    return (
        <div className={`mb-8 p-4 rounded-lg border border-gray-800 bg-gray-900/40`}>
            <h3 className={`text-lg font-bold mb-3 ${theme.accentText}`}>{labels.graph_section}</h3>
            <div className="flex flex-wrap gap-2 items-end mb-4">
                <select
                    aria-label="From concept"
                    value={fromId}
                    onChange={(e) => setFromId(e.target.value ? Number(e.target.value) : '')}
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
                >
                    <option value="">From…</option>
                    {concepts.map((c) => (
                        <option key={c.id} value={c.id}>
                            #{c.id} {c.concept.slice(0, 40)}
                        </option>
                    ))}
                </select>
                <select
                    aria-label="To concept"
                    value={toId}
                    onChange={(e) => setToId(e.target.value ? Number(e.target.value) : '')}
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
                >
                    <option value="">To…</option>
                    {concepts.map((c) => (
                        <option key={c.id} value={c.id}>
                            #{c.id} {c.concept.slice(0, 40)}
                        </option>
                    ))}
                </select>
                <input
                    placeholder={labels.relation_placeholder}
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm flex-1 min-w-[120px]"
                />
                <button
                    type="button"
                    onClick={() => void addEdge()}
                    className={`px-3 py-1 rounded text-sm ${theme.accentBg} text-white`}
                >
                    {labels.add_edge}
                </button>
            </div>
            <ul className="text-sm text-gray-400 space-y-1">
                {edges.map((e) => (
                    <li key={e.id}>
                        #{e.sourceConceptId} —[{e.relationType}]→ #{e.targetConceptId}
                    </li>
                ))}
            </ul>
        </div>
    );
};
