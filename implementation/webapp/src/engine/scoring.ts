import type {
    ArchetypeId,
    ArchetypeScores,
    CharacterRanking,
    ScenarioResult,
    SurveyAnswer,
} from '../types';
import type { Scenario } from '../types';
import type { SurveyQuestion } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

/** All archetype IDs in a stable order used for iteration and chart rendering */
export const ARCHETYPE_IDS: ArchetypeId[] = [
    'adventurous_charismatic',
    'consistent_reliable',
    'anxious_intense',
    'avoidant_independent',
    'social_dominant',
    'impulsive_disorganized',
    'narcissistic_charming',
    'secure_balanced',
];

/**
 * Points awarded based on ranking position.
 * Position 1 (most preferred) = 3 pts, position 4 = 0 pts.
 * TODO: adjust point spread based on research calibration.
 */
const POSITION_POINTS: Record<number, number> = {
    1: 3,
    2: 2,
    3: 1,
    4: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function createEmptyScores(): ArchetypeScores {
    return ARCHETYPE_IDS.reduce<ArchetypeScores>((acc, id) => {
        acc[id] = 0;
        return acc;
    }, {} as ArchetypeScores);
}

// ─── Pulse Scoring (Phase 1 — Reactive Game) ──────────────────────────────────

/**
 * Computes archetype scores from scenario rankings (userPulse).
 *
 * Formula per character ranked:
 *   points = POSITION_POINTS[position] × character.impactWeight × scenario.contextMultiplier
 *
 * Weights are placeholders (1.0). TODO: tune based on research.
 */
export function computePulseScores(
    scenarioResults: ScenarioResult[],
    scenarios: Scenario[],
): ArchetypeScores {
    const scores = createEmptyScores();

    for (const result of scenarioResults) {
        const scenario = scenarios.find((s) => s.id === result.scenarioId);
        if (!scenario) continue;

        for (const ranking of result.rankings) {
            const character = scenario.characters.find((c) => c.id === ranking.characterId);
            if (!character) continue;

            const basePoints = POSITION_POINTS[ranking.position] ?? 0;
            const points = basePoints * character.impactWeight * scenario.contextMultiplier;
            scores[character.archetype] += points;
        }
    }

    return scores;
}

// ─── Ideal Scoring (Phase 3 — Declarative Survey) ────────────────────────────

/**
 * Computes archetype scores from survey answers (userIdeal).
 * Each answer option has associated archetype weights from the data layer.
 */
export function computeIdealScores(
    surveyAnswers: SurveyAnswer[],
    questions: SurveyQuestion[],
): ArchetypeScores {
    const scores = createEmptyScores();

    for (const answer of surveyAnswers) {
        const question = questions.find((q) => q.id === answer.questionId);
        if (!question) continue;

        const option = question.options.find((o) => o.id === answer.selectedOptionId);
        if (!option) continue;

        for (const [archetype, weight] of Object.entries(option.archetypeWeights)) {
            if (weight !== undefined) {
                scores[archetype as ArchetypeId] += weight;
            }
        }
    }

    return scores;
}

// ─── Ranking Utilities ────────────────────────────────────────────────────────

/**
 * Returns a full ranking array from a scenario result by filling in missing
 * positions (the last character auto-assigned position 4).
 */
export function buildFullRanking(
    partialRankings: CharacterRanking[],
    allCharacterIds: string[],
): CharacterRanking[] {
    const ranked = new Set(partialRankings.map((r) => r.characterId));
    const unranked = allCharacterIds.filter((id) => !ranked.has(id));

    const full = [...partialRankings];
    let nextPosition = partialRankings.length + 1;
    for (const id of unranked) {
        full.push({ characterId: id, position: nextPosition });
        nextPosition++;
    }

    return full;
}

// ─── Score Normalization (for Radar Chart) ────────────────────────────────────

/**
 * Returns the theoretical maximum pulse score per archetype,
 * based on how many scenarios feature that archetype.
 * Used to normalize the radar chart to a 0–100 scale.
 */
export function computeMaxPulseScore(
    archetype: ArchetypeId,
    scenarios: Scenario[],
): number {
    let maxScore = 0;
    for (const scenario of scenarios) {
        const hasArchetype = scenario.characters.some((c) => c.archetype === archetype);
        if (hasArchetype) {
            // Max points = rank 1 position points × max impact weight × max context multiplier
            maxScore += POSITION_POINTS[1] * 1.0 * 1.0;
        }
    }
    return maxScore;
}

/**
 * Normalizes a raw archetype score to a 0–100 percentage.
 * Uses a global max (not per-archetype) to keep the radar axes comparable.
 */
export function normalizeScores(
    scores: ArchetypeScores,
    maxValue: number,
): ArchetypeScores {
    if (maxValue === 0) return createEmptyScores();
    return ARCHETYPE_IDS.reduce<ArchetypeScores>((acc, id) => {
        acc[id] = Math.round((scores[id] / maxValue) * 100);
        return acc;
    }, {} as ArchetypeScores);
}
