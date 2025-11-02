import { Themes } from '../types';

export const DB_NAME = 'StellarCodexDB';
export const STORE_NAME = 'concepts';
export const DB_VERSION = 1;

export const THEMES = { cyan: 'cyan', amber: 'amber' } as const;
export const LANGUAGES = { en: 'en', de: 'de' } as const;
export const VIEWS = {
    ORBITAL: 'orbital',
    DATABASE: 'database',
    TRACKER: 'tracker',
    SETTINGS: 'settings',
    HELP: 'help'
} as const;

export const themes: Themes = {
    cyan: { name: "Cyan", accentText: 'text-cyan-400', accentBorder: 'border-cyan-500', accentBg: 'bg-cyan-600', accentHoverBg: 'hover:bg-cyan-500', accentGlow: 'focus-visible:ring-cyan-500' },
    amber: { name: "Amber", accentText: 'text-amber-400', accentBorder: 'border-amber-500', accentBg: 'bg-amber-600', accentHoverBg: 'hover:bg-amber-500', accentGlow: 'focus-visible:ring-amber-500' },
};
