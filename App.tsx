import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MathProblem, GameState, GameMode } from './types';
import { Button } from './components/Button';
import { ResultOverlay } from './components/ResultOverlay';
import { Header } from './components/Header';
import { MainMenu } from './components/MainMenu';
import { ColumnMultiplication } from './components/ColumnMultiplication';
import { GeometryQuiz } from './components/GeometryQuiz';
import { MathQuiz } from './components/MathQuiz';
import { WishModal } from './components/WishModal';
import {
  generateProblem,
  CORRECT_PHRASES,
  INCORRECT_PHRASES,
  TIME_LIMIT,
} from './services/problemGenerator';
import { getExpectedDigits, getSolvingSequence } from './utils/columnMultiplication';
import { useTimer } from './hooks/useTimer';
import { useColumnMultiplication } from './hooks/useColumnMultiplication';
import { useGameSession } from './hooks/useGameSession';

const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>(GameState.Playing);

  const inputRef = useRef<HTMLInputElement>(null);

  const {
    questionsInBlock,
    setQuestionsInBlock,
    isPerfectBlock,
    setIsPerfectBlock,
    setTotalQuestions,
    totalQuestions,
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
  } = useGameSession(gameMode);

  const handleTimeOut = useCallback(() => {
    setIsPerfectBlock(false);
    setConsecutivePerfectBlocks(0);
    setTotalQuestions(prev => prev + 1);
    
    setCurrentMessage("დრო ამოიწურა! წააგე.");
    setGameState(GameState.Incorrect);
    setShowRewardImage(false);
  }, [setIsPerfectBlock, setConsecutivePerfectBlocks, setTotalQuestions, setCurrentMessage, setShowRewardImage]);

  const { timeLeft, startTimer, stopTimer } = useTimer({
    timeLimit: TIME_LIMIT,
    onTimeOut: handleTimeOut
  });

  const {
    colMultState,
    showKveshValidation,
    setShowKveshValidation,
    hasKveshFailedThisQuestion,
    setHasKveshFailedThisQuestion,
    handleCellChange,
    handleKeyDown,
    isColMultFilled,
    resetColMultState
  } = useColumnMultiplication(problem);

  useEffect(() => {
    if (gameMode) {
      setProblem(generateProblem(gameMode, questionsInBlock));
      if (gameMode === GameMode.ThomravlebisTabula) {
        startTimer();
      }
    }
  }, [gameMode]);

  useEffect(() => {
    if (gameState === GameState.Playing) {
      if (gameMode === GameMode.Kveshmicera) {
        setTimeout(() => {
          if (problem) {
            const sequence = getSolvingSequence(problem);
            if (sequence.length > 0) {
              const firstCell = sequence[0];
              document.getElementById(`cell-${firstCell.row}-${firstCell.col}`)?.focus();
            }
          }
        }, 120);
      } else {
        inputRef.current?.focus();
      }
    }
  }, [gameState, gameMode, problem]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!problem) return;

    if (gameMode !== GameMode.Kveshmicera && !userAnswer) return;

    stopTimer();

    let isCorrect = false;
    let actualUserAnswer = userAnswer;

    if (gameMode === GameMode.Kveshmicera) {
      if (!('num1' in problem && 'num2' in problem)) return;
      const { r1: expR1, r2: expR2, res: expRes } = getExpectedDigits(problem.num1, problem.num2);
      let isAllCorrect = true;
      for (let c = 0; c < 4; c++) {
        if (colMultState.r1[c] !== expR1[c]) isAllCorrect = false;
        if (colMultState.r2[c] !== expR2[c]) isAllCorrect = false;
        if (colMultState.res[c] !== expRes[c]) isAllCorrect = false;
      }
      isCorrect = isAllCorrect;
      const nonZeroRes = colMultState.res.filter(v => v !== "");
      actualUserAnswer = nonZeroRes.join('') || "0";
    } else {
      const val = parseInt(userAnswer, 10);
      if (isNaN(val)) return;
      isCorrect = val === problem.answer;
    }

    if (gameMode === GameMode.Kveshmicera) {
      if (isCorrect) {
        if (!hasKveshFailedThisQuestion) {
          setTotalQuestions(prev => prev + 1);
          setTotalCorrect(prev => prev + 1);

          const nextInBlock40 = questionsInBlock40 + 1;
          const nextCorrectInBlock40 = correctInBlock40 + 1;
          setQuestionsInBlock40(nextInBlock40);
          setCorrectInBlock40(nextCorrectInBlock40);

          if (nextInBlock40 === 40) {
            if (nextCorrectInBlock40 >= 39) {
              setLastCompletedBlockCorrectCount(nextCorrectInBlock40);
              setTimeout(() => {
                setShowWishModal(true);
              }, 1500);
            }
            setQuestionsInBlock40(0);
            setCorrectInBlock40(0);
          }
        }

        const nextQuestionsInBlock = questionsInBlock + 1;
        setQuestionsInBlock(nextQuestionsInBlock);

        let message = getUniqueRandomPhrase(CORRECT_PHRASES);

        if (nextQuestionsInBlock === 3) {
          setShowRewardImage(true);
          if (isPerfectBlock) {
             setConsecutivePerfectBlocks(prev => prev + 1);
          } else {
             message = "შეცდომები გქონდა! მეფე უკმაყოფილოა.";
          }
        } else {
          setShowRewardImage(false);
        }

        setCurrentMessage(message);
        setGameState(GameState.Correct);
        setShowKveshValidation(false);
        setHasKveshFailedThisQuestion(false);

      } else {
        if (!hasKveshFailedThisQuestion) {
          setTotalQuestions(prev => prev + 1);
          const nextInBlock40 = questionsInBlock40 + 1;
          setQuestionsInBlock40(nextInBlock40);

          if (nextInBlock40 === 40) {
            if (correctInBlock40 >= 39) {
              setLastCompletedBlockCorrectCount(correctInBlock40);
              setTimeout(() => {
                setShowWishModal(true);
              }, 1500);
            }
            setQuestionsInBlock40(0);
            setCorrectInBlock40(0);
          }

          setHasKveshFailedThisQuestion(true);
          setIsPerfectBlock(false);
          setConsecutivePerfectBlocks(0);
        }

        const template = getUniqueRandomPhrase(INCORRECT_PHRASES);
        const finalMessage = template.replace("[]", actualUserAnswer);
        setCurrentMessage(finalMessage);
        setShowKveshValidation(true);
        setShowRewardImage(false);
      }
    } else {
      setTotalQuestions(prev => prev + 1);
      if (isCorrect) setTotalCorrect(prev => prev + 1);

      const nextInBlock40 = questionsInBlock40 + 1;
      const nextCorrectInBlock40 = correctInBlock40 + (isCorrect ? 1 : 0);
      
      setQuestionsInBlock40(nextInBlock40);
      setCorrectInBlock40(nextCorrectInBlock40);

      if (isCorrect) {
        const nextQuestionsInBlock = questionsInBlock + 1;
        setQuestionsInBlock(nextQuestionsInBlock);

        let message = getUniqueRandomPhrase(CORRECT_PHRASES);

        if (nextQuestionsInBlock === 3) {
          setShowRewardImage(true);
          if (isPerfectBlock) {
             setConsecutivePerfectBlocks(prev => prev + 1);
          } else {
             message = "შეცდომები გქონდა! მეფე უკმაყოფილოა.";
          }
        } else {
          setShowRewardImage(false);
        }

        setCurrentMessage(message);
        setGameState(GameState.Correct);
      } else {
        setIsPerfectBlock(false);
        setConsecutivePerfectBlocks(0);

        const template = getUniqueRandomPhrase(INCORRECT_PHRASES);
        const finalMessage = template.replace("[]", actualUserAnswer);
        
        setCurrentMessage(finalMessage);
        setGameState(GameState.Incorrect);
        setShowRewardImage(false);
      }

      if (nextInBlock40 === 40) {
        if (nextCorrectInBlock40 >= 39) {
          setLastCompletedBlockCorrectCount(nextCorrectInBlock40);
          setTimeout(() => {
            setShowWishModal(true);
          }, 1500);
        }
        setQuestionsInBlock40(0);
        setCorrectInBlock40(0);
      }
    }
  };

  const handleNext = (force: boolean = false) => {
    if (showWishModal && !force) return;
    if (gameState === GameState.Incorrect) {
      setUserAnswer('');
      resetColMultState();
      setGameState(GameState.Playing);
      if (gameMode === GameMode.ThomravlebisTabula) {
        startTimer();
      }
      return;
    }

    if (gameState === GameState.Correct) {
      let nextIndex = questionsInBlock;
      if (questionsInBlock >= 3) {
        setQuestionsInBlock(0);
        setIsPerfectBlock(true);
        nextIndex = 0;
      }

      if (gameMode) {
        setProblem(generateProblem(gameMode, nextIndex));
      }
      setUserAnswer('');
      resetColMultState();
      setGameState(GameState.Playing);
      setShowRewardImage(false);
      if (gameMode === GameMode.ThomravlebisTabula) {
        startTimer();
      }
    }
  };

  const handleSendWish = () => {
    submitWish(() => handleNext(true));
  };

  const handleHomeClick = () => {
    resetSession();
    setGameMode(null);
    setProblem(null);
    stopTimer();
  };

  if (!gameMode) {
    return <MainMenu onSelectMode={(mode) => setGameMode(mode)} />;
  }

  if (!problem) return <div className="min-h-screen flex items-center justify-center">იტვირთება...</div>;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-indigo-100 to-purple-200 flex flex-col items-center p-2 sm:p-4 relative overflow-x-hidden">
      <Header 
        gameMode={gameMode}
        gameState={gameState}
        timeLeft={timeLeft}
        questionsInBlock={questionsInBlock}
        totalCorrect={totalCorrect}
        totalQuestions={totalQuestions}
        onHomeClick={handleHomeClick}
      />

      <main className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-12 relative overflow-hidden border-b-8 border-indigo-200 my-auto">
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />

        <div className="text-center space-y-8">
          {gameMode === GameMode.Kveshmicera ? (
            <ColumnMultiplication 
              problem={problem}
              colMultState={colMultState}
              showKveshValidation={showKveshValidation}
              currentMessage={currentMessage}
              onCellChange={handleCellChange}
              onKeyDown={handleKeyDown}
              getExpectedDigits={getExpectedDigits}
              onSubmit={handleSubmit}
              isColMultFilled={isColMultFilled}
            />
          ) : problem.category === 'geometry' ? (
            <GeometryQuiz problem={problem} />
          ) : (
            <MathQuiz problem={problem} />
          )}

          {gameMode !== GameMode.Kveshmicera && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="number"
                  inputMode="numeric"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="?"
                  className="w-full text-center text-5xl font-bold py-4 border-4 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all placeholder-gray-300 text-gray-800"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full text-2xl py-4"
                disabled={!userAnswer}
              >
                შემოწმება
              </Button>
            </form>
          )}
        </div>
      </main>

      <ResultOverlay 
        gameState={gameState} 
        correctAnswer={problem.answer}
        onReset={handleNext}
        message={currentMessage}
        showImage={showRewardImage}
        isPerfectBlock={isPerfectBlock}
        consecutivePerfectBlocks={consecutivePerfectBlocks}
      />

      {showWishModal && (
        <WishModal 
          lastCompletedBlockCorrectCount={lastCompletedBlockCorrectCount}
          wishText={wishText}
          isSendingWish={isSendingWish}
          onWishTextChange={setWishText}
          onSendWish={handleSendWish}
        />
      )}
    </div>
  );
};

export default App;
