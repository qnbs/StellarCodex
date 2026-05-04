import type { ChatRequest, IAIProvider } from '../core/types';

export function createMockAdapter(): IAIProvider {
    return {
        id: 'mock',
        capabilities: { streaming: false, structuredOutput: true },
        async chatComplete(req: ChatRequest): Promise<string> {
            const last = req.messages.filter((m) => m.role === 'user').pop();
            const snippet = last?.content?.slice(0, 120) ?? '';
            return `[mock:${req.model ?? 'default'}] Echo: ${snippet}`;
        },
    };
}
