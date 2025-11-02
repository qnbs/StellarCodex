import { THEMES, VIEWS, LANGUAGES } from '../lib/constants';
import { translations } from '../lib/i18n';

export type ThemeName = keyof typeof THEMES;
export type Language = keyof typeof LANGUAGES;
export type View = typeof VIEWS[keyof typeof VIEWS];

export interface Concept {
    id: number;
    concept: string;
    scientificBasis: string;
    plausibility: string;
    details: string;
}

export type ConceptCreate = Omit<Concept, 'id'>;

export interface FeedbackState {
    id: number;
    message: string;
    type: 'success' | 'delete' | 'error';
}

export type Theme = {
    accentText: string;
    accentBorder: string;
    accentBg: string;
    accentHoverBg: string;
    accentGlow: string;
    name: string;
};

export type Themes = Record<ThemeName, Theme>;
export type TranslationSet = typeof translations.en;
