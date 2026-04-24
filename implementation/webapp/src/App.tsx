import { I18nProvider } from './i18n';
import { useAppState } from './hooks/useAppState';
import { IntroPhase } from './phases/IntroPhase';
import { ReactiveGamePhase } from './phases/ReactiveGamePhase';
import { DeclarativeSurveyPhase } from './phases/DeclarativeSurveyPhase';
import { DiagnosticMirrorPhase } from './phases/DiagnosticMirrorPhase';
import { RetestPhase } from './phases/RetestPhase';

function AppContent() {
    const {
        state,
        startGame,
        submitScenarioRanking,
        submitSurveyAnswer,
        goToRetest,
        skipRetest,
        submitRetestRanking,
    } = useAppState();

    return (
        <>
            {state.phase === 'INTRO' && <IntroPhase onStart={startGame} />}

            {state.phase === 'REACTIVE_GAME' && (
                <ReactiveGamePhase state={state} onSubmitRanking={submitScenarioRanking} />
            )}

            {state.phase === 'DECLARATIVE_SURVEY' && (
                <DeclarativeSurveyPhase state={state} onSubmitAnswer={submitSurveyAnswer} />
            )}

            {state.phase === 'DIAGNOSTIC_MIRROR' && (
                <DiagnosticMirrorPhase
                    state={state}
                    onGoToRetest={goToRetest}
                    onSkipRetest={skipRetest}
                />
            )}

            {state.phase === 'RETEST' && (
                <RetestPhase
                    state={state}
                    onSubmitRetestRanking={submitRetestRanking}
                    onFinish={skipRetest}
                />
            )}
        </>
    );
}

export default function App() {
    return (
        <I18nProvider defaultLocale="pt-BR">
            <AppContent />
        </I18nProvider>
    );
}
