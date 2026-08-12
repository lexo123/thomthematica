import { useReducer, useCallback, useEffect } from 'react';
import { GameMode } from '../types';
import { sendGameStats, sendWish } from '../services/statsService';

/**
 * Time (in ms) to delay showing the Wish Modal upon completing 40 questions.
 * Gives the user time to see the answer feedback animation before the modal appears.
 */
export const WISH_MODAL_DELAY_MS = 1500;

export interface GameSessionState {
  totalQuestions: number;
  totalCorrect: number;
  streakCount: number;
  questionsInBlock40: number;
  correctInBlock40: number;
  perfectBlocksCount: number;
  showWishModal: boolean;
  wishText: string;
  wishSubmitted: boolean;
  wishSubmitting: boolean;
  wishError: string | null;
  feedback: 'correct' | 'incorrect' | null;
}

type GameSessionAction =
  | { type: 'RECORD_ANSWER'; isCorrect: boolean }
  | { type: 'CLEAR_FEEDBACK' }
  | { type: 'SET_SHOW_WISH_MODAL'; show: boolean }
  | { type: 'SET_WISH_TEXT'; text: string }
  | { type: 'SUBMIT_WISH_START' }
  | { type: 'SUBMIT_WISH_SUCCESS' }
  | { type: 'SUBMIT_WISH_ERROR'; error: string }
  | { type: 'RESET_SESSION' };

export const INITIAL_GAME_SESSION_STATE: GameSessionState = {
  totalQuestions: 0,
  totalCorrect: 0,
  streakCount: 0,
  questionsInBlock40: 0,
  correctInBlock40: 0,
  perfectBlocksCount: 0,
  showWishModal: false,
  wishText: '',
  wishSubmitted: false,
  wishSubmitting: false,
  wishError: null,
  feedback: null,
};

function gameSessionReducer(state: GameSessionState, action: GameSessionAction): GameSessionState {
  switch (action.type) {
    case 'RECORD_ANSWER': {
      const isCorrect = action.isCorrect;
      const newTotalQuestions = state.totalQuestions + 1;
      const newTotalCorrect = state.totalCorrect + (isCorrect ? 1 : 0);
      const newStreakCount = isCorrect ? state.streakCount + 1 : 0;
      
      const newQuestionsInBlock40 = state.questionsInBlock40 + 1;
      const newCorrectInBlock40 = state.correctInBlock40 + (isCorrect ? 1 : 0);

      let newPerfectBlocksCount = state.perfectBlocksCount;
      let nextQuestionsInBlock40 = newQuestionsInBlock40;
      let nextCorrectInBlock40 = newCorrectInBlock40;

      if (newQuestionsInBlock40 === 40) {
        if (newCorrectInBlock40 === 40) {
          newPerfectBlocksCount += 1;
        }
        nextQuestionsInBlock40 = 0;
        nextCorrectInBlock40 = 0;
      }

      return {
        ...state,
        totalQuestions: newTotalQuestions,
        totalCorrect: newTotalCorrect,
        streakCount: newStreakCount,
        questionsInBlock40: nextQuestionsInBlock40,
        correctInBlock40: nextCorrectInBlock40,
        perfectBlocksCount: newPerfectBlocksCount,
        feedback: isCorrect ? 'correct' : 'incorrect',
      };
    }

    case 'CLEAR_FEEDBACK':
      return { ...state, feedback: null };

    case 'SET_SHOW_WISH_MODAL':
      return { ...state, showWishModal: action.show };

    case 'SET_WISH_TEXT':
      return { ...state, wishText: action.text };

    case 'SUBMIT_WISH_START':
      return { ...state, wishSubmitting: true, wishError: null };

    case 'SUBMIT_WISH_SUCCESS':
      return { ...state, wishSubmitting: false, wishSubmitted: true, wishText: '', showWishModal: false };

    case 'SUBMIT_WISH_ERROR':
      return { ...state, wishSubmitting: false, wishError: action.error };

    case 'RESET_SESSION':
      return INITIAL_GAME_SESSION_STATE;

    default:
      return state;
  }
}

export const useGameSession = (gameMode: GameMode) => {
  const [state, dispatch] = useReducer(gameSessionReducer, INITIAL_GAME_SESSION_STATE);

  // Sync game stats on unmount or mode switch
  useEffect(() => {
    return () => {
      if (state.totalQuestions > 0) {
        sendGameStats(gameMode, state.totalQuestions, state.totalCorrect);
      }
    };
  }, [gameMode, state.totalQuestions, state.totalCorrect]);

  const recordAnswer = useCallback((isCorrect: boolean): { isBlock40Completed: boolean } => {
    const isBlock40Completed = state.questionsInBlock40 + 1 === 40;

    dispatch({ type: 'RECORD_ANSWER', isCorrect });

    if (isBlock40Completed) {
      setTimeout(() => {
        dispatch({ type: 'SET_SHOW_WISH_MODAL', show: true });
      }, WISH_MODAL_DELAY_MS);
    }

    return { isBlock40Completed };
  }, [state.questionsInBlock40]);

  const handleWishSubmit = useCallback(async () => {
    if (!state.wishText.trim()) return;

    dispatch({ type: 'SUBMIT_WISH_START' });
    const success = await sendWish(state.wishText, state.correctInBlock40 || 40);

    if (success) {
      dispatch({ type: 'SUBMIT_WISH_SUCCESS' });
    } else {
      dispatch({ type: 'SUBMIT_WISH_ERROR', error: 'სურვილის გაგზავნა ვერ მოხერხდა' });
    }
  }, [state.wishText, state.correctInBlock40]);

  const closeWishModal = useCallback(() => {
    dispatch({ type: 'SET_SHOW_WISH_MODAL', show: false });
  }, []);

  const setWishText = useCallback((text: string) => {
    dispatch({ type: 'SET_WISH_TEXT', text });
  }, []);

  const clearFeedback = useCallback(() => {
    dispatch({ type: 'CLEAR_FEEDBACK' });
  }, []);

  const resetSession = useCallback(() => {
    if (state.totalQuestions > 0) {
      sendGameStats(gameMode, state.totalQuestions, state.totalCorrect);
    }
    dispatch({ type: 'RESET_SESSION' });
  }, [gameMode, state.totalQuestions, state.totalCorrect]);

  return {
    ...state,
    recordAnswer,
    handleWishSubmit,
    closeWishModal,
    setWishText,
    clearFeedback,
    resetSession,
  };
};
