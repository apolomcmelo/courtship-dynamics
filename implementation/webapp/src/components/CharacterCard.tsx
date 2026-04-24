import { useTranslation } from '../i18n';
import type { ScenarioCharacter, ScenarioType } from '../types';

// Character letter → visual color gradient
const CHARACTER_COLORS: Record<string, string> = {
    A: 'from-amber-400 to-orange-500',
    B: 'from-emerald-400 to-teal-500',
    C: 'from-violet-400 to-purple-500',
    D: 'from-rose-400 to-pink-500',
};

// Per-scenario-type labels for the "extra" field
const EXTRA_FIELD_LABELS: Partial<Record<ScenarioType, string>> = {
    instagram: 'phases.reactiveGame.patternLabel',
    dating_app: 'phases.reactiveGame.bioLabel',
    first_date: 'phases.reactiveGame.dynamicLabel',
    communication: 'phases.reactiveGame.patternLabel',
    friction: 'phases.reactiveGame.dynamicLabel',
    retest: 'phases.reactiveGame.patternLabel',
};

interface CharacterCardProps {
    character: ScenarioCharacter;
    scenarioType: ScenarioType;
    rankPosition: number | null;
    onClick: () => void;
    isDisabled: boolean;
}

export function CharacterCard({
    character,
    scenarioType,
    rankPosition,
    onClick,
    isDisabled,
}: CharacterCardProps) {
    const { t } = useTranslation();

    // Extract letter from the last character of the character id (e.g. "bar_A" → "A")
    const letter = character.id.split('_').pop()?.toUpperCase() ?? 'A';
    const gradientClass = CHARACTER_COLORS[letter] ?? CHARACTER_COLORS['A'];

    const isRanked = rankPosition !== null;
    const extraLabelKey = EXTRA_FIELD_LABELS[scenarioType];

    return (
        <button
            onClick={onClick}
            disabled={isDisabled && !isRanked}
            aria-label={`${t(character.labelKey)} — ${isRanked ? `${rankPosition}º lugar` : 'selecionar'}`}
            className={[
                'relative w-full text-left rounded-2xl border transition-all duration-200 p-4 sm:p-5',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
                isRanked
                    ? 'border-violet-500/60 bg-slate-800/90 shadow-lg shadow-violet-900/20'
                    : 'border-slate-700/50 bg-slate-900/80 hover:border-slate-500/70 hover:bg-slate-800/80',
                isDisabled && !isRanked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {/* Rank badge */}
            {isRanked && (
                <span className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white text-xs font-bold shadow-md">
                    {rankPosition}
                </span>
            )}

            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                    className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold text-lg shadow-md`}
                >
                    {letter}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Signal — most prominent */}
                    <p className="text-sm font-semibold text-slate-200 leading-snug">
                        {t(character.signalKey)}
                    </p>

                    {/* Appearance */}
                    <div>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {t('phases.reactiveGame.appearanceLabel')}
                        </span>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                            {t(character.appearanceKey)}
                        </p>
                    </div>

                    {/* Behavior */}
                    <div>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {t('phases.reactiveGame.behaviorLabel')}
                        </span>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                            {t(character.behaviorKey)}
                        </p>
                    </div>

                    {/* Extra field (pattern, bio, dynamic, etc.) */}
                    {character.extraKey && extraLabelKey && (
                        <div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                {t(extraLabelKey)}
                            </span>
                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                {t(character.extraKey)}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
}
