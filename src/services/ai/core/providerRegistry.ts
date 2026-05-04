import type { IAIProvider, ProviderId, SecretResolver } from './types';
import { createGeminiAdapter } from '../adapters/geminiAdapter';
import { createMockAdapter } from '../adapters/mockAdapter';
import { createOllamaAdapter } from '../adapters/ollamaAdapter';
import { createOpenAIAdapter } from '../adapters/openaiAdapter';

export const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434';

export function buildProviderRegistry(
    getSecret: SecretResolver,
    ollamaBaseUrl: string
): Map<ProviderId, IAIProvider> {
    const map = new Map<ProviderId, IAIProvider>();
    map.set('mock', createMockAdapter());
    map.set('gemini', createGeminiAdapter(getSecret));
    map.set('openai', createOpenAIAdapter(getSecret));
    map.set(
        'ollama',
        createOllamaAdapter({
            baseUrl: ollamaBaseUrl || DEFAULT_OLLAMA_URL,
            defaultModel: 'llama3.2',
        })
    );
    return map;
}
