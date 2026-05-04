const PBKDF2_ITERATIONS = 210_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

export async function randomBytes(length: number): Promise<Uint8Array> {
    const buf = new Uint8Array(length);
    crypto.getRandomValues(buf);
    return buf;
}

export async function deriveVaultKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(passphrase),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

export async function encryptUtf8(key: CryptoKey, plaintext: string): Promise<{ iv: Uint8Array; ciphertext: Uint8Array }> {
    const iv = await randomBytes(IV_BYTES);
    const enc = new TextEncoder();
    const ct = new Uint8Array(
        await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext))
    );
    return { iv, ciphertext: ct };
}

export async function decryptUtf8(key: CryptoKey, iv: Uint8Array, ciphertext: Uint8Array): Promise<string> {
    const dec = new TextDecoder();
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return dec.decode(plain);
}

export function toBuf(u: Uint8Array): ArrayBuffer {
    return u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength);
}

export { SALT_BYTES, PBKDF2_ITERATIONS };
