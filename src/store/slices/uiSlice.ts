import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ThemeName, Language, View, FeedbackState } from '../../types';
import { THEMES, LANGUAGES, VIEWS } from '../../lib/constants';

interface UIState {
    themeName: ThemeName;
    language: Language;
    currentView: View;
    toasts: FeedbackState[];
}

const initialState: UIState = {
    themeName: THEMES.cyan,
    language: LANGUAGES.en,
    currentView: VIEWS.ORBITAL,
    toasts: [],
};

export const showToast = createAsyncThunk(
    'ui/showToast',
    async (payload: { message: string; type?: FeedbackState['type'] }, { dispatch }) => {
        const id = Date.now();
        dispatch(addToast({ id, message: payload.message, type: payload.type || 'success' }));
        setTimeout(() => {
            dispatch(removeToast(id));
        }, 3500);
    }
);

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<ThemeName>) => {
            state.themeName = action.payload;
        },
        setLanguage: (state, action: PayloadAction<Language>) => {
            state.language = action.payload;
        },
        setView: (state, action: PayloadAction<View>) => {
            state.currentView = action.payload;
        },
        addToast: (state, action: PayloadAction<FeedbackState>) => {
            state.toasts.push(action.payload);
        },
        removeToast: (state, action: PayloadAction<number>) => {
            state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
        }
    }
});

export const { setTheme, setLanguage, setView, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
