import {
    STORE_VAULT_META,
    STORE_VAULT_SECRETS,
} from '../../lib/constants';
import { dbPromise } from '../database';
import {
    SALT_BYTES,
    decryptUtf8,
    deriveVaultKey,
    encryptUtf8,
    randomBytes,
    toBuf,
} from './cryptoHelpers';
import type { ProviderId } from '../ai/core/types';

const CHECK_PLAINTEXT = 'stellarcodex-vault-check-v1';

let sessionKey: CryptoKey | null = null;

export async function isVaultInitialized(): Promise<boolean> {
    const d = await dbPromise;
    const salt = await d.get(STORE_VAULT_META, 'salt');
    return !!salt;
}

export function isUnlocked(): boolean {
    return sessionKey !== null;
}

export async function initVault(passphrase: string): Promise<void> {
    if (await isVaultInitialized()) {
        throw new Error('Vault already initialized');
    }
    const salt = await randomBytes(SALT_BYTES);
    const key = await deriveVaultKey(passphrase, salt);
    const check = await encryptUtf8(key, CHECK_PLAINTEXT);
    const d = await dbPromise;
    await d.put(STORE_VAULT_META, toBuf(salt), 'salt');
    await d.put(
        STORE_VAULT_META,
        { iv: toBuf(check.iv), ciphertext: toBuf(check.ciphertext) },
        'check'
    );
    sessionKey = key;
}

export async function unlock(passphrase: string): Promise<boolean> {
    const d = await dbPromise;
    const saltBuf = await d.get(STORE_VAULT_META, 'salt');
    const checkRec = await d.get(STORE_VAULT_META, 'check');
    if (!saltBuf || !checkRec) return false;
    const salt = new Uint8Array(saltBuf as ArrayBuffer);
    const key = await deriveVaultKey(passphrase, salt);
    try {
        const plain = await decryptUtf8(
            key,
            new Uint8Array(checkRec.iv as ArrayBuffer),
            new Uint8Array(checkRec.ciphertext as ArrayBuffer)
        );
        if (plain !== CHECK_PLAINTEXT) return false;
        sessionKey = key;
        return true;
    } catch {
        return false;
    }
}

export function lockVault(): void {
    sessionKey = null;
}

export async function saveProviderSecret(providerId: ProviderId, secret: string): Promise<void> {
    if (!sessionKey) throw new Error('Vault locked');
    const { iv, ciphertext } = await encryptUtf8(sessionKey, secret);
    const d = await dbPromise;
    await d.put(STORE_VAULT_SECRETS, {
        providerId,
        iv: toBuf(iv),
        ciphertext: toBuf(ciphertext),
    });
}

export async function getProviderSecret(providerId: ProviderId): Promise<string | null> {
    if (!sessionKey) return null;
    const d = await dbPromise;
    const rec = await d.get(STORE_VAULT_SECRETS, providerId);
    if (!rec) return null;
    try {
        return await decryptUtf8(
            sessionKey,
            new Uint8Array(rec.iv as ArrayBuffer),
            new Uint8Array(rec.ciphertext as ArrayBuffer)
        );
    } catch {
        return null;
    }
}

export async function deleteProviderSecret(providerId: ProviderId): Promise<void> {
    const d = await dbPromise;
    await d.delete(STORE_VAULT_SECRETS, providerId);
}
