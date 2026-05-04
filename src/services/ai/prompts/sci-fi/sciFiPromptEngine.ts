import type { AIMessage } from '../../core/types';
import { SCI_FI_TEMPLATES, type SciFiTemplateId } from './templates';

export function buildSciFiMessages(
    templateId: SciFiTemplateId,
    variables: Record<string, string>
): AIMessage[] {
    const t = SCI_FI_TEMPLATES[templateId];
    return [
        { role: 'system', content: t.system },
        { role: 'user', content: t.userBody(variables) },
    ];
}
