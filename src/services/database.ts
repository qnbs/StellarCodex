import * as idb from 'idb';
import {
    DB_NAME,
    DB_VERSION,
    STORE_NAME,
    STORE_VAULT_META,
    STORE_VAULT_SECRETS,
    STORE_CONCEPT_EDGES,
    STORE_WORLD_BIBLES,
} from '../lib/constants';
import { Concept, ConceptCreate, ConceptEdge, ConceptEdgeCreate, WorldBible } from '../types';

export const dbPromise = idb.openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
        if (oldVersion < 2) {
            if (!db.objectStoreNames.contains(STORE_VAULT_SECRETS)) {
                db.createObjectStore(STORE_VAULT_SECRETS, { keyPath: 'providerId' });
            }
            if (!db.objectStoreNames.contains(STORE_VAULT_META)) {
                db.createObjectStore(STORE_VAULT_META);
            }
        }
        if (oldVersion < 3) {
            if (!db.objectStoreNames.contains(STORE_CONCEPT_EDGES)) {
                db.createObjectStore(STORE_CONCEPT_EDGES, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(STORE_WORLD_BIBLES)) {
                db.createObjectStore(STORE_WORLD_BIBLES, { keyPath: 'id' });
            }
        }
    },
});

export const databaseService = {
    dbPromise,

    async getAllConcepts(): Promise<Concept[]> {
        const db = await this.dbPromise;
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const results: Concept[] = [];
        let cursor = await store.openCursor(null, 'prev');
        while (cursor) {
            results.push(cursor.value);
            cursor = await cursor.continue();
        }
        return results;
    },
    async addConcept(concept: ConceptCreate): Promise<number> {
        return (await this.dbPromise).add(STORE_NAME, concept);
    },
    async getConcept(id: number): Promise<Concept | undefined> {
        return (await this.dbPromise).get(STORE_NAME, id);
    },
    async updateConcept(concept: Concept): Promise<void> {
        await (await this.dbPromise).put(STORE_NAME, concept);
    },
    async deleteConcept(id: number): Promise<void> {
        await (await this.dbPromise).delete(STORE_NAME, id);
    },
    async clearDatabase(): Promise<void> {
        await (await this.dbPromise).clear(STORE_NAME);
    },

    async addConceptEdge(edge: ConceptEdgeCreate): Promise<number> {
        return (await this.dbPromise).add(STORE_CONCEPT_EDGES, edge);
    },
    async getAllConceptEdges(): Promise<ConceptEdge[]> {
        const db = await this.dbPromise;
        return db.getAll(STORE_CONCEPT_EDGES);
    },
    async deleteConceptEdge(id: number): Promise<void> {
        await (await this.dbPromise).delete(STORE_CONCEPT_EDGES, id);
    },

    async addWorldBible(row: WorldBible): Promise<void> {
        await (await this.dbPromise).put(STORE_WORLD_BIBLES, row);
    },
    async getWorldBible(id: string): Promise<WorldBible | undefined> {
        return (await this.dbPromise).get(STORE_WORLD_BIBLES, id);
    },
    async getAllWorldBibles(): Promise<WorldBible[]> {
        return (await this.dbPromise).getAll(STORE_WORLD_BIBLES);
    },
    async deleteWorldBible(id: string): Promise<void> {
        await (await this.dbPromise).delete(STORE_WORLD_BIBLES, id);
    },
};
