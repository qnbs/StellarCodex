import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import conceptsReducer from './slices/conceptsSlice';
import uiReducer from './slices/uiSlice';

const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['themeName', 'language'],
};

const rootReducer = combineReducers({
    concepts: conceptsReducer,
    ui: persistReducer(uiPersistConfig, uiReducer),
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
