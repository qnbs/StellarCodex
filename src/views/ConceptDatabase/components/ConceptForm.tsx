import React, { memo, useState, useEffect, useRef } from 'react';
import { Concept, ConceptCreate } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { useAppSelector } from '../../../store/hooks';
import { themes } from '../../../lib/constants';
import { translations } from '../../../lib/i18n';

export const ConceptForm: React.FC<{ initialData?: Concept; onSave: (data: ConceptCreate | Concept) => Promise<void>; onCancel: () => void }> = memo(({ initialData, onSave, onCancel }) => {
    const { themeName, language } = useAppSelector((state) => state.ui);
    const theme = themes[themeName];
    const texts = translations[language];
    const t = texts.conceptDatabase.form;
    const isEditing = !!initialData;
    const [formState, setFormState] = useState<ConceptCreate>(() => initialData || { concept: '', scientificBasis: '', plausibility: 'Medium', details: '' });
    const [isSaving, setIsSaving] = useState(false);
    const conceptInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { conceptInputRef.current?.focus(); }, []);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!formState.concept || !formState.scientificBasis) { alert(t.required_alert); return; }
        setIsSaving(true);
        await onSave(isEditing ? { ...formState, id: initialData!.id } : formState);
        setIsSaving(false);
    };

    return (
        <div className={`bg-gray-900/50 border ${theme.accentBorder}/20 p-6 rounded-lg mb-8 form-enter`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className={`text-xl font-orbitron ${theme.accentText}`}>{isEditing ? t.edit_title : t.add_title}</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="concept-input">{t.concept_label}</label>
                    <input ref={conceptInputRef} id="concept-input" type="text" name="concept" value={formState.concept} onChange={handleInputChange} className={`w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 ${theme.accentGlow} focus:${theme.accentBorder}`} required disabled={isSaving} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="basis-input">{t.basis_label}</label>
                    <input id="basis-input" type="text" name="scientificBasis" value={formState.scientificBasis} onChange={handleInputChange} className={`w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 ${theme.accentGlow} focus:${theme.accentBorder}`} required disabled={isSaving} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="plausibility-select">{t.plausibility_label}</label>
                    <select id="plausibility-select" name="plausibility" value={formState.plausibility} onChange={handleInputChange} className={`w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 ${theme.accentGlow} focus:${theme.accentBorder}`} disabled={isSaving}>
                        {t.plausibility_options.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="details-textarea">{t.details_label}</label>
                    <textarea id="details-textarea" name="details" value={formState.details} onChange={handleInputChange} rows={4} className={`w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 ${theme.accentGlow} focus:${theme.accentBorder}`} disabled={isSaving}></textarea>
                </div>
                <div className="flex gap-4">
                    <Button type="submit" disabled={isSaving} className="flex-1">
                        {isSaving && <Spinner className="w-4 h-4" />}
                        {isEditing ? (isSaving ? t.updating_button : t.update_button) : (isSaving ? t.saving_button : t.save_button)}
                    </Button>
                    <Button type="button" onClick={onCancel} disabled={isSaving} variant="secondary" className="flex-1">{t.cancel_button}</Button>
                </div>
            </form>
        </div>
    );
});
