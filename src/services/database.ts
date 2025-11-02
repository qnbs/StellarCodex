import * as idb from 'idb';
import { DB_NAME, DB_VERSION, STORE_NAME } from '../lib/constants';
import { Concept, ConceptCreate } from '../types';

export const databaseService = {
    dbPromise: idb.openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        },
    }),

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
    }
};