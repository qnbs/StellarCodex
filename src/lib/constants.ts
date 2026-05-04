import { Themes } from '../types';

export const DB_NAME = 'StellarCodexDB';
export const STORE_NAME = 'concepts';
/** Encrypted API key material (BYOK) — never store plaintext outside Web Crypto */
export const STORE_VAULT_SECRETS = 'vaultSecrets';
export const STORE_VAULT_META = 'vaultMeta';
/** Directed edges between concepts (Phase 2 graph) */
export const STORE_CONCEPT_EDGES = 'conceptEdges';
/** Generated worldbuilding bibles (Phase 2) */
export const STORE_WORLD_BIBLES = 'worldBibles';
export const DB_VERSION = 3;

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
