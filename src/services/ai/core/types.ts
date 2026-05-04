export type ProviderId =
    | 'mock'
    | 'gemini'
    | 'openai'
    | 'anthropic'
    | 'openrouter'
    | 'xai'
    | 'ollama'
    | 'webllm';

export type RoutingMode = 'local_first' | 'cloud_first' | 'cloud_only' | 'local_only';

export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatRequest {
    messages: AIMessage[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
    abortSignal?: AbortSignal;
}

export interface ChatChunk {
    textDelta: string;
    finishReason?: 'stop' | 'length' | 'error';
}

export interface IAIProvider {
    readonly id: ProviderId;
    readonly capabilities: {
        streaming: boolean;
        structuredOutput: boolean;
    };
    chatComplete(req: ChatRequest): Promise<string>;
    chatStream?(req: ChatRequest): AsyncIterable<ChatChunk>;
}

export type SecretResolver = (providerId: ProviderId) => Promise<string | null>;
