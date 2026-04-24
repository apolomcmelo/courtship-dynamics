import { describe, it, expect } from 'vitest';
import {
    createEmptyScores,
    computePulseScores,
    computeIdealScores,
    buildFullRanking,
    normalizeScores,
    ARCHETYPE_IDS,
} from '../engine/scoring';
import type { ScenarioResult, SurveyAnswer } from '../types';
import { SCENARIOS } from '../data/scenarios';
import { SURVEY_QUESTIONS } from '../data/surveyQuestions';

describe('createEmptyScores', () => {
    it('returns an object with all 8 archetype IDs set to 0', () => {
        const scores = createEmptyScores();
        expect(Object.keys(scores)).toHaveLength(8);
        for (const id of ARCHETYPE_IDS) {
            expect(scores[id]).toBe(0);
        }
    });
});

describe('computePulseScores', () => {
    it('returns empty scores when no results are provided', () => {
        const scores = computePulseScores([], SCENARIOS);
        for (const id of ARCHETYPE_IDS) {
            expect(scores[id]).toBe(0);
        }
    });

    it('awards 3 points to the archetype ranked 1st', () => {
        // bar scenario: bar_B = secure_balanced, rank 1st
        const results: ScenarioResult[] = [
            {
                scenarioId: 'bar',
                rankings: [
                    { characterId: 'bar_B', position: 1 },
                    { characterId: 'bar_A', position: 2 },
                    { characterId: 'bar_C', position: 3 },
                    { characterId: 'bar_D', position: 4 },
                ],
                responseTimeMs: 3000,
            },
        ];

        const scores = computePulseScores(results, SCENARIOS);
        expect(scores.secure_balanced).toBe(3);
        expect(scores.social_dominant).toBe(2);
        expect(scores.adventurous_charismatic).toBe(1);
        expect(scores.narcissistic_charming).toBe(0);
    });

    it('awards 0 points to the archetype ranked 4th', () => {
        const results: ScenarioResult[] = [
            {
                scenarioId: 'bar',
                rankings: [
                    { characterId: 'bar_A', position: 1 },
                    { characterId: 'bar_C', position: 2 },
                    { characterId: 'bar_B', position: 3 },
                    { characterId: 'bar_D', position: 4 },
                ],
                responseTimeMs: 2500,
            },
        ];

        const scores = computePulseScores(results, SCENARIOS);
        expect(scores.narcissistic_charming).toBe(0);
    });

    it('accumulates scores across multiple scenarios', () => {
        // secure_balanced appears in both bar (position B) and instagram (position B)
        const results: ScenarioResult[] = [
            {
                scenarioId: 'bar',
                rankings: [
                    { characterId: 'bar_B', position: 1 }, // secure_balanced: 3pts
                    { characterId: 'bar_A', position: 2 },
                    { characterId: 'bar_C', position: 3 },
                    { characterId: 'bar_D', position: 4 },
                ],
                responseTimeMs: 3000,
            },
            {
                scenarioId: 'instagram',
                rankings: [
                    { characterId: 'instagram_B', position: 1 }, // secure_balanced: 3pts
                    { characterId: 'instagram_A', position: 2 },
                    { characterId: 'instagram_C', position: 3 },
                    { characterId: 'instagram_D', position: 4 },
                ],
                responseTimeMs: 2000,
            },
        ];

        const scores = computePulseScores(results, SCENARIOS);
        expect(scores.secure_balanced).toBe(6); // 3 + 3
    });

    it('ignores results for unknown scenario IDs', () => {
        const results: ScenarioResult[] = [
            {
                scenarioId: 'nonexistent_scenario',
                rankings: [{ characterId: 'bar_A', position: 1 }],
                responseTimeMs: 1000,
            },
        ];

        const scores = computePulseScores(results, SCENARIOS);
        for (const id of ARCHETYPE_IDS) {
            expect(scores[id]).toBe(0);
        }
    });

    it('applies contextMultiplier correctly when set to 2', () => {
        const modifiedScenarios = SCENARIOS.map((s) =>
            s.id === 'bar' ? { ...s, contextMultiplier: 2.0 } : s,
        );

        const results: ScenarioResult[] = [
            {
                scenarioId: 'bar',
                rankings: [
                    { characterId: 'bar_B', position: 1 }, // secure_balanced: 3 * 1.0 * 2.0 = 6
                    { characterId: 'bar_A', position: 2 },
                    { characterId: 'bar_C', position: 3 },
                    { characterId: 'bar_D', position: 4 },
                ],
                responseTimeMs: 2000,
            },
        ];

        const scores = computePulseScores(results, modifiedScenarios);
        expect(scores.secure_balanced).toBe(6);
    });
});

