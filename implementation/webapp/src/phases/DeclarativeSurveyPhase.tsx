import { useTranslation } from '../i18n';
import { SURVEY_QUESTIONS } from '../data/surveyQuestions';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { PhaseHeader } from '../components/PhaseHeader';
import type { AppState, SurveyAnswer } from '../types';

interface DeclarativeSurveyPhaseProps {
    state: AppState;
    onSubmitAnswer: (answer: SurveyAnswer) => void;
}

export function DeclarativeSurveyPhase({ state, onSubmitAnswer }: DeclarativeSurveyPhaseProps) {
    const { t } = useTranslation();
    const question = SURVEY_QUESTIONS[state.currentSurveyIndex];

    function handleOptionSelect(optionId: string) {
        onSubmitAnswer({
            questionId: question.id,
            selectedOptionId: optionId,
        });
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Top bar */}
            <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800/60 px-4 py-3">
                <div className="max-w-xl mx-auto space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {t('phases.declarativeSurvey.title')}
                        </span>
                        <span className="text-xs text-slate-500">
                            {t('common.questionProgress', {
                                current: state.currentSurveyIndex + 1,
                                total: SURVEY_QUESTIONS.length,
                            })}
                        </span>
                    </div>
                    <ProgressBar current={state.currentSurveyIndex} total={SURVEY_QUESTIONS.length} />
                </div>
            </div>

            <div className="flex-1 max-w-xl mx-auto w-full px-4 py-8 space-y-8 animate-slide-up">
                <PhaseHeader
                    title={t('phases.declarativeSurvey.title')}
                    subtitle={t('phases.declarativeSurvey.instruction')}
                />

                {/* Question card */}
                <div className="glass-card p-6 space-y-6">
                    <p className="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed text-balance">
                        {t(question.textKey)}
                    </p>

                    {/* Options */}
                    <div className="space-y-3" role="radiogroup" aria-label={t(question.textKey)}>
                        {question.options.map((option) => (
                            <Button
                                key={option.id}
                                variant="secondary"
                                fullWidth
                                onClick={() => handleOptionSelect(option.id)}
                                className="text-left !justify-start py-4 h-auto whitespace-normal leading-relaxed"
                                aria-label={t(option.textKey)}
                            >
                                <span className="text-sm text-slate-300 font-normal">{t(option.textKey)}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
