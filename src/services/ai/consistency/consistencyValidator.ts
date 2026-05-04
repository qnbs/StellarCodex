import type { ProviderId, RoutingMode } from '../core/types';
import { chatCompleteWithFallback } from '../aiService';
import { buildSciFiMessages } from '../prompts/sci-fi/sciFiPromptEngine';
import type { ConsistencyCheckInput, ConsistencyCheckResult } from './types';

function mapKindToTemplate(kind: ConsistencyCheckInput['kind']) {
    if (kind === 'hard_consistency_check') return 'hard_consistency_check' as const;
    if (kind === 'energy_budget') return 'energy_budget' as const;
    return 'relativity_sanity' as const;
}

export async function runConsistencyCheck(
    input: ConsistencyCheckInput,
    primary: ProviderId,
    routing: RoutingMode
): Promise<ConsistencyCheckResult> {
    if (input.worldConcepts.length === 0) {
        return {
            passed: true,
            rawModelText: '',
            findings: [{ severity: 'info', message: 'No concepts to check.' }],
        };
    }
    const templateId = mapKindToTemplate(input.kind);
    const concepts = input.worldConcepts
        .map((c) => `- #${c.id}: ${c.summary}`)
        .join('\n');

    let variables: Record<string, string>;
    if (templateId === 'hard_consistency_check') {
        variables = { concepts };
    } else if (templateId === 'energy_budget') {
        variables = { system: concepts };
    } else {
        variables = { scenario: concepts };
    }

    const messages = buildSciFiMessages(templateId, variables);
    const { text } = await chatCompleteWithFallback(
        { messages, temperature: 0.3 },
        primary,
        routing
    );

    const lower = text.toLowerCase();
    const failHints = ['violation', 'impossible', 'contradiction', 'ftl', 'perpetual motion'];
    const hasFail = failHints.some((h) => lower.includes(h));

    return {
        passed: !hasFail,
        rawModelText: text,
        findings: [
            {
                severity: hasFail ? 'warn' : 'info',
                message: hasFail ? 'Heuristic flag: possible physics/consistency issues mentioned.' : 'No obvious red flags in heuristic scan.',
            },
        ],
    };
}
