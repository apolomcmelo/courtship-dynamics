import type { SurveyQuestion } from '../types';

/**
 * Declarative survey questions for Phase 3.
 *
 * Questions use metaphors and hypothetical scenarios — never obvious trait
 * comparisons. The goal is to capture the user's conscious idealization
 * without triggering socially-desirable response bias.
 *
 * Archetype weights are placeholders. TODO: validate through piloting.
 */
export const SURVEY_QUESTIONS: SurveyQuestion[] = [
    {
        id: 'sunday',
        textKey: 'survey.questions.sunday.text',
        options: [
            {
                id: 'sunday_A',
                textKey: 'survey.questions.sunday.options.A',
                archetypeWeights: { narcissistic_charming: 2, adventurous_charismatic: 1 },
            },
            {
                id: 'sunday_B',
                textKey: 'survey.questions.sunday.options.B',
                archetypeWeights: { consistent_reliable: 2, secure_balanced: 1 },
            },
            {
                id: 'sunday_C',
                textKey: 'survey.questions.sunday.options.C',
                archetypeWeights: { adventurous_charismatic: 2, impulsive_disorganized: 1 },
            },
            {
                id: 'sunday_D',
                textKey: 'survey.questions.sunday.options.D',
                archetypeWeights: { secure_balanced: 2, consistent_reliable: 1 },
            },
        ],
    },
    {
        id: 'conflict',
        textKey: 'survey.questions.conflict.text',
        options: [
            {
                id: 'conflict_A',
                textKey: 'survey.questions.conflict.options.A',
                archetypeWeights: { secure_balanced: 2, consistent_reliable: 1 },
            },
            {
                id: 'conflict_B',
                textKey: 'survey.questions.conflict.options.B',
                archetypeWeights: { avoidant_independent: 3 },
            },
            {
                id: 'conflict_C',
                textKey: 'survey.questions.conflict.options.C',
                archetypeWeights: { narcissistic_charming: 1, anxious_intense: 2 },
            },
            {
                id: 'conflict_D',
                textKey: 'survey.questions.conflict.options.D',
                archetypeWeights: { anxious_intense: 3 },
            },
        ],
    },
    {
        id: 'busyWeek',
        textKey: 'survey.questions.busyWeek.text',
        options: [
            {
                id: 'busyWeek_A',
                textKey: 'survey.questions.busyWeek.options.A',
                archetypeWeights: { consistent_reliable: 3 },
            },
            {
                id: 'busyWeek_B',
                textKey: 'survey.questions.busyWeek.options.B',
                archetypeWeights: { adventurous_charismatic: 2, narcissistic_charming: 1 },
            },
            {
                id: 'busyWeek_C',
                textKey: 'survey.questions.busyWeek.options.C',
                archetypeWeights: { secure_balanced: 2, consistent_reliable: 1 },
            },
            {
                id: 'busyWeek_D',
                textKey: 'survey.questions.busyWeek.options.D',
                archetypeWeights: { avoidant_independent: 3 },
            },
        ],
    },
    {
        id: 'metaphor',
        textKey: 'survey.questions.metaphor.text',
        options: [
            {
                id: 'metaphor_A',
                textKey: 'survey.questions.metaphor.options.A',
                archetypeWeights: { adventurous_charismatic: 2, narcissistic_charming: 1 },
            },
            {
                id: 'metaphor_B',
                textKey: 'survey.questions.metaphor.options.B',
                archetypeWeights: { secure_balanced: 3 },
            },
            {
                id: 'metaphor_C',
                textKey: 'survey.questions.metaphor.options.C',
                archetypeWeights: { anxious_intense: 2, narcissistic_charming: 1 },
            },
            {
                id: 'metaphor_D',
                textKey: 'survey.questions.metaphor.options.D',
                archetypeWeights: { consistent_reliable: 2, secure_balanced: 1 },
            },
        ],
    },
    {
        id: 'absence',
        textKey: 'survey.questions.absence.text',
        options: [
            {
                id: 'absence_A',
                textKey: 'survey.questions.absence.options.A',
                archetypeWeights: { anxious_intense: 3 },
            },
            {
                id: 'absence_B',
                textKey: 'survey.questions.absence.options.B',
                archetypeWeights: { avoidant_independent: 3 },
            },
            {
                id: 'absence_C',
                textKey: 'survey.questions.absence.options.C',
                archetypeWeights: { adventurous_charismatic: 2, social_dominant: 1 },
            },
            {
                id: 'absence_D',
                textKey: 'survey.questions.absence.options.D',
                archetypeWeights: { consistent_reliable: 2, secure_balanced: 1 },
            },
        ],
    },
    {
        id: 'decision',
        textKey: 'survey.questions.decision.text',
        options: [
            {
                id: 'decision_A',
                textKey: 'survey.questions.decision.options.A',
                archetypeWeights: { social_dominant: 2, narcissistic_charming: 1 },
            },
            {
                id: 'decision_B',
                textKey: 'survey.questions.decision.options.B',
                archetypeWeights: { secure_balanced: 3 },
            },
            {
                id: 'decision_C',
                textKey: 'survey.questions.decision.options.C',
                archetypeWeights: { avoidant_independent: 2 },
            },
            {
                id: 'decision_D',
                textKey: 'survey.questions.decision.options.D',
                archetypeWeights: { adventurous_charismatic: 2, impulsive_disorganized: 1 },
            },
        ],
    },
];
