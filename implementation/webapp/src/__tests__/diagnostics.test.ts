import { describe, it, expect } from 'vitest';
import {
    getTopArchetypes,
    detectDissonance,
    getConsequenceType,
    computeDiagnostic,
    evaluateRetestOutcome,
} from '../engine/diagnostics';
import { createEmptyScores } from '../engine/scoring';
import type { ArchetypeScores, ScenarioResult } from '../types';
import { RETEST_SCENARIO } from '../data/retestScenario';

function scoresFrom(overrides: Partial<ArchetypeScores>): ArchetypeScores {
    return { ...createEmptyScores(), ...overrides };
}

describe('getTopArchetypes', () => {
    it('returns archetypes sorted by score descending', () => {
        const scores = scoresFrom({
            secure_balanced: 10,
            narcissistic_charming: 8,
            adventurous_charismatic: 5,
        });
        const top = getTopArchetypes(scores, 3);
        expect(top[0]).toBe('secure_balanced');
        expect(top[1]).toBe('narcissistic_charming');
        expect(top[2]).toBe('adventurous_charismatic');
    });

    it('excludes archetypes with score 0', () => {
        const scores = scoresFrom({ secure_balanced: 3 });
        const top = getTopArchetypes(scores, 8);
        expect(top).toHaveLength(1);
        expect(top[0]).toBe('secure_balanced');
    });

    it('returns at most n items', () => {
        const scores = scoresFrom({
            secure_balanced: 10,
            narcissistic_charming: 8,
            adventurous_charismatic: 5,
            avoidant_independent: 3,
        });
        const top = getTopArchetypes(scores, 2);
        expect(top).toHaveLength(2);
    });

    it('returns empty array when all scores are 0', () => {
        const scores = createEmptyScores();
        expect(getTopArchetypes(scores, 3)).toHaveLength(0);
    });
});

describe('detectDissonance', () => {
    it('returns true when narcissistic pulse > 2 AND secure ideal > 4', () => {
        const pulse = scoresFrom({ narcissistic_charming: 3 });
        const ideal = scoresFrom({ secure_balanced: 5 });
        expect(detectDissonance(pulse, ideal)).toBe(true);
    });

    it('returns false when narcissistic pulse <= 2', () => {
        const pulse = scoresFrom({ narcissistic_charming: 2 });
        const ideal = scoresFrom({ secure_balanced: 5 });
        expect(detectDissonance(pulse, ideal)).toBe(false);
    });

    it('returns false when secure ideal <= 4', () => {
        const pulse = scoresFrom({ narcissistic_charming: 5 });
        const ideal = scoresFrom({ secure_balanced: 4 });
        expect(detectDissonance(pulse, ideal)).toBe(false);
    });

    it('returns false when both conditions fail', () => {
        const pulse = createEmptyScores();
        const ideal = createEmptyScores();
        expect(detectDissonance(pulse, ideal)).toBe(false);
    });
});

describe('getConsequenceType', () => {
    it('returns anxiety_dopamine_cycle when narcissistic and anxious_intense are in pulse top 3', () => {
        const pulse = scoresFrom({
            narcissistic_charming: 12,
            anxious_intense: 8,
            avoidant_independent: 4,
        });
        const ideal = createEmptyScores();
        expect(getConsequenceType(pulse, ideal)).toBe('anxiety_dopamine_cycle');
    });

    it('returns anxiety_dopamine_cycle when narcissistic and impulsive are in pulse top 3', () => {
        const pulse = scoresFrom({
            narcissistic_charming: 12,
            impulsive_disorganized: 8,
            secure_balanced: 4,
        });
        const ideal = createEmptyScores();
        expect(getConsequenceType(pulse, ideal)).toBe('anxiety_dopamine_cycle');
    });

    it('returns stability_readiness when secure_balanced is top pulse and consistent_reliable is in ideal top 3', () => {
        const pulse = scoresFrom({ secure_balanced: 15 });
        const ideal = scoresFrom({ consistent_reliable: 8, secure_balanced: 6 });
        expect(getConsequenceType(pulse, ideal)).toBe('stability_readiness');
    });

    it('returns avoidance_pattern when avoidant_independent is in pulse top 3', () => {
        const pulse = scoresFrom({
            avoidant_independent: 10,
            adventurous_charismatic: 5,
        });
        const ideal = createEmptyScores();
        expect(getConsequenceType(pulse, ideal)).toBe('avoidance_pattern');
    });

    it('returns mixed_attraction as fallback when no other rule matches', () => {
        const pulse = scoresFrom({ adventurous_charismatic: 5 });
        const ideal = scoresFrom({ secure_balanced: 3 });
        expect(getConsequenceType(pulse, ideal)).toBe('mixed_attraction');
    });

    it('returns mixed_attraction when scores are all zero', () => {
        expect(getConsequenceType(createEmptyScores(), createEmptyScores())).toBe('mixed_attraction');
    });
});

