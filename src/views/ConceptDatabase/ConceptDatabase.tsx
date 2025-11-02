import React, { memo, useState, useCallback, useEffect } from 'react';
import { Concept, ConceptCreate } from '../../types';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ConceptForm } from './components/ConceptForm';
import { ConceptListItem } from './components/ConceptListItem';
import { ConceptEmptyState } from './components/ConceptEmptyState';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchConcepts, addNewConcept, updateExistingConcept, deleteExistingConcept } from '../../store/slices/conceptsSlice';
import { showToast } from '../../store/slices/uiSlice';
import { themes } from '../../lib/constants';
import { translations } from '../../lib/i18n';

export const ConceptDatabase: React.FC = memo(() => {
    const dispatch = useAppDispatch();
    const { items: concepts, status } = useAppSelector((state) => state.concepts);
    const { themeName, language } = useAppSelector(state => state.ui);
    const theme = themes[themeName];
    const texts = translations[language];
    const t = texts.conceptDatabase;
    
    const [editingConcept, setEditingConcept] = useState<Concept | undefined>(undefined);
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchConcepts());
        }
    }, [status, dispatch]);

    const handleSave = useCallback(async (data: ConceptCreate | Concept) => {
        try {
            if ('id' in data) { 
                await dispatch(updateExistingConcept(data)).unwrap();
                dispatch(showToast({ message: t.feedback.updated })); 
            } else { 
                await dispatch(addNewConcept(data)).unwrap();
                dispatch(showToast({ message: t.feedback.saved })); 
            }
            setIsFormVisible(false);
            setEditingConcept(undefined);
        } catch (error) { 
            dispatch(showToast({ message: t.feedback.error, type: 'error' })); 
        }
    }, [dispatch, t]);

    const handleDelete = useCallback(async (id: number) => {
        if (window.confirm(t.delete_confirm)) {
            try { 
                await dispatch(deleteExistingConcept(id)).unwrap();
                dispatch(showToast({ message: t.feedback.deleted, type: 'delete' })); 
            } 
            catch (error) { 
                dispatch(showToast({ message: t.feedback.error, type: 'error' })); 
            }
        }
    }, [dispatch, t]);

    const handleStartAdding = () => { setEditingConcept(undefined); setIsFormVisible(true); };
    const handleStartEditing = (concept: Concept) => { setEditingConcept(concept); setIsFormVisible(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleCancel = () => { setIsFormVisible(false); setEditingConcept(undefined); };

    const loading = status === 'loading' || status === 'idle';

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-orbitron ${theme.accentText}`}>{t.title}</h2>
                {!isFormVisible && <Button onClick={handleStartAdding} leftIcon="Plus">{t.add_button}</Button>}
            </div>
            {isFormVisible && <ConceptForm key={editingConcept?.id ?? 'new'} initialData={editingConcept} onSave={handleSave} onCancel={handleCancel} />}
            {loading && <div className="flex justify-center py-12"><Spinner /></div>}
            {!loading && (
                <div className="space-y-4">
                    {concepts.length > 0 ? (
                        concepts.map(c => <ConceptListItem key={c.id} concept={c} onEdit={() => handleStartEditing(c)} onDelete={() => handleDelete(c.id)} />)
                    ) : (
                        !isFormVisible && <ConceptEmptyState onAdd={handleStartAdding} />
                    )}
                </div>
            )}
        </div>
    );
});
