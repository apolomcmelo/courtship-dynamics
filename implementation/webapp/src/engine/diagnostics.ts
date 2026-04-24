import type {
    ArchetypeId,
    ArchetypeScores,
    ConsequenceType,
    DiagnosticResult,
    RetestOutcome,
    ScenarioResult,
} from '../types';
import { ARCHETYPE_IDS } from './scoring';
import type { Scenario } from '../types';

// ─── Top N ────────────────────────────────────────────────────────────────────

/**
 * Returns the top N archetype IDs sorted by score descending.
 * Ties are broken by the stable order in ARCHETYPE_IDS.
 */
export function getTopArchetypes(scores: ArchetypeScores, n: number): ArchetypeId[] {
    return [...ARCHETYPE_IDS]
        .filter((id) => scores[id] > 0)
        .sort((a, b) => scores[b] - scores[a])
        .slice(0, n);
}

// ─── Dissonance Detection ─────────────────────────────────────────────────────

/**
 * Detects "Attraction Dissonance" — the gap between what the user
 * instinctively chose and what they say they value.
 *
 * Trigger condition (placeholder thresholds — TODO: validate with data):
 *   userPulse.narcissistic_charming > 2  AND  userIdeal.secure_balanced > 4
 *
 * This reflects the pattern where a user repeatedly chose narcissistic
 * profiles reactively while also declaring a preference for security.
 */
export function detectDissonance(pulse: ArchetypeScores, ideal: ArchetypeScores): boolean {
    return pulse.narcissistic_charming > 2 && ideal.secure_balanced > 4;
}

// ─── Consequence Type ─────────────────────────────────────────────────────────

/**
 * Maps the top archetype scores to a consequence narrative type.
 *
 * Rules (evaluated in priority order):
 * 1. anxiety_dopamine_cycle  — narcissistic_charming in pulse top 3
 *                              AND (anxious_intense OR impulsive_disorganized) in pulse top 3
 * 2. stability_readiness     — secure_balanced is the #1 pulse score
 *                              AND consistent_reliable is in ideal top 3
 * 3. avoidance_pattern       — avoidant_independent in pulse top 3
 * 4. mixed_attraction        — default fallback
 *
 * TODO: Refine rules based on research findings.
 */
export function getConsequenceType(
    pulse: ArchetypeScores,
    ideal: ArchetypeScores,
): ConsequenceType {
    const pulseTop3 = getTopArchetypes(pulse, 3);
    const idealTop3 = getTopArchetypes(ideal, 3);

    const hasNarcissistic = pulseTop3.includes('narcissistic_charming');
    const hasAnxiousOrImpulsive =
        pulseTop3.includes('anxious_intense') || pulseTop3.includes('impulsive_disorganized');

    if (hasNarcissistic && hasAnxiousOrImpulsive) {
        return 'anxiety_dopamine_cycle';
    }

    const pulseTop1 = pulseTop3[0];
    const idealHasConsistent = idealTop3.includes('consistent_reliable');

    if (pulseTop1 === 'secure_balanced' && idealHasConsistent) {
        return 'stability_readiness';
    }

    if (pulseTop3.includes('avoidant_independent')) {
        return 'avoidance_pattern';
    }

    return 'mixed_attraction';
}

// ─── Full Diagnostic ──────────────────────────────────────────────────────────

export function computeDiagnostic(
    pulse: ArchetypeScores,
    ideal: ArchetypeScores,
): DiagnosticResult {
    return {
        pulseTop3: getTopArchetypes(pulse, 3),
        idealTop3: getTopArchetypes(ideal, 3),
        hasDissonance: detectDissonance(pulse, ideal),
        consequenceType: getConsequenceType(pulse, ideal),
    };
}

// ─── Retest Outcome ───────────────────────────────────────────────────────────

/**
 * Compares retest rankings to the original pulse pattern to determine
 * if the user demonstrated behavioral learning.
 *
 * Learning criteria:
 *   - The character ranked #1 in the retest is the secure_balanced archetype.
 *
 * Repeated pattern criteria:
 *   - The character ranked #1 in the retest matches the top archetype from the original pulse.
 *
 * The retest scenario must be provided to resolve character → archetype mappings.
 */
export function evaluateRetestOutcome(
    retestResult: ScenarioResult,
    retestScenario: Scenario,
    originalPulseTop1: ArchetypeId | undefined,
): RetestOutcome {
    const firstChoice = retestResult.rankings.find((r) => r.position === 1);
    if (!firstChoice) return 'repeated_pattern';

    const chosenCharacter = retestScenario.characters.find(
        (c) => c.id === firstChoice.characterId,
    );
    if (!chosenCharacter) return 'repeated_pattern';

    if (chosenCharacter.archetype === 'secure_balanced') {
        return 'learned';
    }

    if (originalPulseTop1 && chosenCharacter.archetype === originalPulseTop1) {
        return 'repeated_pattern';
    }

    // Chose something different from both secure and their original top — partial shift,
    // still classified as repeated pattern for conservative reporting.
    return 'repeated_pattern';
}
