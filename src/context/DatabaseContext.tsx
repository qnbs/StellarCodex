import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Concept, ConceptCreate } from '../types';
import { databaseService } from '../services/database';

interface DatabaseContextType {
    concepts: Concept[];
    loading: boolean;
    addConcept: (concept: ConceptCreate) => Promise<void>;
    updateConcept: (concept: Concept) => Promise<void>;
    deleteConcept: (id: number) => Promise<void>;
    clearDatabase: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const useDatabase = () => useContext(DatabaseContext)!;

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [concepts, setConcepts] = useState<Concept[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConcepts = async () => {
            try {
                const allConcepts = await databaseService.getAllConcepts();
                setConcepts(allConcepts);
            } catch (error) { console.error("DB Fetch Failed:", error); }
            finally { setLoading(false); }
        };
        fetchConcepts();
    }, []);

    const addConcept = async (concept: ConceptCreate) => {
        const id = await databaseService.addConcept(concept);
        const newConcept = await databaseService.getConcept(id);
        if(newConcept) {
            setConcepts(prev => [newConcept, ...prev]);
        }
    };
    const updateConcept = async (concept: Concept) => {
        await databaseService.updateConcept(concept);
        setConcepts(prev => prev.map(c => c.id === concept.id ? concept : c));
    };
    const deleteConcept = async (id: number) => {
        await databaseService.deleteConcept(id);
        setConcepts(prev => prev.filter(c => c.id !== id));
    };
    const clearDatabase = async () => {
        await databaseService.clearDatabase();
        setConcepts([]);
    };
    
    const value = { concepts, loading, addConcept, updateConcept, deleteConcept, clearDatabase };
    return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
};
