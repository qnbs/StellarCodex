import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/** Approximate usage counters per provider id (client-side only, no secrets) */
export interface AIUsageState {
    requestsByProvider: Record<string, number>;
}

const initialState: AIUsageState = {
    requestsByProvider: {},
};

const aiUsageSlice = createSlice({
    name: 'aiUsage',
    initialState,
    reducers: {
        incrementRequests: (state, action: PayloadAction<string>) => {
            const k = action.payload;
            state.requestsByProvider[k] = (state.requestsByProvider[k] ?? 0) + 1;
        },
    },
});

export const { incrementRequests } = aiUsageSlice.actions;
export default aiUsageSlice.reducer;
