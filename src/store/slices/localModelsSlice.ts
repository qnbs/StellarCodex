import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LocalModelsState {
    ollamaModels: string[];
    lastDiscoveryMs: number | null;
}

const initialState: LocalModelsState = {
    ollamaModels: [],
    lastDiscoveryMs: null,
};

const localModelsSlice = createSlice({
    name: 'localModels',
    initialState,
    reducers: {
        setOllamaModels: (state, action: PayloadAction<string[]>) => {
            state.ollamaModels = action.payload;
            state.lastDiscoveryMs = Date.now();
        },
    },
});

export const { setOllamaModels } = localModelsSlice.actions;
export default localModelsSlice.reducer;