describe('computeDiagnostic', () => {
    it('returns a complete diagnostic result object', () => {
        const pulse = scoresFrom({ narcissistic_charming: 10, adventurous_charismatic: 5 });
        const ideal = scoresFrom({ secure_balanced: 8 });
        const result = computeDiagnostic(pulse, ideal);

        expect(result).toHaveProperty('pulseTop3');
        expect(result).toHaveProperty('idealTop3');
        expect(result).toHaveProperty('hasDissonance');
        expect(result).toHaveProperty('consequenceType');
    });

    it('sets hasDissonance correctly', () => {
        const pulse = scoresFrom({ narcissistic_charming: 5 });
        const ideal = scoresFrom({ secure_balanced: 6 });
        const result = computeDiagnostic(pulse, ideal);
        expect(result.hasDissonance).toBe(true);
    });
});

describe('evaluateRetestOutcome', () => {
    // In RETEST_SCENARIO: retest_B = secure_balanced, retest_A = narcissistic_charming

    it('returns "learned" when the user picks the secure_balanced character first', () => {
        const retestResult: ScenarioResult = {
            scenarioId: 'retest',
            rankings: [
                { characterId: 'retest_B', position: 1 }, // secure_balanced
                { characterId: 'retest_A', position: 2 },
                { characterId: 'retest_C', position: 3 },
                { characterId: 'retest_D', position: 4 },
            ],
            responseTimeMs: 3000,
        };

        const result = evaluateRetestOutcome(retestResult, RETEST_SCENARIO, 'narcissistic_charming');
        expect(result).toBe('learned');
    });

    it('returns "repeated_pattern" when the user picks the same archetype as their original top', () => {
        const retestResult: ScenarioResult = {
            scenarioId: 'retest',
            rankings: [
                { characterId: 'retest_A', position: 1 }, // narcissistic_charming
                { characterId: 'retest_B', position: 2 },
                { characterId: 'retest_C', position: 3 },
                { characterId: 'retest_D', position: 4 },
            ],
            responseTimeMs: 4000,
        };

        const result = evaluateRetestOutcome(retestResult, RETEST_SCENARIO, 'narcissistic_charming');
        expect(result).toBe('repeated_pattern');
    });

    it('returns "repeated_pattern" when no first-choice ranking is found', () => {
        const retestResult: ScenarioResult = {
            scenarioId: 'retest',
            rankings: [], // no rankings
            responseTimeMs: 0,
        };

        const result = evaluateRetestOutcome(retestResult, RETEST_SCENARIO, 'narcissistic_charming');
        expect(result).toBe('repeated_pattern');
    });

    it('returns "repeated_pattern" when character ID is not in scenario', () => {
        const retestResult: ScenarioResult = {
            scenarioId: 'retest',
            rankings: [{ characterId: 'nonexistent_char', position: 1 }],
            responseTimeMs: 1000,
        };

        const result = evaluateRetestOutcome(retestResult, RETEST_SCENARIO, undefined);
        expect(result).toBe('repeated_pattern');
    });
});