describe('computeIdealScores', () => {
    it('returns empty scores when no answers are provided', () => {
        const scores = computeIdealScores([], SURVEY_QUESTIONS);
        for (const id of ARCHETYPE_IDS) {
            expect(scores[id]).toBe(0);
        }
    });

    it('adds archetype weights from selected option', () => {
        // sunday_B → consistent_reliable: 2, secure_balanced: 1
        const answers: SurveyAnswer[] = [
            { questionId: 'sunday', selectedOptionId: 'sunday_B' },
        ];

        const scores = computeIdealScores(answers, SURVEY_QUESTIONS);
        expect(scores.consistent_reliable).toBe(2);
        expect(scores.secure_balanced).toBe(1);
    });

    it('accumulates weights across multiple answers', () => {
        // sunday_D → secure_balanced: 2, consistent_reliable: 1
        // conflict_A → secure_balanced: 2, consistent_reliable: 1
        const answers: SurveyAnswer[] = [
            { questionId: 'sunday', selectedOptionId: 'sunday_D' },
            { questionId: 'conflict', selectedOptionId: 'conflict_A' },
        ];

        const scores = computeIdealScores(answers, SURVEY_QUESTIONS);
        expect(scores.secure_balanced).toBe(4); // 2 + 2
        expect(scores.consistent_reliable).toBe(2); // 1 + 1
    });

    it('ignores answers for unknown question IDs', () => {
        const answers: SurveyAnswer[] = [
            { questionId: 'unknown_question', selectedOptionId: 'some_option' },
        ];

        const scores = computeIdealScores(answers, SURVEY_QUESTIONS);
        for (const id of ARCHETYPE_IDS) {
            expect(scores[id]).toBe(0);
        }
    });

    it('adds full weight for options with single high-weight archetype', () => {
        // busyWeek_A → consistent_reliable: 3
        const answers: SurveyAnswer[] = [
            { questionId: 'busyWeek', selectedOptionId: 'busyWeek_A' },
        ];

        const scores = computeIdealScores(answers, SURVEY_QUESTIONS);
        expect(scores.consistent_reliable).toBe(3);
    });
});

describe('buildFullRanking', () => {
    it('returns the same rankings if already complete', () => {
        const rankings = [
            { characterId: 'A', position: 1 },
            { characterId: 'B', position: 2 },
            { characterId: 'C', position: 3 },
            { characterId: 'D', position: 4 },
        ];
        const full = buildFullRanking(rankings, ['A', 'B', 'C', 'D']);
        expect(full).toHaveLength(4);
    });

    it('fills in the unranked character at position 4', () => {
        const rankings = [
            { characterId: 'A', position: 1 },
            { characterId: 'B', position: 2 },
            { characterId: 'C', position: 3 },
        ];
        const full = buildFullRanking(rankings, ['A', 'B', 'C', 'D']);
        expect(full).toHaveLength(4);
        const dEntry = full.find((r) => r.characterId === 'D');
        expect(dEntry).toBeDefined();
        expect(dEntry?.position).toBe(4);
    });
});

describe('normalizeScores', () => {
    it('returns all zeros when maxValue is 0', () => {
        const scores = createEmptyScores();
        const normalized = normalizeScores(scores, 0);
        for (const id of ARCHETYPE_IDS) {
            expect(normalized[id]).toBe(0);
        }
    });

    it('normalizes correctly to percentage', () => {
        const scores = createEmptyScores();
        scores.secure_balanced = 9;
        const normalized = normalizeScores(scores, 18);
        expect(normalized.secure_balanced).toBe(50);
    });

    it('caps at 100 when score equals maxValue', () => {
        const scores = createEmptyScores();
        scores.narcissistic_charming = 18;
        const normalized = normalizeScores(scores, 18);
        expect(normalized.narcissistic_charming).toBe(100);
    });
});
