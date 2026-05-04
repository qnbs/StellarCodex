import { describe, it, expect } from 'vitest';
import { DB_NAME, DB_VERSION, THEMES, VIEWS } from './constants';

describe('constants', () => {
    it('exposes stable app identity', () => {
        expect(DB_NAME).toBe('StellarCodexDB');
        expect(DB_VERSION).toBe(3);
        expect(THEMES.cyan).toBe('cyan');
        expect(VIEWS.SETTINGS).toBe('settings');
    });
});
