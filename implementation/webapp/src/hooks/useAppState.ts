import { useReducer, useCallback } from 'react';
import type { AppState, AppAction, CharacterRanking, SurveyAnswer } from '../types';
import { SCENARIOS } from '../data/scenarios';
import { SURVEY_QUESTIONS } from '../data/surveyQuestions';
import { computePulseScores, computeIdealScores, createEmptyScores } from '../engine/scoring';

// ─── Initial State ────────────────────────────────────────────────────────────

const INITIAL_STATE: AppState = {
    phase: 'INTRO',
    currentScenarioIndex: 0,
    scenarioResults: [],
    currentSurveyIndex: 0,
    surveyAnswers: [],
    userPulse: createEmptyScores(),
    userIdeal: createEmptyScores(),
    retestResult: null,
    sessionStartedAt: Date.now(),
    currentItemStartedAt: Date.now(),
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
    const now = Date.now();

    switch (action.type) {
        case 'START_GAME': {
            return {
                ...state,
                phase: 'REACTIVE_GAME',
                currentScenarioIndex: 0,
                currentItemStartedAt: now,
            };
        }

        case 'SUBMIT_SCENARIO_RANKING': {
            const { scenarioId, rankings, responseTimeMs } = action.payload;
            const updatedResults = [
                ...state.scenarioResults,
                { scenarioId, rankings, responseTimeMs },
            ];
            const isLastScenario = state.currentScenarioIndex >= SCENARIOS.length - 1;

            if (isLastScenario) {
                const userPulse = computePulseScores(updatedResults, SCENARIOS);
                return {
                    ...state,
                    scenarioResults: updatedResults,
                    userPulse,
                    phase: 'DECLARATIVE_SURVEY',
                    currentSurveyIndex: 0,
                    currentItemStartedAt: now,
                };
            }

            return {
                ...state,
                scenarioResults: updatedResults,
                currentScenarioIndex: state.currentScenarioIndex + 1,
                currentItemStartedAt: now,
            };
        }

        case 'SUBMIT_SURVEY_ANSWER': {
            const updatedAnswers: SurveyAnswer[] = [...state.surveyAnswers, action.payload];
            const isLastQuestion = state.currentSurveyIndex >= SURVEY_QUESTIONS.length - 1;

            if (isLastQuestion) {
                const userIdeal = computeIdealScores(updatedAnswers, SURVEY_QUESTIONS);
                return {
                    ...state,
                    surveyAnswers: updatedAnswers,
                    userIdeal,
                    phase: 'DIAGNOSTIC_MIRROR',
                    currentItemStartedAt: now,
                };
            }

            return {
                ...state,
                surveyAnswers: updatedAnswers,
                currentSurveyIndex: state.currentSurveyIndex + 1,
                currentItemStartedAt: now,
            };
        }

        case 'GO_TO_RETEST': {
            return {
                ...state,
                phase: 'RETEST',
                currentItemStartedAt: now,
            };
        }

        case 'SKIP_RETEST': {
            // Phase ends; keeping in DIAGNOSTIC_MIRROR (or we could add a COMPLETE phase)
            return state;
        }

        case 'SUBMIT_RETEST_RANKING': {
            const { rankings, responseTimeMs } = action.payload;
            return {
                ...state,
                retestResult: {
                    scenarioId: 'retest',
                    rankings,
                    responseTimeMs,
                },
            };
        }

        default:
            return state;
    }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseAppStateReturn {
    state: AppState;
    startGame: () => void;
    submitScenarioRanking: (rankings: CharacterRanking[]) => void;
    submitSurveyAnswer: (answer: SurveyAnswer) => void;
    goToRetest: () => void;
    skipRetest: () => void;
    submitRetestRanking: (rankings: CharacterRanking[]) => void;
}

export function useAppState(): UseAppStateReturn {
    const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);

    const startGame = useCallback(() => {
        dispatch({ type: 'START_GAME' });
    }, []);

    const submitScenarioRanking = useCallback(
        (rankings: CharacterRanking[]) => {
            const currentScenario = SCENARIOS[state.currentScenarioIndex];
            const responseTimeMs = Date.now() - state.currentItemStartedAt;
            dispatch({
                type: 'SUBMIT_SCENARIO_RANKING',
                payload: { scenarioId: currentScenario.id, rankings, responseTimeMs },
            });
        },
        [state.currentScenarioIndex, state.currentItemStartedAt],
    );

    const submitSurveyAnswer = useCallback(
        (answer: SurveyAnswer) => {
            dispatch({ type: 'SUBMIT_SURVEY_ANSWER', payload: answer });
        },
        [],
    );

    const goToRetest = useCallback(() => {
        dispatch({ type: 'GO_TO_RETEST' });
    }, []);

    const skipRetest = useCallback(() => {
        dispatch({ type: 'SKIP_RETEST' });
    }, []);

    const submitRetestRanking = useCallback(
        (rankings: CharacterRanking[]) => {
            const responseTimeMs = Date.now() - state.currentItemStartedAt;
            dispatch({
                type: 'SUBMIT_RETEST_RANKING',
                payload: { rankings, responseTimeMs },
            });
        },
        [state.currentItemStartedAt],
    );

    return {
        state,
        startGame,
        submitScenarioRanking,
        submitSurveyAnswer,
        goToRetest,
        skipRetest,
        submitRetestRanking,
    };
}
