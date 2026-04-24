import { useTranslation } from '../i18n';
import { RadarChart } from '../components/RadarChart';
import { Button } from '../components/Button';
import { PhaseHeader } from '../components/PhaseHeader';
import type { AppState, ArchetypeId } from '../types';
import { computeDiagnostic } from '../engine/diagnostics';
import { ARCHETYPES } from '../data/archetypes';

interface DiagnosticMirrorPhaseProps {
    state: AppState;
    onGoToRetest: () => void;
    onSkipRetest: () => void;
    onOpenResearch?: () => void;
}

function ArchetypeChip({ archetypeId }: { archetypeId: ArchetypeId }) {
    const { t } = useTranslation();
    const archetype = ARCHETYPES.find((a) => a.id === archetypeId);
    if (!archetype) return null;

    return (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-3 space-y-1">
            <div
                className={`w-6 h-1 rounded-full bg-gradient-to-r ${archetype.gradientClass}`}
            />
            <p className="text-sm font-semibold text-slate-200">{t(archetype.nameKey)}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{t(archetype.shortOutcomeKey)}</p>
        </div>
    );
}

export function DiagnosticMirrorPhase({
    state,
    onGoToRetest,
    onSkipRetest,
    onOpenResearch,
}: DiagnosticMirrorPhaseProps) {
    const { t } = useTranslation();
    const diagnostic = computeDiagnostic(state.userPulse, state.userIdeal);
    const { consequenceType } = diagnostic;

    const consequenceBase = `diagnostic.consequences.${consequenceType}`;

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-8 animate-slide-up">
                <PhaseHeader
                    title={t('phases.diagnosticMirror.title')}
                    subtitle={t('phases.diagnosticMirror.subtitle')}
                    badge="Diagnóstico"
                />

                {/* Radar chart */}
                <div className="glass-card p-6 space-y-4">
                    <RadarChart pulseScores={state.userPulse} idealScores={state.userIdeal} />
                    <div className="flex items-center justify-center gap-6 pt-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-0.5 bg-blue-400 rounded" />
                            <span className="text-xs text-slate-400">
                                {t('phases.diagnosticMirror.pulseLabel')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-6 h-0.5 rounded"
                                style={{
                                    background:
                                        'repeating-linear-gradient(90deg, #8b5cf6 0, #8b5cf6 4px, transparent 4px, transparent 8px)',
                                }}
                            />
                            <span className="text-xs text-slate-400">
                                {t('phases.diagnosticMirror.idealLabel')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Dissonance alert */}
                {diagnostic.hasDissonance && (
                    <div className="rounded-xl border border-amber-700/40 bg-amber-900/20 p-4 space-y-1">
                        <p className="text-sm font-semibold text-amber-400">
                            ⚡ {t('phases.diagnosticMirror.dissonanceTitle')}
                        </p>
                        <p className="text-sm text-amber-200/70 leading-relaxed">
                            {t('phases.diagnosticMirror.dissonanceBody')}
                        </p>
                    </div>
                )}

                {/* Top attractions */}
                {diagnostic.pulseTop3.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                            {t('phases.diagnosticMirror.topAttractionsTitle')}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {diagnostic.pulseTop3.map((id) => (
                                <ArchetypeChip key={id} archetypeId={id} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Top ideals */}
                {diagnostic.idealTop3.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                            {t('phases.diagnosticMirror.topIdealsTitle')}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {diagnostic.idealTop3.map((id) => (
                                <ArchetypeChip key={id} archetypeId={id} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Consequence text */}
                <div className="glass-card p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                        {t('phases.diagnosticMirror.consequencesTitle')}
                    </h3>
                    <p className="text-lg font-bold gradient-text">
                        {t(`${consequenceBase}.title`)}
                    </p>
                    <p className="text-sm font-medium text-slate-300 leading-relaxed">
                        {t(`${consequenceBase}.summary`)}
                    </p>
                    <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
                        {t(`${consequenceBase}.body`)}
                    </p>
                </div>

                {/* CTA */}
                <div className="space-y-3 pb-8">
                    <Button size="lg" fullWidth onClick={onGoToRetest}>
                        {t('phases.diagnosticMirror.continueToValidation')}
                    </Button>
                    <Button variant="ghost" size="md" fullWidth onClick={onSkipRetest}>
                        {t('phases.diagnosticMirror.skipValidation')}
                    </Button>
                    {onOpenResearch && (
                        <button
                            onClick={onOpenResearch}
                            className="text-xs text-slate-500 hover:text-blue-400 transition-colors w-full text-center pt-1"
                        >
                            {t('research.scienceLink')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
