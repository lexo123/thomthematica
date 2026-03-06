import React, { useState, useEffect, useRef } from 'react';
import { MathProblem, Operation, GameState, MissingPart, GameMode } from './types';
import { Button } from './components/Button';
import { ResultOverlay } from './components/ResultOverlay';

// ფრაზების სიები
const CORRECT_PHRASES = [
  "ყოჩაღ, თომა კაი ბიჭი ხარ",
  "სააღოლ ძმაო",
  "მალადეეც",
  "ბრავო",
  "შენ აღარ ხუმრობ",
  "მათემატიკოსი კაცი ხარ"
];

const INCORRECT_PHRASES = [
  "არა ბიჭო რა []",
  "[] არა იის",
  "[] რანაირად არის, წესიერად დაითვალე",
  "არასწორია, ასეთი ჭკვიანი კაცი მაგას როგორ ვერ ხვდები"
];

const TIME_LIMIT = 10;

const generateProblem = (mode: GameMode): MathProblem => {
  if (mode === GameMode.ThomravlebisTabula) {
    const n1 = Math.floor(Math.random() * 11); // 0-10
    const n2 = Math.floor(Math.random() * 11); // 0-10
    const equationResult = n1 * n2;
    return {
      num1: n1,
      num2: n2,
      operation: Operation.Multiply,
      answer: equationResult,
      missingPart: 'result',
      equationResult: equationResult
    };
  }

  const operations = [Operation.Add, Operation.Subtract, Operation.Multiply, Operation.Divide];
  const op = operations[Math.floor(Math.random() * operations.length)];
  
  let num1 = 0;
  let num2 = 0;
  
  // მიმატება და გამოკლება - 3 რიცხვიანი ლოგიკა
  if (op === Operation.Add || op === Operation.Subtract) {
    while (true) {
      const possibleOps = [Operation.Add, Operation.Subtract];
      const op1 = possibleOps[Math.floor(Math.random() * possibleOps.length)];
      const op2 = possibleOps[Math.floor(Math.random() * possibleOps.length)];

      const n1 = Math.floor(Math.random() * 30) + 10; 
      const n2 = Math.floor(Math.random() * 20) + 1;  
      const n3 = Math.floor(Math.random() * 20) + 1;  

      let tempAns = 0;
      if (op1 === Operation.Add) tempAns = n1 + n2;
      else tempAns = n1 - n2;

      if (op2 === Operation.Add) tempAns = tempAns + n3;
      else tempAns = tempAns - n3;

      if (tempAns >= 0) {
        return { 
          num1: n1, 
          num2: n2, 
          num3: n3, 
          operation: op1, 
          operation2: op2, 
          answer: tempAns,
          missingPart: 'result',
          equationResult: tempAns
        };
      }
    }
  }

  // გამრავლება და გაყოფა - 2 რიცხვიანი ლოგიკა
  let equationResult = 0;
  let finalAnswer = 0;
  let missing: MissingPart = 'result';
  let n1 = 0;
  let n2 = 0;

  switch (op) {
    case Operation.Multiply:
      n1 = Math.floor(Math.random() * 10) + 1;
      n2 = Math.floor(Math.random() * 10) + 1;
      equationResult = n1 * n2;
      break;
    case Operation.Divide:
      equationResult = Math.floor(Math.random() * 10) + 1; // განაყოფი
      n2 = Math.floor(Math.random() * 9) + 2; // გამყოფი
      n1 = equationResult * n2; // გასაყოფი
      break;
  }

  if (Math.random() > 0.5) {
    missing = 'num2';
    finalAnswer = n2;
  } else {
    missing = 'result';
    finalAnswer = equationResult;
  }

  return { 
    num1: n1, 
    num2: n2, 
    operation: op, 
    answer: finalAnswer, 
    missingPart: missing,
    equationResult: equationResult 
  };
};

