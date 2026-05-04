/** Minimal circuit breaker per provider id */
const failures = new Map<string, number>();
const openUntil = new Map<string, number>();
const MAX_FAIL = 3;
const COOLDOWN_MS = 60_000;

export function recordFailure(providerId: string): void {
    const n = (failures.get(providerId) ?? 0) + 1;
    failures.set(providerId, n);
    if (n >= MAX_FAIL) {
        openUntil.set(providerId, Date.now() + COOLDOWN_MS);
        failures.set(providerId, 0);
    }
}

export function recordSuccess(providerId: string): void {
    failures.delete(providerId);
    openUntil.delete(providerId);
}

export function isCircuitOpen(providerId: string): boolean {
    const until = openUntil.get(providerId);
    if (!until) return false;
    if (Date.now() > until) {
        openUntil.delete(providerId);
        return false;
    }
    return true;
}
