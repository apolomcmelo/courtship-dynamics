import type { Scenario } from '../types';

/**
 * Retest scenario for Phase 6 (RETEST).
 *
 * Characters have INVERTED surface descriptions compared to the main scenarios:
 * the toxic archetypes are presented with appealing intellectual/artistic personas,
 * while the secure archetype is presented as casual and low-key.
 *
 * This tests whether the user has learned to read behavioral signals
 * rather than surface appearances.
 *
 * Archetype mapping (internal, never shown to user):
 *   A → narcissistic_charming  (appears as intellectual/deep)
 *   B → secure_balanced        (appears as casual/playful)
 *   C → avoidant_independent   (appears as mysterious/creative)
 *   D → anxious_intense        (appears as passionate/artistic)
 */
export const RETEST_SCENARIO: Scenario = {
    id: 'retest',
    order: 7,
    type: 'retest',
    context: 'digital',
    contextMultiplier: 1.0,
    titleKey: 'retestScenario.title',
    contextKey: 'retestScenario.context',
    situationKey: 'retestScenario.situation',
    promptKey: 'retestScenario.prompt',
    characters: [
        {
            id: 'retest_A',
            archetype: 'narcissistic_charming',
            impactWeight: 1.0,
            labelKey: 'retestScenario.characters.A.label',
            appearanceKey: 'retestScenario.characters.A.appearance',
            behaviorKey: 'retestScenario.characters.A.behavior',
            signalKey: 'retestScenario.characters.A.signal',
        },
        {
            id: 'retest_B',
            archetype: 'secure_balanced',
            impactWeight: 1.0,
            labelKey: 'retestScenario.characters.B.label',
            appearanceKey: 'retestScenario.characters.B.appearance',
            behaviorKey: 'retestScenario.characters.B.behavior',
            signalKey: 'retestScenario.characters.B.signal',
        },
        {
            id: 'retest_C',
            archetype: 'avoidant_independent',
            impactWeight: 1.0,
            labelKey: 'retestScenario.characters.C.label',
            appearanceKey: 'retestScenario.characters.C.appearance',
            behaviorKey: 'retestScenario.characters.C.behavior',
            signalKey: 'retestScenario.characters.C.signal',
        },
        {
            id: 'retest_D',
            archetype: 'anxious_intense',
            impactWeight: 1.0,
            labelKey: 'retestScenario.characters.D.label',
            appearanceKey: 'retestScenario.characters.D.appearance',
            behaviorKey: 'retestScenario.characters.D.behavior',
            signalKey: 'retestScenario.characters.D.signal',
        },
    ],
};
