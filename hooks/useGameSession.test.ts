import { describe, it, expect } from 'vitest';
import {
  gameSessionReducer,
  INITIAL_GAME_SESSION_STATE,
  GameSessionState
} from './useGameSession';

describe('gameSessionReducer', () => {
  it('should correctly store lastCompletedBlockCorrectCount for a 40/40 perfect block', () => {
    let state: GameSessionState = INITIAL_GAME_SESSION_STATE;

    // Simulate 40 correct answers
    for (let i = 0; i < 40; i++) {
      state = gameSessionReducer(state, { type: 'RECORD_ANSWER', isCorrect: true });
    }

    expect(state.totalQuestions).toBe(40);
    expect(state.totalCorrect).toBe(40);
    expect(state.questionsInBlock40).toBe(0); // Reset for next block
    expect(state.correctInBlock40).toBe(0); // Reset for next block
    expect(state.lastCompletedBlockCorrectCount).toBe(40); // Preserved!
    expect(state.perfectBlocksCount).toBe(1);
  });

  it('should correctly store lastCompletedBlockCorrectCount for 39/40 block', () => {
    let state: GameSessionState = INITIAL_GAME_SESSION_STATE;

    // 39 correct answers, 1 incorrect
    for (let i = 0; i < 39; i++) {
      state = gameSessionReducer(state, { type: 'RECORD_ANSWER', isCorrect: true });
    }
    state = gameSessionReducer(state, { type: 'RECORD_ANSWER', isCorrect: false });

    expect(state.totalQuestions).toBe(40);
    expect(state.totalCorrect).toBe(39);
    expect(state.questionsInBlock40).toBe(0);
    expect(state.correctInBlock40).toBe(0);
    expect(state.lastCompletedBlockCorrectCount).toBe(39);
    expect(state.perfectBlocksCount).toBe(0);
  });

  it('should correctly store lastCompletedBlockCorrectCount for 35/40 block', () => {
    let state: GameSessionState = INITIAL_GAME_SESSION_STATE;

    // 35 correct answers, 5 incorrect
    for (let i = 0; i < 35; i++) {
      state = gameSessionReducer(state, { type: 'RECORD_ANSWER', isCorrect: true });
    }
    for (let i = 0; i < 5; i++) {
      state = gameSessionReducer(state, { type: 'RECORD_ANSWER', isCorrect: false });
    }

    expect(state.totalQuestions).toBe(40);
    expect(state.totalCorrect).toBe(35);
    expect(state.questionsInBlock40).toBe(0);
    expect(state.correctInBlock40).toBe(0);
    expect(state.lastCompletedBlockCorrectCount).toBe(35);
  });

  it('should correctly store lastCompletedBlockCorrectCount for 0/40 block', () => {
    let state: GameSessionState = INITIAL_GAME_SESSION_STATE;

    // 40 incorrect answers
    for (let i = 0; i < 40; i++) {
      state = gameSessionReducer(state, { type: 'RECORD_ANSWER', isCorrect: false });
    }

    expect(state.totalQuestions).toBe(40);
    expect(state.totalCorrect).toBe(0);
    expect(state.questionsInBlock40).toBe(0);
    expect(state.correctInBlock40).toBe(0);
    expect(state.lastCompletedBlockCorrectCount).toBe(0);
  });

  it('should handle wish submission lifecycle correctly', () => {
    let state: GameSessionState = {
      ...INITIAL_GAME_SESSION_STATE,
      wishText: 'I want a dragon picture',
      showWishModal: true
    };

    // Start submission
    state = gameSessionReducer(state, { type: 'SUBMIT_WISH_START' });
    expect(state.wishSubmitting).toBe(true);
    expect(state.wishError).toBeNull();

    // Error case
    let errorState = gameSessionReducer(state, { type: 'SUBMIT_WISH_ERROR', error: 'Network error' });
    expect(errorState.wishSubmitting).toBe(false);
    expect(errorState.wishError).toBe('Network error');

    // Success case
    let successState = gameSessionReducer(state, { type: 'SUBMIT_WISH_SUCCESS' });
    expect(successState.wishSubmitting).toBe(false);
    expect(successState.wishSubmitted).toBe(true);
    expect(successState.showWishModal).toBe(false);
    expect(successState.wishText).toBe('');
  });
});
