import type { AIMessage, ChatRequest, IAIProvider, SecretResolver } from '../core/types';

const DEFAULT_MODEL = 'gpt-4o-mini';

export function createOpenAIAdapter(getApiKey: SecretResolver): IAIProvider {
    return {
        id: 'openai',
        capabilities: { streaming: false, structuredOutput: true },
        async chatComplete(req: ChatRequest): Promise<string> {
            const key = await getApiKey('openai');
            if (!key) throw new Error('Missing OpenAI API key');
            const messages = req.messages.map((m: AIMessage) => ({
                role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
                content: m.content,
            }));
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${key}`,
                },
                body: JSON.stringify({
                    model: req.model ?? DEFAULT_MODEL,
                    messages,
                    temperature: req.temperature ?? 0.7,
                    max_tokens: req.maxTokens ?? 2048,
                }),
                signal: req.abortSignal,
            });
            if (!res.ok) {
                throw new Error(`OpenAI HTTP ${res.status}: ${(await res.text()).slice(0, 400)}`);
            }
            const json = (await res.json()) as {
                choices?: { message?: { content?: string } }[];
            };
            return json.choices?.[0]?.message?.content ?? '';
        },
    };
}
