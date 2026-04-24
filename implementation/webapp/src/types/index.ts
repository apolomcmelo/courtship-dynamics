// ─── Archetype System ────────────────────────────────────────────────────────

export type ArchetypeId =
    | 'adventurous_charismatic'
    | 'consistent_reliable'
    | 'anxious_intense'
    | 'avoidant_independent'
    | 'social_dominant'
    | 'impulsive_disorganized'
    | 'narcissistic_charming'
    | 'secure_balanced';

export type ArchetypeScores = Record<ArchetypeId, number>;

// ─── Scenario Types ───────────────────────────────────────────────────────────

export type ScenarioType =
    | 'bar'
    | 'instagram'
    | 'dating_app'
    | 'first_date'
    | 'communication'
    | 'friction'
    | 'retest';

export type ScenarioContext = 'social' | 'digital' | 'in_person';

export interface ScenarioCharacter {
    id: string;
    archetype: ArchetypeId;
    /** Multiplier for points gained from this character. Placeholder: 1.0. TODO: tune per research. */
    impactWeight: number;
    // i18n keys for all user-facing text
    labelKey: string;
    appearanceKey: string;
    behaviorKey: string;
    signalKey: string;
    /** Optional extra field shown in certain scenario types (bio, pattern, etc.) */
    extraKey?: string;
}

export interface Scenario {
    id: string;
    order: number;
    type: ScenarioType;
    context: ScenarioContext;
    /** Multiplier applied to all scores in this context. Placeholder: 1.0. TODO: tune per research. */
    contextMultiplier: number;
    // i18n keys
    titleKey: string;
    contextKey: string;
    situationKey: string;
    promptKey: string;
    characters: ScenarioCharacter[];
}

// ─── User Input Types ─────────────────────────────────────────────────────────

export interface CharacterRanking {
    characterId: string;
    /** 1 = most preferred, 4 = least preferred */
    position: number;
}

export interface ScenarioResult {
    scenarioId: string;
    rankings: CharacterRanking[];
    responseTimeMs: number;
}

// ─── Survey Types ─────────────────────────────────────────────────────────────

export interface SurveyOption {
    id: string;
    textKey: string;
    archetypeWeights: Partial<ArchetypeScores>;
}

export interface SurveyQuestion {
    id: string;
    textKey: string;
    options: SurveyOption[];
}

export interface SurveyAnswer {
    questionId: string;
    selectedOptionId: string;
}

// ─── App State Machine ────────────────────────────────────────────────────────

export type AppPhase =
    | 'INTRO'
    | 'REACTIVE_GAME'
    | 'DECLARATIVE_SURVEY'
    | 'DIAGNOSTIC_MIRROR'
    | 'RETEST';

export interface AppState {
    phase: AppPhase;
    currentScenarioIndex: number;
    scenarioResults: ScenarioResult[];
    currentSurveyIndex: number;
    surveyAnswers: SurveyAnswer[];
    userPulse: ArchetypeScores;
    userIdeal: ArchetypeScores;
    retestResult: ScenarioResult | null;
    sessionStartedAt: number;
    /** Timestamp of when the current scenario or question was shown, used for response time tracking */
    currentItemStartedAt: number;
}

export type AppAction =
    | { type: 'START_GAME' }
    | {
        type: 'SUBMIT_SCENARIO_RANKING';
        payload: { scenarioId: string; rankings: CharacterRanking[]; responseTimeMs: number };
    }
    | { type: 'SUBMIT_SURVEY_ANSWER'; payload: SurveyAnswer }
    | { type: 'GO_TO_RETEST' }
    | { type: 'SKIP_RETEST' }
    | {
        type: 'SUBMIT_RETEST_RANKING';
        payload: { rankings: CharacterRanking[]; responseTimeMs: number };
    };

// ─── Diagnostic Types ─────────────────────────────────────────────────────────

export type ConsequenceType =
    | 'anxiety_dopamine_cycle'
    | 'stability_readiness'
    | 'avoidance_pattern'
    | 'mixed_attraction';

export type RetestOutcome = 'learned' | 'repeated_pattern';

export interface DiagnosticResult {
    pulseTop3: ArchetypeId[];
    idealTop3: ArchetypeId[];
    /** True when reactive narcissistic scores are high while ideal security scores are also high */
    hasDissonance: boolean;
    consequenceType: ConsequenceType;
}
