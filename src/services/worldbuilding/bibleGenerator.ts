import { databaseService } from '../database';
import type { Concept } from '../../types';
import { chatCompleteWithFallback } from '../ai/aiService';
import { buildSciFiMessages } from '../ai/prompts/sci-fi/sciFiPromptEngine';
import type { ProviderId, RoutingMode } from '../ai/core/types';

export async function generateWorldBibleFromConcepts(
    title: string,
    concepts: Concept[],
    primary: ProviderId,
    routing: RoutingMode
): Promise<string> {
    const seeds = concepts
        .map((c) => `${c.concept}\n${c.scientificBasis}\n${c.details}`)
        .join('\n\n---\n\n');
    const messages = buildSciFiMessages('world_bible_outline', { title, seeds });
    const { text } = await chatCompleteWithFallback({ messages, temperature: 0.6 }, primary, routing);
    const id = crypto.randomUUID();
    const now = Date.now();
    await databaseService.addWorldBible({
        id,
        title,
        bodyMarkdown: text,
        createdAt: now,
        updatedAt: now,
    });
    return id;
}
