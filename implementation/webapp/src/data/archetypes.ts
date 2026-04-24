import type { ArchetypeId } from '../types';

export interface ArchetypeDefinition {
    id: ArchetypeId;
    /** i18n key for the display name */
    nameKey: string;
    /** i18n key for the description */
    descriptionKey: string;
    /** i18n key for the short relational outcome summary */
    shortOutcomeKey: string;
    /** Tailwind gradient classes for visual representation */
    gradientClass: string;
    /** Hex color for Chart.js */
    chartColor: string;
}

export const ARCHETYPES: ArchetypeDefinition[] = [
    {
        id: 'adventurous_charismatic',
        nameKey: 'archetypes.adventurous_charismatic.name',
        descriptionKey: 'archetypes.adventurous_charismatic.description',
        shortOutcomeKey: 'archetypes.adventurous_charismatic.shortOutcome',
        gradientClass: 'from-amber-500 to-orange-600',
        chartColor: '#f59e0b',
    },
    {
        id: 'consistent_reliable',
        nameKey: 'archetypes.consistent_reliable.name',
        descriptionKey: 'archetypes.consistent_reliable.description',
        shortOutcomeKey: 'archetypes.consistent_reliable.shortOutcome',
        gradientClass: 'from-sky-500 to-blue-600',
        chartColor: '#0ea5e9',
    },
    {
        id: 'anxious_intense',
        nameKey: 'archetypes.anxious_intense.name',
        descriptionKey: 'archetypes.anxious_intense.description',
        shortOutcomeKey: 'archetypes.anxious_intense.shortOutcome',
        gradientClass: 'from-red-500 to-rose-600',
        chartColor: '#ef4444',
    },
    {
        id: 'avoidant_independent',
        nameKey: 'archetypes.avoidant_independent.name',
        descriptionKey: 'archetypes.avoidant_independent.description',
        shortOutcomeKey: 'archetypes.avoidant_independent.shortOutcome',
        gradientClass: 'from-slate-500 to-zinc-600',
        chartColor: '#64748b',
    },
    {
        id: 'social_dominant',
        nameKey: 'archetypes.social_dominant.name',
        descriptionKey: 'archetypes.social_dominant.description',
        shortOutcomeKey: 'archetypes.social_dominant.shortOutcome',
        gradientClass: 'from-violet-500 to-purple-600',
        chartColor: '#8b5cf6',
    },
    {
        id: 'impulsive_disorganized',
        nameKey: 'archetypes.impulsive_disorganized.name',
        descriptionKey: 'archetypes.impulsive_disorganized.description',
        shortOutcomeKey: 'archetypes.impulsive_disorganized.shortOutcome',
        gradientClass: 'from-orange-500 to-red-500',
        chartColor: '#f97316',
    },
    {
        id: 'narcissistic_charming',
        nameKey: 'archetypes.narcissistic_charming.name',
        descriptionKey: 'archetypes.narcissistic_charming.description',
        shortOutcomeKey: 'archetypes.narcissistic_charming.shortOutcome',
        gradientClass: 'from-fuchsia-500 to-pink-600',
        chartColor: '#d946ef',
    },
    {
        id: 'secure_balanced',
        nameKey: 'archetypes.secure_balanced.name',
        descriptionKey: 'archetypes.secure_balanced.description',
        shortOutcomeKey: 'archetypes.secure_balanced.shortOutcome',
        gradientClass: 'from-emerald-500 to-teal-600',
        chartColor: '#10b981',
    },
];

export function getArchetype(id: ArchetypeId): ArchetypeDefinition {
    const found = ARCHETYPES.find((a) => a.id === id);
    if (!found) throw new Error(`Unknown archetype: ${id}`);
    return found;
}
