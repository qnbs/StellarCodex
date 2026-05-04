export type ConsistencyKind = 'energy_budget' | 'relativity_sanity' | 'hard_consistency_check';

export interface ConsistencyCheckInput {
    worldConcepts: { id: number; summary: string }[];
    focusConceptId?: number;
    kind: ConsistencyKind;
}

export interface ConsistencyCheckResult {
    passed: boolean;
    rawModelText: string;
    findings: { severity: 'info' | 'warn' | 'fail'; message: string }[];
}
