export type SciFiTemplateId =
    | 'hard_consistency_check'
    | 'energy_budget'
    | 'relativity_sanity'
    | 'world_bible_outline';

export const SCI_FI_TEMPLATES: Record<
    SciFiTemplateId,
    { system: string; userBody: (vars: Record<string, string>) => string }
> = {
    hard_consistency_check: {
        system:
            'You are a hard science fiction continuity editor. Respond with concise bullet findings. Prefer known physics and cite order-of-magnitude reasoning.',
        userBody: (v) =>
            `Concepts:\n${v.concepts}\n\nCheck internal consistency and flag violations of conservative physics (energy, momentum, thermodynamics).`,
    },
    energy_budget: {
        system: 'You estimate energy budgets for speculative tech. Output numbers with SI units where possible.',
        userBody: (v) => `System description:\n${v.system}\n\nProvide rough power / energy requirements and bottlenecks.`,
    },
    relativity_sanity: {
        system: 'You check special-relativistic plausibility (no FTL). Keep answers short.',
        userBody: (v) => `Scenario:\n${v.scenario}\n\nFlag if relative speeds or signal delays are inconsistent (c as limit).`,
    },
    world_bible_outline: {
        system: 'You help build a structured world bible for hard SF. Use markdown sections.',
        userBody: (v) =>
            `Title: ${v.title}\nSeed ideas:\n${v.seeds}\n\nProduce: Premise, Technology rules, Factions, Open questions.`,
    },
};
