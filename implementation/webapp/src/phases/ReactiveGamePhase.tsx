import { useState } from 'react';
import { useTranslation } from '../i18n';
import { SCENARIOS } from '../data/scenarios';
import { CharacterCard } from '../components/CharacterCard';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import type { AppState, CharacterRanking } from '../types';

interface ReactiveGamePhaseProps {
    state: AppState;
    onSubmitRanking: (rankings: CharacterRanking[]) => void;
}

// Per-scenario-type accent colors for the context header
const SCENARIO_ACCENTS: Record<string, string> = {
    bar: 'from-amber-900/40 to-slate-900/0 border-amber-700/20',
    instagram: 'from-pink-900/30 to-slate-900/0 border-pink-700/20',
    dating_app: 'from-rose-900/30 to-slate-900/0 border-rose-700/20',
    first_date: 'from-emerald-900/30 to-slate-900/0 border-emerald-700/20',
    communication: 'from-blue-900/30 to-slate-900/0 border-blue-700/20',
    friction: 'from-red-900/30 to-slate-900/0 border-red-700/20',
};

export function ReactiveGamePhase({ state, onSubmitRanking }: ReactiveGamePhaseProps) {
    const { t } = useTranslation();
    const scenario = SCENARIOS[state.currentScenarioIndex];

    // Rankings: ordered list of character IDs (index 0 = 1st choice)
    const [rankedIds, setRankedIds] = useState<string[]>([]);

    const totalCharacters = scenario.characters.length;
    const allRanked = rankedIds.length === totalCharacters;

    function handleCharacterClick(characterId: string) {
        const existingIndex = rankedIds.indexOf(characterId);

        if (existingIndex !== -1) {
            // Remove this character and all after it (reset from this point)
            setRankedIds((prev) => prev.slice(0, existingIndex));
        } else if (rankedIds.length < totalCharacters) {
            setRankedIds((prev) => [...prev, characterId]);
        }
    }

    function handleSubmit() {
        const rankings: CharacterRanking[] = rankedIds.map((id, index) => ({
            characterId: id,
            position: index + 1,
        }));
        onSubmitRanking(rankings);
        setRankedIds([]);
    }

    const accentClass =
        SCENARIO_ACCENTS[scenario.type] ?? 'from-slate-800/40 to-slate-900/0 border-slate-700/20';

    return (
        <div className="min-h-screen flex flex-col">
            {/* Top bar */}
            <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800/60 px-4 py-3">
                <div className="max-w-2xl mx-auto space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {t('phases.reactiveGame.title')}
                        </span>
                        <span className="text-xs text-slate-500">
                            {t('common.scenarioProgress', {
                                current: state.currentScenarioIndex + 1,
                                total: SCENARIOS.length,
                            })}
                        </span>
                    </div>
                    <ProgressBar
                        current={state.currentScenarioIndex + (allRanked ? 1 : 0)}
                        total={SCENARIOS.length}
                    />
                </div>
            </div>

            <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-6 animate-slide-up">
                {/* Scenario context */}
                <div
                    className={`rounded-2xl border bg-gradient-to-b ${accentClass} p-5 space-y-2`}
                >
                    <h2 className="text-lg font-bold text-slate-100">{t(scenario.titleKey)}</h2>
                    <p className="text-sm text-slate-400 leading-relaxed">{t(scenario.contextKey)}</p>
                    <p className="text-sm text-slate-300 font-medium">{t(scenario.situationKey)}</p>
                </div>

                {/* Instruction */}
                <div className="rounded-xl bg-slate-900/50 border border-slate-800/60 px-4 py-3">
                    <p className="text-sm text-slate-300 leading-relaxed">{t(scenario.promptKey)}</p>
                </div>

                {/* Ranking status */}
                {rankedIds.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-500 font-medium">{t('common.yourRanking')}:</span>
                        {rankedIds.map((id, index) => {
                            const character = scenario.characters.find((c) => c.id === id);
                            const letter = id.split('_').pop()?.toUpperCase() ?? '';
                            return (
                                <span
                                    key={id}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-900/40 border border-violet-700/40 text-xs text-violet-300 font-medium"
                                >
                                    <span className="text-violet-400 font-bold">{index + 1}º</span>
                                    {character ? t(character.labelKey) : letter}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Character cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {scenario.characters.map((character) => {
                        const rankIndex = rankedIds.indexOf(character.id);
                        const rankPosition = rankIndex !== -1 ? rankIndex + 1 : null;
                        const isDisabled = allRanked;

                        return (
                            <CharacterCard
                                key={character.id}
                                character={character}
                                scenarioType={scenario.type}
                                rankPosition={rankPosition}
                                onClick={() => handleCharacterClick(character.id)}
                                isDisabled={isDisabled}
                            />
                        );
                    })}
                </div>

                {/* Submit */}
                <div className="pb-6">
                    {!allRanked && (
                        <p className="text-center text-xs text-slate-600 mb-3">
                            {t('common.selectAll')} ({rankedIds.length}/{totalCharacters})
                        </p>
                    )}
                    <Button size="lg" fullWidth disabled={!allRanked} onClick={handleSubmit}>
                        {t('common.submitRanking')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
