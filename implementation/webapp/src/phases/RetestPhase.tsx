import { useState } from 'react';
import { useTranslation } from '../i18n';
import { RETEST_SCENARIO } from '../data/retestScenario';
import { CharacterCard } from '../components/CharacterCard';
import { Button } from '../components/Button';
import { PhaseHeader } from '../components/PhaseHeader';
import type { AppState, CharacterRanking, RetestOutcome } from '../types';
import { evaluateRetestOutcome } from '../engine/diagnostics';
import { getTopArchetypes } from '../engine/diagnostics';

type RetestStep = 'reflection' | 'scenario' | 'outcome';

interface RetestPhaseProps {
    state: AppState;
    onSubmitRetestRanking: (rankings: CharacterRanking[]) => void;
    onFinish: () => void;
}

export function RetestPhase({ state, onSubmitRetestRanking, onFinish }: RetestPhaseProps) {
    const { t } = useTranslation();
    const [step, setStep] = useState<RetestStep>('reflection');
    const [explanation, setExplanation] = useState('');
    const [prediction, setPrediction] = useState('');
    const [rankedIds, setRankedIds] = useState<string[]>([]);
    const [outcome, setOutcome] = useState<RetestOutcome | null>(null);

    const scenario = RETEST_SCENARIO;
    const totalCharacters = scenario.characters.length;
    const allRanked = rankedIds.length === totalCharacters;

    function handleCharacterClick(characterId: string) {
        const existingIndex = rankedIds.indexOf(characterId);
        if (existingIndex !== -1) {
            setRankedIds((prev) => prev.slice(0, existingIndex));
        } else if (rankedIds.length < totalCharacters) {
            setRankedIds((prev) => [...prev, characterId]);
        }
    }

    function handleSubmitRanking() {
        const rankings: CharacterRanking[] = rankedIds.map((id, index) => ({
            characterId: id,
            position: index + 1,
        }));

        onSubmitRetestRanking(rankings);

        const pulseTop = getTopArchetypes(state.userPulse, 1);
        const result = evaluateRetestOutcome(
            { scenarioId: 'retest', rankings, responseTimeMs: 0 },
            scenario,
            pulseTop[0],
        );
        setOutcome(result);
        setStep('outcome');
    }

    // ─── Reflection step ───────────────────────────────────────────────────────

    if (step === 'reflection') {
        return (
            <div className="min-h-screen flex flex-col">
                <div className="flex-1 max-w-xl mx-auto w-full px-4 py-8 space-y-8 animate-slide-up">
                    <PhaseHeader
                        title={t('phases.retest.title')}
                        badge="Validação Final"
                    />

                    <div className="glass-card p-6 space-y-6">
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-slate-200">
                                {t('phases.retest.explanationPrompt')}
                            </label>
                            <textarea
                                value={explanation}
                                onChange={(e) => setExplanation(e.target.value)}
                                placeholder={t('phases.retest.explanationPlaceholder')}
                                rows={4}
                                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none leading-relaxed"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-slate-200">
                                {t('phases.retest.predictionPrompt')}
                            </label>
                            <textarea
                                value={prediction}
                                onChange={(e) => setPrediction(e.target.value)}
                                placeholder={t('phases.retest.predictionPlaceholder')}
                                rows={4}
                                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none leading-relaxed"
                            />
                        </div>
                    </div>

                    <Button
                        size="lg"
                        fullWidth
                        onClick={() => setStep('scenario')}
                    >
                        {t('phases.retest.continueToScenario')}
                    </Button>
                </div>
            </div>
        );
    }

    // ─── Retest scenario step ──────────────────────────────────────────────────

    if (step === 'scenario') {
        return (
            <div className="min-h-screen flex flex-col">
                <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-6 animate-slide-up">
                    {/* Context intro */}
                    <div className="rounded-2xl border border-violet-700/30 bg-gradient-to-b from-violet-900/30 to-slate-900/0 p-5 space-y-2">
                        <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
                            {t('phases.retest.newScenarioTitle')}
                        </span>
                        <h2 className="text-lg font-bold text-slate-100">{t(scenario.titleKey)}</h2>
                        <p className="text-sm text-slate-400 leading-relaxed">{t(scenario.contextKey)}</p>
                        <p className="text-sm text-slate-300 font-medium">{t(scenario.situationKey)}</p>
                    </div>

                    <div className="rounded-xl bg-slate-900/50 border border-slate-800/60 px-4 py-3">
                        <p className="text-sm text-slate-300 leading-relaxed">{t(scenario.promptKey)}</p>
                    </div>

                    {/* Ranking status */}
                    {rankedIds.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-slate-500 font-medium">
                                {t('common.yourRanking')}:
                            </span>
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
                            return (
                                <CharacterCard
                                    key={character.id}
                                    character={character}
                                    scenarioType={scenario.type}
                                    rankPosition={rankPosition}
                                    onClick={() => handleCharacterClick(character.id)}
                                    isDisabled={allRanked}
                                />
                            );
                        })}
                    </div>

                    <div className="pb-6">
                        {!allRanked && (
                            <p className="text-center text-xs text-slate-600 mb-3">
                                {t('common.selectAll')} ({rankedIds.length}/{totalCharacters})
                            </p>
                        )}
                        <Button size="lg" fullWidth disabled={!allRanked} onClick={handleSubmitRanking}>
                            {t('common.submitRanking')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Outcome step ──────────────────────────────────────────────────────────

    const isLearned = outcome === 'learned';

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 max-w-xl mx-auto w-full px-4 py-8 space-y-8 animate-slide-up">
                <div className="text-center space-y-2">
                    <div className="text-5xl">{isLearned ? '✦' : '◈'}</div>
                </div>

                <div
                    className={`glass-card p-6 space-y-4 border ${isLearned ? 'border-emerald-700/40' : 'border-slate-700/40'
                        }`}
                >
                    <h2
                        className={`text-xl font-bold ${isLearned ? 'text-emerald-400' : 'text-slate-300'
                            }`}
                    >
                        {isLearned
                            ? t('phases.retest.learnedTitle')
                            : t('phases.retest.repeatedTitle')}
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        {isLearned
                            ? t('phases.retest.learnedBody')
                            : t('phases.retest.repeatedBody')}
                    </p>
                </div>

                {/* User's own reflections */}
                {(explanation || prediction) && (
                    <div className="glass-card p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                            {t('phases.retest.reflectionTitle')}
                        </h3>
                        {explanation && (
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500">{t('phases.retest.explanationPrompt')}</p>
                                <p className="text-sm text-slate-300 italic leading-relaxed">"{explanation}"</p>
                            </div>
                        )}
                        {prediction && (
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500">{t('phases.retest.predictionPrompt')}</p>
                                <p className="text-sm text-slate-300 italic leading-relaxed">"{prediction}"</p>
                            </div>
                        )}
                    </div>
                )}

                <Button size="lg" fullWidth onClick={onFinish}>
                    {t('phases.retest.finish')}
                </Button>
            </div>
        </div>
    );
}