const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>(GameState.Playing);
  
  // 3-კითხვიანი ბლოკის ლოგიკა
  const [questionsInBlock, setQuestionsInBlock] = useState<number>(0); 
  const [isPerfectBlock, setIsPerfectBlock] = useState<boolean>(true);
  
  // ჯამური ქულების ლოგიკა (დარეფრეშებამდე)
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [totalCorrect, setTotalCorrect] = useState<number>(0);

  // ვითვლით ზედიზედ რამდენჯერ მოხდა Perfect Block
  const [consecutivePerfectBlocks, setConsecutivePerfectBlocks] = useState<number>(0);

  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [showRewardImage, setShowRewardImage] = useState<boolean>(false);
  const [lastPhraseTemplate, setLastPhraseTemplate] = useState<string>("");

  // ტაიმერის ლოგიკა
  const [timeLeft, setTimeLeft] = useState<number>(TIME_LIMIT);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (gameMode) {
      setProblem(generateProblem(gameMode));
      if (gameMode === GameMode.ThomravlebisTabula) {
        startTimer();
      }
    }
  }, [gameMode]);

  useEffect(() => {
    if (gameState === GameState.Playing) {
      inputRef.current?.focus();
    }
  }, [gameState]);

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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!problem || !userAnswer) return;

    stopTimer();

    const val = parseInt(userAnswer, 10);
    if (isNaN(val)) return;

    const isCorrect = val === problem.answer;
    
    // ჯამური სტატისტიკის განახლება
    setTotalQuestions(prev => prev + 1);
    if (isCorrect) setTotalCorrect(prev => prev + 1);

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
      const finalMessage = template.replace("[]", userAnswer);
      
      setCurrentMessage(finalMessage);
      setGameState(GameState.Incorrect);
      setShowRewardImage(false);
    }
  };

  const handleNext = () => {
    if (gameState === GameState.Incorrect) {
      setUserAnswer('');
      setGameState(GameState.Playing);
      if (gameMode === GameMode.ThomravlebisTabula) {
        startTimer();
      }
      return;
    }

    if (gameState === GameState.Correct) {
      if (questionsInBlock >= 3) {
        setQuestionsInBlock(0);
        setIsPerfectBlock(true);
      }

      setProblem(generateProblem(gameMode!));
      setUserAnswer('');
      setGameState(GameState.Playing);
      setShowRewardImage(false);
      if (gameMode === GameMode.ThomravlebisTabula) {
        startTimer();
      }
    }
  };

  if (!gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 flex flex-col items-center justify-center p-4">
        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 md:p-12 text-center space-y-8 border-b-8 border-indigo-200">
          <h1 className="text-4xl font-black text-indigo-900 tracking-tight">
            აირჩიე თამაში 👑
          </h1>
          <div className="grid gap-4">
            <Button 
              onClick={() => setGameMode(GameMode.Thomthematica)}
              className="text-xl py-6 bg-indigo-600 hover:bg-indigo-700"
            >
              თომთემატიკა
            </Button>
            <Button 
              onClick={() => setGameMode(GameMode.ThomravlebisTabula)}
              className="text-xl py-6 bg-purple-600 hover:bg-purple-700"
            >
              თომრავლების ტაბულა
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!problem) return <div className="min-h-screen flex items-center justify-center">იტვირთება...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 flex flex-col items-center justify-center p-4">
      
      <header className="absolute top-0 w-full p-4 md:p-6 text-center flex flex-col md:flex-row justify-between px-4 md:px-10 items-center gap-4">
        <div className="flex items-center gap-4 order-1">
          <button 
            onClick={() => {
              setGameMode(null);
              setProblem(null);
              setQuestionsInBlock(0);
              setIsPerfectBlock(true);
              setTotalQuestions(0);
              setTotalCorrect(0);
              setConsecutivePerfectBlocks(0);
              stopTimer();
            }}
            className="bg-white/60 p-2 rounded-xl hover:bg-white/80 transition-colors border border-indigo-100 text-indigo-900"
            title="მთავარი მენიუ"
          >
            🏠
          </button>
          <h1 className="text-xl md:text-4xl font-black text-indigo-900 tracking-tight">
            {gameMode === GameMode.Thomthematica ? 'თომთემატიკა 👑' : 'თომრავლების ტაბულა ✖️'}
          </h1>
        </div>
        
        {/* ქულების პანელი */}
        <div className="flex gap-2 order-2 md:order-3">
          {gameMode === GameMode.ThomravlebisTabula && gameState === GameState.Playing && (
            <div className={`text-white font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-xl shadow-sm text-sm md:text-base flex flex-col items-center min-w-[80px] transition-colors ${timeLeft <= 3 ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`}>
              <span className="text-[10px] uppercase opacity-80">დრო</span>
              <span className="font-black">{timeLeft}წმ</span>
            </div>
          )}
          <div className="text-indigo-800 font-bold bg-white/60 px-3 py-1.5 md:px-4 md:py-2 rounded-xl shadow-sm text-sm md:text-base border border-indigo-100 flex flex-col items-center min-w-[80px]">
            <span className="text-[10px] uppercase opacity-60">ბლოკი</span>
            <span className="text-indigo-600 font-black">{questionsInBlock}/3</span>
          </div>
          <div className="text-green-800 font-bold bg-white/60 px-3 py-1.5 md:px-4 md:py-2 rounded-xl shadow-sm text-sm md:text-base border border-green-100 flex flex-col items-center min-w-[100px]">
            <span className="text-[10px] uppercase opacity-60">ჯამური ქულა</span>
            <span className="text-green-600 font-black">{totalCorrect}/{totalQuestions}</span>
          </div>
        </div>
      </header>

      <main className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden border-b-8 border-indigo-200 mt-20 md:mt-0">
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />

        <div className="text-center space-y-8">
          <div className="space-y-2">
            <p className="text-gray-500 font-medium uppercase tracking-wider text-sm">
              {problem.missingPart === 'result' ? 'გამოთვალე:' : 'იპოვე გამოტოვებული რიცხვი:'}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-5xl md:text-7xl font-black text-gray-800">
              <span className="text-blue-600">
                {problem.missingPart === 'num1' ? <span className="text-orange-400">?</span> : problem.num1}
              </span>
              <span className="text-purple-500">{problem.operation}</span>
              <span className="text-blue-600">
                {problem.missingPart === 'num2' ? <span className="text-orange-400">?</span> : problem.num2}
              </span>
              {problem.operation2 && problem.num3 !== undefined && (
                <>
                  <span className="text-purple-500">{problem.operation2}</span>
                  <span className="text-blue-600">{problem.num3}</span>
                </>
              )}
              {problem.missingPart !== 'result' && (
                <>
                  <span className="text-gray-400">=</span>
                  <span className="text-gray-800">{problem.equationResult}</span>
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
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
    </div>
  );
};

export default App;

