import { describe, it, expect, beforeEach } from 'vitest';
import { isCircuitOpen, recordFailure, recordSuccess } from './circuitBreaker';

beforeEach(() => {
    recordSuccess('test-p');
});

describe('circuitBreaker', () => {
    it('opens after repeated failures', () => {
        expect(isCircuitOpen('test-p')).toBe(false);
        recordFailure('test-p');
        recordFailure('test-p');
        expect(isCircuitOpen('test-p')).toBe(false);
        recordFailure('test-p');
        expect(isCircuitOpen('test-p')).toBe(true);
    });
});
