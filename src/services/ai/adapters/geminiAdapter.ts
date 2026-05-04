import type { AIMessage, ChatRequest, IAIProvider, SecretResolver } from '../core/types';

const DEFAULT_MODEL = 'gemini-2.0-flash';

function toGeminiContents(messages: AIMessage[]) {
    let system = '';
    const parts: { role: string; parts: { text: string }[] }[] = [];
    for (const m of messages) {
        if (m.role === 'system') {
            system += (system ? '\n' : '') + m.content;
            continue;
        }
        const role = m.role === 'assistant' ? 'model' : 'user';
        parts.push({ role, parts: [{ text: m.content }] });
    }
    return { system, contents: parts };
}

export function createGeminiAdapter(getApiKey: SecretResolver): IAIProvider {
    return {
        id: 'gemini',
        capabilities: { streaming: false, structuredOutput: true },
        async chatComplete(req: ChatRequest): Promise<string> {
            const key = await getApiKey('gemini');
            if (!key) throw new Error('Missing Gemini API key (unlock vault and save key)');
            const model = req.model ?? DEFAULT_MODEL;
            const { system, contents } = toGeminiContents(req.messages);
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
            const body: Record<string, unknown> = {
                contents,
                generationConfig: {
                    temperature: req.temperature ?? 0.7,
                    maxOutputTokens: req.maxTokens ?? 2048,
                },
            };
            if (system) {
                body.systemInstruction = { parts: [{ text: system }] };
            }
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: req.abortSignal,
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 400)}`);
            }
            const json = (await res.json()) as {
                candidates?: { content?: { parts?: { text?: string }[] } }[];
            };
            const text =
                json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
            return text;
        },
    };
}
