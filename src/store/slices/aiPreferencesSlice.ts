import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ProviderId, RoutingMode } from '../../services/ai/core/types';
import { DEFAULT_OLLAMA_URL } from '../../services/ai/core/providerRegistry';

export interface AIPreferencesState {
    primaryProvider: ProviderId;
    routingMode: RoutingMode;
    ollamaBaseUrl: string;
}

const initialState: AIPreferencesState = {
    primaryProvider: 'mock',
    routingMode: 'local_first',
    ollamaBaseUrl: DEFAULT_OLLAMA_URL,
};

const aiPreferencesSlice = createSlice({
    name: 'aiPreferences',
    initialState,
    reducers: {
        setPrimaryProvider: (state, action: PayloadAction<ProviderId>) => {
            state.primaryProvider = action.payload;
        },
        setRoutingMode: (state, action: PayloadAction<RoutingMode>) => {
            state.routingMode = action.payload;
        },
        setOllamaBaseUrl: (state, action: PayloadAction<string>) => {
            state.ollamaBaseUrl = action.payload;
        },
    },
});

export const { setPrimaryProvider, setRoutingMode, setOllamaBaseUrl } = aiPreferencesSlice.actions;
export default aiPreferencesSlice.reducer;
