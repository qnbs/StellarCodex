import type { ProviderId, RoutingMode } from './types';

/** Provider order for fallback attempts */
export function resolveProviderChain(
    primary: ProviderId,
    routing: RoutingMode
): ProviderId[] {
    const locals: ProviderId[] = ['ollama', 'mock'];
    const clouds: ProviderId[] = ['gemini', 'openai'];

    switch (routing) {
        case 'local_only':
            return dedupe([primary, ...locals.filter((x) => x !== primary)]);
        case 'cloud_only':
            return dedupe([primary, ...clouds.filter((x) => x !== primary)]);
        case 'local_first':
            return dedupe([primary, ...locals, ...clouds]);
        case 'cloud_first':
        default:
            return dedupe([primary, ...clouds, ...locals]);
    }
}

function dedupe(ids: ProviderId[]): ProviderId[] {
    const seen = new Set<ProviderId>();
    const out: ProviderId[] = [];
    for (const id of ids) {
        if (!seen.has(id)) {
            seen.add(id);
            out.push(id);
        }
    }
    return out;
}
