import * as vault from '../security/aiKeyVault';
import type { ChatRequest, IAIProvider, ProviderId, RoutingMode, SecretResolver } from './core/types';
import { buildProviderRegistry, DEFAULT_OLLAMA_URL } from './core/providerRegistry';
import { isCircuitOpen, recordFailure, recordSuccess } from './core/circuitBreaker';
import { resolveProviderChain } from './core/hybridRouter';

export interface AIServiceDeps {
    ollamaBaseUrl?: string;
}

/** Resolves API keys from encrypted vault only */
export const vaultSecretResolver: SecretResolver = (providerId) => vault.getProviderSecret(providerId);

let registryCache: Map<ProviderId, IAIProvider> | null = null;
let registryOllamaUrl = DEFAULT_OLLAMA_URL;

export function configureAiRegistry(deps: AIServiceDeps): void {
    registryOllamaUrl = deps.ollamaBaseUrl ?? DEFAULT_OLLAMA_URL;
    registryCache = buildProviderRegistry(vaultSecretResolver, registryOllamaUrl);
}

function getRegistry(): Map<ProviderId, IAIProvider> {
    if (!registryCache) {
        registryCache = buildProviderRegistry(vaultSecretResolver, registryOllamaUrl);
    }
    return registryCache;
}

export async function chatCompleteWithFallback(
    req: ChatRequest,
    primary: ProviderId,
    routing: RoutingMode
): Promise<{ text: string; providerUsed: ProviderId }> {
    const chain = resolveProviderChain(primary, routing);
    const registry = getRegistry();
    let lastErr: unknown;
    for (const pid of chain) {
        if (isCircuitOpen(pid)) continue;
        const provider = registry.get(pid);
        if (!provider) continue;
        if (pid !== 'mock' && pid !== 'ollama') {
            const secret = await vault.getProviderSecret(pid);
            if (!secret) continue;
        }
        try {
            const text = await provider.chatComplete(req);
            recordSuccess(pid);
            return { text, providerUsed: pid };
        } catch (e) {
            recordFailure(pid);
            lastErr = e;
        }
    }
    throw lastErr instanceof Error ? lastErr : new Error('All providers failed');
}

export function getProviderOrThrow(id: ProviderId): IAIProvider {
    const p = getRegistry().get(id);
    if (!p) throw new Error(`Unknown provider: ${id}`);
    return p;
}
