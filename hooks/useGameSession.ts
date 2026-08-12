import { useState, useRef, useEffect, useCallback } from 'react';
import { GameMode } from '../types';
import { sendGameStats, sendWish } from '../services/statsService';

export const useGameSession = (gameMode: GameMode | null) => {
  const [questionsInBlock, setQuestionsInBlock] = useState<number>(0);
  const [isPerfectBlock, setIsPerfectBlock] = useState<boolean>(true);

  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [totalCorrect, setTotalCorrect] = useState<number>(0);

  const [questionsInBlock40, setQuestionsInBlock40] = useState<number>(0);
  const [correctInBlock40, setCorrectInBlock40] = useState<number>(0);
  const [lastCompletedBlockCorrectCount, setLastCompletedBlockCorrectCount] = useState<number>(0);

  const [showWishModal, setShowWishModal] = useState<boolean>(false);
  const [wishText, setWishText] = useState<string>("");
  const [isSendingWish, setIsSendingWish] = useState<boolean>(false);

  const [consecutivePerfectBlocks, setConsecutivePerfectBlocks] = useState<number>(0);

  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [showRewardImage, setShowRewardImage] = useState<boolean>(false);
  const [lastPhraseTemplate, setLastPhraseTemplate] = useState<string>("");

  const statsRef = useRef({ mode: gameMode, total: totalQuestions, correct: totalCorrect });
  const lastSentStatsRef = useRef({ total: 0, correct: 0 });

  useEffect(() => {
    statsRef.current = { mode: gameMode, total: totalQuestions, correct: totalCorrect };
  }, [gameMode, totalQuestions, totalCorrect]);

  const sendDataToSheets = useCallback((mode: GameMode, total: number, correct: number) => {
    if (total === 0) return;

    const deltaTotal = total - lastSentStatsRef.current.total;
    const deltaCorrect = correct - lastSentStatsRef.current.correct;

    if (deltaTotal <= 0) return;

    lastSentStatsRef.current = { total, correct };
    sendGameStats(mode, deltaTotal, deltaCorrect);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const { mode, total, correct } = statsRef.current;
        if (mode && total > 0) sendDataToSheets(mode, total, correct);
      }
    };

    const handleUnload = () => {
      const { mode, total, correct } = statsRef.current;
      if (mode && total > 0) sendDataToSheets(mode, total, correct);
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [sendDataToSheets]);

  const getUniqueRandomPhrase = useCallback((list: string[]) => {
    let candidates = list.filter(phrase => phrase !== lastPhraseTemplate);
    if (candidates.length === 0) candidates = list;
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    setLastPhraseTemplate(selected);
    return selected;
  }, [lastPhraseTemplate]);

  const resetSession = useCallback(() => {
    if (gameMode && totalQuestions > 0) {
      sendDataToSheets(gameMode, totalQuestions, totalCorrect);
    }
    setQuestionsInBlock(0);
    setIsPerfectBlock(true);
    setTotalQuestions(0);
    setTotalCorrect(0);
    setQuestionsInBlock40(0);
    setCorrectInBlock40(0);
    setConsecutivePerfectBlocks(0);
    setCurrentMessage("");
    setShowRewardImage(false);
    lastSentStatsRef.current = { total: 0, correct: 0 };
  }, [gameMode, totalQuestions, totalCorrect, sendDataToSheets]);

  const submitWish = useCallback(async (onComplete: () => void) => {
    if (!wishText.trim()) return;

    setIsSendingWish(true);
    try {
      await sendWish(wishText, lastCompletedBlockCorrectCount);
    } catch (error) {
      console.error("ვერ მოხდა სურვილის გაგზავნა:", error);
    } finally {
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsSendingWish(false);
      setShowWishModal(false);
      setWishText("");
      onComplete();
    }
  }, [wishText, lastCompletedBlockCorrectCount]);

  return {
    questionsInBlock,
    setQuestionsInBlock,
    isPerfectBlock,
    setIsPerfectBlock,
    totalQuestions,
    setTotalQuestions,
    totalCorrect,
    setTotalCorrect,
    questionsInBlock40,
    setQuestionsInBlock40,
    correctInBlock40,
    setCorrectInBlock40,
    lastCompletedBlockCorrectCount,
    setLastCompletedBlockCorrectCount,
    showWishModal,
    setShowWishModal,
    wishText,
    setWishText,
    isSendingWish,
    consecutivePerfectBlocks,
    setConsecutivePerfectBlocks,
    currentMessage,
    setCurrentMessage,
    showRewardImage,
    setShowRewardImage,
    getUniqueRandomPhrase,
    resetSession,
    submitWish
  };
};
