import React, { useState, useEffect, useRef } from 'react';
import { MathProblem, GameState, GameMode, ColMultState } from './types';
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
  GOOGLE_SHEETS_URL
} from './services/problemGenerator';

const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>(GameState.Playing);

  const [colMultState, setColMultState] = useState<ColMultState>({
    r1: ['', '', '', ''],
    r2: ['', '', '', ''],
    res: ['', '', '', '']
  });

  const [showKveshValidation, setShowKveshValidation] = useState<boolean>(false);
  const [hasKveshFailedThisQuestion, setHasKveshFailedThisQuestion] = useState<boolean>(false);

  const getExpectedDigits = (num1: number, num2: number) => {
    const bOnes = num2 % 10;
    const bTens = Math.floor(num2 / 10);
    
    const r1Val = num1 * bOnes;
    const r2Val = num1 * bTens;
    const resVal = num1 * num2;
    
    const r1 = [
      r1Val >= 1000 ? (Math.floor(r1Val / 1000) % 10).toString() : "",
      r1Val >= 100 ? (Math.floor(r1Val / 100) % 10).toString() : "",
      r1Val >= 10 ? (Math.floor(r1Val / 10) % 10).toString() : "",
      (r1Val % 10).toString()
    ];
    
    const r2 = [
      r2Val >= 100 ? (Math.floor(r2Val / 100) % 10).toString() : "",
      r2Val >= 10 ? (Math.floor(r2Val / 10) % 10).toString() : "",
      (r2Val % 10).toString(),
      ""
    ];
    
    const res = [
      resVal >= 1000 ? (Math.floor(resVal / 1000) % 10).toString() : "",
      resVal >= 100 ? (Math.floor(resVal / 100) % 10).toString() : "",
      resVal >= 10 ? (Math.floor(resVal / 10) % 10).toString() : "",
      (resVal % 10).toString()
    ];
    
    return { r1, r2, res };
  };

  const getSolvingSequence = (prob: MathProblem) => {
    if (!prob || prob.num1 === undefined || prob.num2 === undefined) return [];
    
    const sequence: { row: 'r1' | 'r2' | 'res'; col: number }[] = [];
    
    for (let c = 3; c >= 0; c--) {
      sequence.push({ row: 'r1', col: c });
    }
    for (let c = 3; c >= 0; c--) {
      sequence.push({ row: 'r2', col: c });
    }
    for (let c = 3; c >= 0; c--) {
      sequence.push({ row: 'res', col: c });
    }
    
    return sequence;
  };

  const handleCellChange = (row: 'r1' | 'r2' | 'res', colIndex: number, val: string) => {
    if (val === '') {
      const newState = { ...colMultState };
      newState[row][colIndex] = '';
      setColMultState(newState);
      return;
    }

    const digit = val.slice(-1);
    if (!/^[0-9]$/.test(digit)) return;
    
    const newState = { ...colMultState };
    newState[row][colIndex] = digit;
    setColMultState(newState);

    if (digit !== "" && problem) {
      const sequence = getSolvingSequence(problem);
      const currentIndex = sequence.findIndex(item => item.row === row && item.col === colIndex);
      if (currentIndex !== -1 && currentIndex < sequence.length - 1) {
        const nextCell = sequence[currentIndex + 1];
        setTimeout(() => {
          const el = document.getElementById(`cell-${nextCell.row}-${nextCell.col}`) as HTMLInputElement;
          if (el) {
            el.focus();
            el.select();
          }
        }, 10);
      }
    }
  };

  const handleKeyDown = (row: 'r1' | 'r2' | 'res', colIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (colMultState[row][colIndex] !== '') {
        const newState = { ...colMultState };
        newState[row][colIndex] = '';
        setColMultState(newState);
        return;
      }

      if (problem) {
        const sequence = getSolvingSequence(problem);
        const currentIndex = sequence.findIndex(item => item.row === row && item.col === colIndex);
        if (currentIndex > 0) {
          const prevCell = sequence[currentIndex - 1];
          const nextState = { ...colMultState };
          nextState[prevCell.row][prevCell.col] = '';
          setColMultState(nextState);
          setTimeout(() => {
            const el = document.getElementById(`cell-${prevCell.row}-${prevCell.col}`) as HTMLInputElement;
            if (el) {
              el.focus();
              el.select();
            }
          }, 10);
        }
      }
      return;
    }

    if ((e.key === 'Enter' || e.key === ' ') && problem) {
      e.preventDefault();
      const sequence = getSolvingSequence(problem);
      const currentIndex = sequence.findIndex(item => item.row === row && item.col === colIndex);
      if (currentIndex !== -1 && currentIndex < sequence.length - 1) {
        const nextCell = sequence[currentIndex + 1];
        setTimeout(() => {
          const el = document.getElementById(`cell-${nextCell.row}-${nextCell.col}`) as HTMLInputElement;
          if (el) {
            el.focus();
            el.select();
          }
        }, 10);
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (colIndex > 0) {
        const el = document.getElementById(`cell-${row}-${colIndex - 1}`) as HTMLInputElement;
        if (el) { el.focus(); el.select(); }
      } else {
        const nextRow = row === 'r1' ? 'r2' : row === 'r2' ? 'res' : null;
        if (nextRow) {
          const el = document.getElementById(`cell-${nextRow}-3`) as HTMLInputElement;
          if (el) { el.focus(); el.select(); }
        }
      }
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (colIndex < 3) {
        const el = document.getElementById(`cell-${row}-${colIndex + 1}`) as HTMLInputElement;
        if (el) { el.focus(); el.select(); }
      } else {
        const prevRow = row === 'res' ? 'r2' : row === 'r2' ? 'r1' : null;
        if (prevRow) {
          const el = document.getElementById(`cell-${prevRow}-0`) as HTMLInputElement;
          if (el) { el.focus(); el.select(); }
        }
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevRow = row === 'res' ? 'r2' : row === 'r2' ? 'r1' : null;
      if (prevRow) {
        const el = document.getElementById(`cell-${prevRow}-${colIndex}`) as HTMLInputElement;
        if (el) { el.focus(); el.select(); }
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextRow = row === 'r1' ? 'r2' : row === 'r2' ? 'res' : null;
      if (nextRow) {
        const el = document.getElementById(`cell-${nextRow}-${colIndex}`) as HTMLInputElement;
        if (el) { el.focus(); el.select(); }
      }
      return;
    }
  };
  
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

  const [timeLeft, setTimeLeft] = useState<number>(TIME_LIMIT);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const statsRef = useRef({ mode: gameMode, total: totalQuestions, correct: totalCorrect });
  const lastSentStatsRef = useRef({ total: 0, correct: 0 });

  useEffect(() => {
    statsRef.current = { mode: gameMode, total: totalQuestions, correct: totalCorrect };
  }, [gameMode, totalQuestions, totalCorrect]);

  const sendDataToSheets = (mode: GameMode, total: number, correct: number) => {
    if (total === 0 || (GOOGLE_SHEETS_URL as string) === "YOUR_WEB_APP_URL_HERE") return;
    
    const deltaTotal = total - lastSentStatsRef.current.total;
    const deltaCorrect = correct - lastSentStatsRef.current.correct;
    
    if (deltaTotal <= 0) return;
    
    const modeName = mode === GameMode.Thomthematica ? 'თომთემატიკა' : 
                     mode === GameMode.ThomravlebisTabula ? 'თომრავლების ტაბულა' : 
                     mode === GameMode.Gethometria ? 'გეთომეტრია' : 'ქვეშმიწერით გამრავლება';
    const payload = JSON.stringify({ gameMode: modeName, totalQuestions: deltaTotal, totalCorrect: deltaCorrect });
    
    lastSentStatsRef.current = { total, correct };

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'text/plain' });
      navigator.sendBeacon(GOOGLE_SHEETS_URL, blob);
    } else {
      fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: payload,
        keepalive: true
      }).catch(console.error);
    }
  };

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
  }, []);

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

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(TIME_LIMIT);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTimeOut = () => {
    stopTimer();
    setIsPerfectBlock(false);
    setConsecutivePerfectBlocks(0);
    setTotalQuestions(prev => prev + 1);
    
    setCurrentMessage("დრო ამოიწურა! წააგე.");
    setGameState(GameState.Incorrect);
    setShowRewardImage(false);
  };

  const getUniqueRandomPhrase = (list: string[]) => {
    let candidates = list.filter(phrase => phrase !== lastPhraseTemplate);
    if (candidates.length === 0) candidates = list;
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    setLastPhraseTemplate(selected);
    return selected;
  };

  const isColMultFilled = () => {
    if (!problem) return false;
    return colMultState.r1.some(v => v !== '') || 
           colMultState.r2.some(v => v !== '') || 
           colMultState.res.some(v => v !== '');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!problem) return;

    if (gameMode !== GameMode.Kveshmicera && !userAnswer) return;

    stopTimer();

    let isCorrect = false;
    let actualUserAnswer = userAnswer;

    if (gameMode === GameMode.Kveshmicera) {
      const { r1: expR1, r2: expR2, res: expRes } = getExpectedDigits(problem.num1!, problem.num2!);
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
      setColMultState({
        r1: ['', '', '', ''],
        r2: ['', '', '', ''],
        res: ['', '', '', '']
      });
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

      setProblem(generateProblem(gameMode!, nextIndex));
      setUserAnswer('');
      setColMultState({
        r1: ['', '', '', ''],
        r2: ['', '', '', ''],
        res: ['', '', '', '']
      });
      setShowKveshValidation(false);
      setHasKveshFailedThisQuestion(false);
      setGameState(GameState.Playing);
      setShowRewardImage(false);
      if (gameMode === GameMode.ThomravlebisTabula) {
        startTimer();
      }
    }
  };

  const sendWishToSheets = async () => {
    if (!wishText.trim()) return;

    setIsSendingWish(true);
    const modeName = gameMode === GameMode.Thomthematica ? 'თომთემატიკა' : 
                     gameMode === GameMode.ThomravlebisTabula ? 'თომრავლების ტაბულა' : 
                     gameMode === GameMode.Gethometria ? 'გეთომეტრია' : 'ქვეშმიწერით გამრავლება';

    const payload = JSON.stringify({ 
      gameMode: modeName, 
      totalQuestions: 40,
      totalCorrect: lastCompletedBlockCorrectCount,
      wish: wishText,
      wishText: wishText,
      wish_text: wishText,
      "სურვილი": wishText,
      "Wish": wishText,
      "WishText": wishText
    });

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
        navigator.sendBeacon(GOOGLE_SHEETS_URL, blob);
      } else {
        await fetch(GOOGLE_SHEETS_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: payload,
          keepalive: true
        });
      }
    } catch (error) {
      console.error("ვერ მოხდა სურვილის გაგზავნა:", error);
    } finally {
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsSendingWish(false);
      setShowWishModal(false);
      setWishText("");
      handleNext(true);
    }
  };

  const handleHomeClick = () => {
    if (gameMode && totalQuestions > 0) {
      sendDataToSheets(gameMode, totalQuestions, totalCorrect);
    }
    setGameMode(null);
    setProblem(null);
    setQuestionsInBlock(0);
    setIsPerfectBlock(true);
    setTotalQuestions(0);
    setTotalCorrect(0);
    setConsecutivePerfectBlocks(0);
    lastSentStatsRef.current = { total: 0, correct: 0 };
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
          onSendWish={sendWishToSheets}
        />
      )}
    </div>
  );
};

export default App;
