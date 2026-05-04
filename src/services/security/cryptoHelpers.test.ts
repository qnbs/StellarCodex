import { describe, it, expect } from 'vitest';
import { deriveVaultKey, encryptUtf8, decryptUtf8, randomBytes } from './cryptoHelpers';

describe('cryptoHelpers', () => {
    it('round-trips utf8 through AES-GCM', async () => {
        const salt = await randomBytes(16);
        const key = await deriveVaultKey('test-passphrase-123', salt);
        const { iv, ciphertext } = await encryptUtf8(key, 'hello σ universe');
        const out = await decryptUtf8(key, iv, ciphertext);
        expect(out).toBe('hello σ universe');
    });
});
