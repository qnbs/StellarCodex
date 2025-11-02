import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Concept, ConceptCreate } from '../../types';
import { databaseService } from '../../services/database';
import { RootState } from '../index';

interface ConceptsState {
    items: Concept[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ConceptsState = {
    items: [],
    status: 'idle',
    error: null,
};

export const fetchConcepts = createAsyncThunk('concepts/fetchConcepts', async () => {
    const concepts = await databaseService.getAllConcepts();
    return concepts;
});

export const addNewConcept = createAsyncThunk('concepts/addNewConcept', async (newConcept: ConceptCreate) => {
    const id = await databaseService.addConcept(newConcept);
    const concept = await databaseService.getConcept(id);
    if (!concept) throw new Error("Failed to retrieve new concept from DB");
    return concept;
});

export const updateExistingConcept = createAsyncThunk('concepts/updateExistingConcept', async (concept: Concept) => {
    await databaseService.updateConcept(concept);
    return concept;
});

export const deleteExistingConcept = createAsyncThunk('concepts/deleteExistingConcept', async (id: number) => {
    await databaseService.deleteConcept(id);
    return id;
});

export const clearAllConcepts = createAsyncThunk('concepts/clearAllConcepts', async () => {
    await databaseService.clearDatabase();
});

const conceptsSlice = createSlice({
    name: 'concepts',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchConcepts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchConcepts.fulfilled, (state, action: PayloadAction<Concept[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchConcepts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch concepts';
            })
            .addCase(addNewConcept.fulfilled, (state, action: PayloadAction<Concept>) => {
                state.items.unshift(action.payload);
            })
            .addCase(updateExistingConcept.fulfilled, (state, action: PayloadAction<Concept>) => {
                const index = state.items.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(deleteExistingConcept.fulfilled, (state, action: PayloadAction<number>) => {
                state.items = state.items.filter(c => c.id !== action.payload);
            })
            .addCase(clearAllConcepts.fulfilled, (state) => {
                state.items = [];
            });
    },
});

export const selectAllConcepts = (state: RootState) => state.concepts.items;
export const selectConceptsStatus = (state: RootState) => state.concepts.status;

export default conceptsSlice.reducer;
