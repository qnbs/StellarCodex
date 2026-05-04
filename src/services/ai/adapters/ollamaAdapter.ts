import type { AIMessage, ChatRequest, IAIProvider } from '../core/types';

export interface OllamaAdapterOptions {
    baseUrl: string;
    defaultModel: string;
}

export function createOllamaAdapter(opts: OllamaAdapterOptions): IAIProvider {
    const base = opts.baseUrl.replace(/\/$/, '');
    return {
        id: 'ollama',
        capabilities: { streaming: false, structuredOutput: true },
        async chatComplete(req: ChatRequest): Promise<string> {
            const messages = req.messages.map((m: AIMessage) => ({
                role: m.role === 'system' ? 'system' : m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content,
            }));
            const res = await fetch(`${base}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: req.model ?? opts.defaultModel,
                    messages,
                    stream: false,
                    options: { temperature: req.temperature ?? 0.7 },
                }),
                signal: req.abortSignal,
            });
            if (!res.ok) {
                throw new Error(`Ollama HTTP ${res.status} at ${base}`);
            }
            const json = (await res.json()) as { message?: { content?: string } };
            return json.message?.content ?? '';
        },
    };
}

/** Probe local Ollama tags endpoint */
export async function discoverOllamaModels(baseUrl: string): Promise<string[]> {
    const base = baseUrl.replace(/\/$/, '');
    try {
        const res = await fetch(`${base}/api/tags`, { method: 'GET' });
        if (!res.ok) return [];
        const json = (await res.json()) as { models?: { name: string }[] };
        return (json.models ?? []).map((m) => m.name);
    } catch {
        return [];
    }
}
