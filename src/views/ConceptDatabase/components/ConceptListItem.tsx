import React, { memo } from 'react';
import { Concept } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { useAppSelector } from '../../../store/hooks';
import { themes } from '../../../lib/constants';
import { translations } from '../../../lib/i18n';

export const ConceptListItem: React.FC<{ concept: Concept; onEdit: () => void; onDelete: () => void; }> = memo(({ concept, onEdit, onDelete }) => {
    const { themeName, language } = useAppSelector((state) => state.ui);
    const theme = themes[themeName];
    const texts = translations[language];
    const t = texts.conceptDatabase;
    const isHigh = concept.plausibility === 'High' || concept.plausibility === 'Hoch';
    const isMedium = concept.plausibility === 'Medium' || concept.plausibility === 'Mittel';
    const plausibilityColor = isHigh ? 'bg-green-500/20 text-green-300' : isMedium ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300';
    return (
        <div className={`bg-gray-900/50 border ${theme.accentBorder}/10 p-4 rounded-lg flex justify-between items-start`}>
            <div>
                <h4 className={`text-lg font-bold ${theme.accentText}`}>{concept.concept}</h4>
                <p className="text-sm text-gray-400"><strong>{t.entry.basis}:</strong> {concept.scientificBasis}</p>
                <p className="text-sm text-gray-400 mt-2"><strong>{t.entry.details}:</strong> {concept.details || 'N/A'}</p>
                <div className="flex items-center gap-3 mt-2"><span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${plausibilityColor}`}>{concept.plausibility}</span></div>
            </div>
            <div className="flex gap-1 flex-shrink-0 ml-4">
                <Button onClick={onEdit} aria-label={t.form.edit_label} variant="ghost" size="small"><Icon name="Pencil" className="w-4 h-4" /></Button>
                <Button onClick={onDelete} aria-label={t.form.delete_label} variant="ghost" size="small" className="hover:text-red-500"><Icon name="Trash2" className="w-4 h-4" /></Button>
            </div>
        </div>
    );
});
