import { useState } from 'react';
import { I18nProvider } from './i18n';
import { useAppState } from './hooks/useAppState';
import { IntroPhase } from './phases/IntroPhase';
import { ReactiveGamePhase } from './phases/ReactiveGamePhase';
import { DeclarativeSurveyPhase } from './phases/DeclarativeSurveyPhase';
import { DiagnosticMirrorPhase } from './phases/DiagnosticMirrorPhase';
import { RetestPhase } from './phases/RetestPhase';
import { ResearchPage } from './ResearchPage';

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

    const [showResearch, setShowResearch] = useState(false);
    const openResearch = () => setShowResearch(true);
    const closeResearch = () => setShowResearch(false);

    return (
        <>
            {state.phase === 'INTRO' && (
                <IntroPhase onStart={startGame} onOpenResearch={openResearch} />
            )}

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
                    onOpenResearch={openResearch}
                />
            )}

            {state.phase === 'RETEST' && (
                <RetestPhase
                    state={state}
                    onSubmitRetestRanking={submitRetestRanking}
                    onFinish={skipRetest}
                />
            )}

            {showResearch && <ResearchPage onClose={closeResearch} />}
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
