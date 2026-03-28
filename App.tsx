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

// ⚠️ აქ ჩასვით Google Apps Script-ის ლინკი
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxB9xOg2joYnEHXYSwtu3vsjrYDM6MgE7aYWFN2-ulVxLTDCYDfHwKJnUD5iySivKaw9w/exec";

type TextPos = { x: string; y: string; anchor?: "start" | "middle" | "end" };
type ShapeVariant = { points: string; texts: TextPos[] };

const IRREGULAR_QUADRILATERALS: ShapeVariant[] = [
  { points: "10,20 90,10 70,90 20,70", texts: [{x:"50", y:"10", anchor:"middle"}, {x:"90", y:"55"}, {x:"45", y:"95", anchor:"middle"}, {x:"5", y:"45", anchor:"end"}] },
  { points: "20,10 80,30 90,80 10,90", texts: [{x:"50", y:"15", anchor:"middle"}, {x:"95", y:"55"}, {x:"50", y:"95", anchor:"middle"}, {x:"5", y:"50", anchor:"end"}] },
  { points: "10,40 60,10 90,60 40,90", texts: [{x:"30", y:"20", anchor:"end"}, {x:"85", y:"30"}, {x:"75", y:"85"}, {x:"20", y:"75", anchor:"end"}] },
  { points: "30,10 90,20 80,90 10,60", texts: [{x:"60", y:"10", anchor:"middle"}, {x:"95", y:"55"}, {x:"45", y:"90", anchor:"middle"}, {x:"10", y:"30", anchor:"end"}] },
  { points: "10,10 90,40 60,90 20,80", texts: [{x:"50", y:"20", anchor:"middle"}, {x:"85", y:"70"}, {x:"40", y:"95", anchor:"middle"}, {x:"5", y:"45", anchor:"end"}] }
];

const IRREGULAR_PENTAGONS: ShapeVariant[] = [
  { points: "40,10 95,20 80,90 10,80 5,40", texts: [{x:"65", y:"10"}, {x:"95", y:"60"}, {x:"45", y:"100", anchor:"middle"}, {x:"0", y:"70", anchor:"end"}, {x:"15", y:"20", anchor:"end"}] },
  { points: "60,10 90,50 60,90 10,80 20,30", texts: [{x:"80", y:"25"}, {x:"85", y:"75"}, {x:"35", y:"95", anchor:"middle"}, {x:"5", y:"60", anchor:"end"}, {x:"35", y:"15", anchor:"end"}] },
  { points: "20,20 80,10 90,60 50,90 10,60", texts: [{x:"50", y:"10", anchor:"middle"}, {x:"95", y:"35"}, {x:"75", y:"85"}, {x:"25", y:"85", anchor:"end"}, {x:"5", y:"40", anchor:"end"}] },
  { points: "30,10 70,20 90,70 40,90 10,50", texts: [{x:"50", y:"10", anchor:"middle"}, {x:"90", y:"40"}, {x:"70", y:"90"}, {x:"20", y:"80", anchor:"end"}, {x:"10", y:"25", anchor:"end"}] },
  { points: "10,30 50,10 90,40 80,90 20,80", texts: [{x:"30", y:"15", anchor:"end"}, {x:"75", y:"20"}, {x:"95", y:"70"}, {x:"50", y:"95", anchor:"middle"}, {x:"5", y:"60", anchor:"end"}] }
];

const IRREGULAR_HEXAGONS: ShapeVariant[] = [
  { points: "30,10 90,5 95,50 70,95 15,85 5,40", texts: [{x:"60", y:"5"}, {x:"100", y:"30"}, {x:"90", y:"80"}, {x:"40", y:"105", anchor:"middle"}, {x:"5", y:"75", anchor:"end"}, {x:"10", y:"20", anchor:"end"}] },
  { points: "20,20 60,10 90,40 80,80 40,90 10,60", texts: [{x:"40", y:"10", anchor:"middle"}, {x:"80", y:"20"}, {x:"95", y:"65"}, {x:"60", y:"95", anchor:"middle"}, {x:"20", y:"85", anchor:"end"}, {x:"5", y:"40", anchor:"end"}] },
  { points: "40,10 80,20 90,60 60,90 20,80 10,40", texts: [{x:"60", y:"10", anchor:"middle"}, {x:"95", y:"35"}, {x:"85", y:"85"}, {x:"40", y:"95", anchor:"middle"}, {x:"10", y:"70", anchor:"end"}, {x:"20", y:"20", anchor:"end"}] },
  { points: "10,40 40,10 80,20 90,70 50,90 20,70", texts: [{x:"20", y:"20", anchor:"end"}, {x:"60", y:"10", anchor:"middle"}, {x:"95", y:"45"}, {x:"75", y:"90"}, {x:"30", y:"90", anchor:"end"}, {x:"5", y:"55", anchor:"end"}] },
  { points: "30,20 70,10 95,50 70,90 30,80 5,50", texts: [{x:"50", y:"10", anchor:"middle"}, {x:"90", y:"25"}, {x:"90", y:"80"}, {x:"50", y:"95", anchor:"middle"}, {x:"10", y:"75", anchor:"end"}, {x:"10", y:"30", anchor:"end"}] }
];

const generateProblem = (mode: GameMode): MathProblem => {
  if (mode === GameMode.Gethometria) {
    const figures: FigureType[] = ['square', 'rectangle', 'triangle', 'pentagon', 'hexagon', 'irregular_pentagon', 'irregular_hexagon', 'irregular_quadrilateral'];
    const figure = figures[Math.floor(Math.random() * figures.length)];
    
    let possibleMeasurements: MeasurementType[] = ['perimeter', 'sidesCount', 'anglesCount'];
    if (figure === 'square' || figure === 'rectangle') {
      possibleMeasurements.push('area');
    }
    const measurement = possibleMeasurements[Math.floor(Math.random() * possibleMeasurements.length)];
    
    let sides: number[] = [];
    let answer = 0;

    const getSidesAndAngles = (fig: FigureType) => {
      switch(fig) {
        case 'triangle': return 3;
        case 'square': case 'rectangle': case 'irregular_quadrilateral': return 4;
        case 'pentagon': case 'irregular_pentagon': return 5;
        case 'hexagon': case 'irregular_hexagon': return 6;
      }
    };

    if (measurement === 'sidesCount' || measurement === 'anglesCount') {
      answer = getSidesAndAngles(figure);
      // Generate dummy sides for visual consistency if needed, though we hide them
      const a = Math.floor(Math.random() * 5) + 3;
      if (figure === 'rectangle') sides = [a, a+2];
      else if (figure === 'triangle') sides = [a, a, a];
      else if (figure === 'irregular_pentagon') sides = [a, a+1, a+2, a-1, a];
      else if (figure === 'irregular_hexagon') sides = [a, a+1, a+2, a-1, a, a+3];
      else if (figure === 'irregular_quadrilateral') sides = [a, a+1, a+2, a-1];
      else sides = [a];
    } else {
      if (figure === 'square') {
        const a = Math.floor(Math.random() * 9) + 2; // 2-დან 10-მდე
        sides = [a];
        answer = measurement === 'perimeter' ? 4 * a : a * a;
      } else if (figure === 'rectangle') {
        const a = Math.floor(Math.random() * 8) + 2;
        let b = Math.floor(Math.random() * 8) + 2;
        while (a === b) b = Math.floor(Math.random() * 8) + 2; // არ უნდა იყოს კვადრატი
        sides = [a, b];
        answer = measurement === 'perimeter' ? 2 * (a + b) : a * b;
      } else if (figure === 'triangle') {
        // ვქმნით ვალიდურ სამკუთხედს (a+b>c, a+c>b, b+c>a)
        const a = Math.floor(Math.random() * 8) + 3;
        const b = Math.floor(Math.random() * 8) + 3;
        const minC = Math.abs(a - b) + 1;
        const maxC = a + b - 1;
        const c = Math.floor(Math.random() * (maxC - minC + 1)) + minC;
        sides = [a, b, c];
        answer = a + b + c;
      } else if (figure === 'pentagon') {
        const a = Math.floor(Math.random() * 6) + 2;
        sides = [a];
        answer = 5 * a;
      } else if (figure === 'hexagon') {
        const a = Math.floor(Math.random() * 6) + 2;
        sides = [a];
        answer = 6 * a;
      } else if (figure === 'irregular_pentagon') {
        sides = Array.from({length: 5}, () => Math.floor(Math.random() * 6) + 2);
        answer = sides.reduce((sum, val) => sum + val, 0);
      } else if (figure === 'irregular_hexagon') {
        sides = Array.from({length: 6}, () => Math.floor(Math.random() * 6) + 2);
        answer = sides.reduce((sum, val) => sum + val, 0);
      } else if (figure === 'irregular_quadrilateral') {
        sides = Array.from({length: 4}, () => Math.floor(Math.random() * 6) + 2);
        answer = sides.reduce((sum, val) => sum + val, 0);
      }
    }

    let shapeVariant: number | undefined;
    if (figure.startsWith('irregular_')) {
      shapeVariant = Math.floor(Math.random() * 5);
    }

    return {
      category: 'geometry',
      figure,
      measurement,
      sides,
      shapeVariant,
      answer
    };
  }

  if (mode === GameMode.ThomravlebisTabula) {
    const n1 = Math.floor(Math.random() * 11); // 0-10
    const n2 = Math.floor(Math.random() * 11); // 0-10
    const equationResult = n1 * n2;
    return {
      category: 'math',
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
          category: 'math',
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
    category: 'math',
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

  // ვინახავთ მიმდინარე სტატისტიკას რეფში, რომ unload-ის დროს სწორი მონაცემები გავაგზავნოთ
  const statsRef = useRef({ mode: gameMode, total: totalQuestions, correct: totalCorrect });
  const lastSentStatsRef = useRef({ total: 0, correct: 0 });

  useEffect(() => {
    statsRef.current = { mode: gameMode, total: totalQuestions, correct: totalCorrect };
  }, [gameMode, totalQuestions, totalCorrect]);

  // მონაცემების გაგზავნა Google Sheets-ში
  const sendDataToSheets = (mode: GameMode, total: number, correct: number) => {
    if (total === 0 || GOOGLE_SHEETS_URL === "YOUR_WEB_APP_URL_HERE") return;
    
    const deltaTotal = total - lastSentStatsRef.current.total;
    const deltaCorrect = correct - lastSentStatsRef.current.correct;
    
    if (deltaTotal <= 0) return; // ახალი მონაცემი არ არის
    
    const modeName = mode === GameMode.Thomthematica ? 'თომთემატიკა' : 
                     mode === GameMode.ThomravlebisTabula ? 'თომრავლების ტაბულა' : 'გეთომეტრია';
    const payload = JSON.stringify({ gameMode: modeName, totalQuestions: deltaTotal, totalCorrect: deltaCorrect });
    
    lastSentStatsRef.current = { total, correct };

    // მობილურებისთვის sendBeacon ბევრად საიმედოა
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

  // ბრაუზერის ან ტაბის გათიშვისას მონაცემების გაგზავნა (მობილურის მხარდაჭერით)
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
            <Button 
              onClick={() => setGameMode(GameMode.Gethometria)}
              className="text-xl py-6 bg-green-600 hover:bg-green-700"
            >
              გეთომეტრია 📐
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
              lastSentStatsRef.current = { total: 0, correct: 0 }; // ვანულებთ შემდეგი თამაშისთვის
              stopTimer();
            }}
            className="bg-white/60 p-2 rounded-xl hover:bg-white/80 transition-colors border border-indigo-100 text-indigo-900"
            title="მთავარი მენიუ"
          >
            🏠
          </button>
          <h1 className="text-xl md:text-4xl font-black text-indigo-900 tracking-tight">
            {gameMode === GameMode.Thomthematica ? 'თომთემატიკა 👑' : 
             gameMode === GameMode.ThomravlebisTabula ? 'თომრავლების ტაბულა ✖️' : 'გეთომეტრია 📐'}
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
          {problem.category === 'geometry' ? (
            <div className="space-y-6">
              <p className="text-gray-500 font-medium uppercase tracking-wider text-sm md:text-base">
                {problem.measurement === 'sidesCount' ? 'რამდენი გვერდი აქვს ამ ფიგურას?' : 
                 problem.measurement === 'anglesCount' ? 'რამდენი კუთხე აქვს ამ ფიგურას?' : (
                  <>
                    გამოთვალე {
                      problem.figure === 'irregular_quadrilateral' ? 'ოთხკუთხედის' : 
                      problem.figure === 'square' ? 'კვადრატის' : 
                      problem.figure === 'rectangle' ? 'მართკუთხედის' : 
                      problem.figure === 'triangle' ? 'სამკუთხედის' : 
                      (problem.figure === 'pentagon' || problem.figure === 'irregular_pentagon') ? 'ხუთკუთხედის' : 'ექვსკუთხედის'
                    } <span className="text-indigo-600 font-bold">{problem.measurement === 'perimeter' ? 'პერიმეტრი' : 'ფართობი'}</span>:
                  </>
                )}
              </p>
              
              {/* წესიერი ფიგურებისთვის მინიშნება */}
              {(problem.figure === 'pentagon' || problem.figure === 'hexagon') && problem.measurement === 'perimeter' && (
                <p className="text-pink-500 font-bold text-sm -mt-4 mb-4">
                  (ყველა გვერდი ერთმანეთის ტოლია)
                </p>
              )}
              
              <div className="relative flex items-center justify-center py-8">
                {problem.figure === 'square' && (
                  <div className="relative w-32 h-32 border-4 border-blue-500 bg-blue-100/50 shadow-inner">
                    {(problem.measurement === 'perimeter' || problem.measurement === 'area') && (
                      <>
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-2xl text-blue-700">{problem.sides![0]}</span>
                        <span className="absolute -right-8 top-1/2 -translate-y-1/2 font-bold text-2xl text-blue-700">{problem.sides![0]}</span>
                      </>
                    )}
                  </div>
                )}
                {problem.figure === 'rectangle' && (
                  <div className="relative w-48 h-32 border-4 border-green-500 bg-green-100/50 shadow-inner">
                    {(problem.measurement === 'perimeter' || problem.measurement === 'area') && (
                      <>
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-2xl text-green-700">{problem.sides![0]}</span>
                        <span className="absolute -right-8 top-1/2 -translate-y-1/2 font-bold text-2xl text-green-700">{problem.sides![1]}</span>
                      </>
                    )}
                  </div>
                )}
                {problem.figure === 'triangle' && (
                  <div className="relative w-48 h-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                      <polygon points="50,10 10,90 90,90" fill="rgba(168, 85, 247, 0.2)" stroke="#a855f7" strokeWidth="4" strokeLinejoin="round" />
                      {problem.measurement === 'perimeter' && (
                        <>
                          <text x="20" y="50" className="text-lg font-bold fill-purple-700">{problem.sides![0]}</text>
                          <text x="80" y="50" className="text-lg font-bold fill-purple-700">{problem.sides![1]}</text>
                          <text x="50" y="110" className="text-lg font-bold fill-purple-700" textAnchor="middle">{problem.sides![2]}</text>
                        </>
                      )}
                    </svg>
                  </div>
                )}
                {problem.figure === 'pentagon' && (
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                      <polygon points="50,5 95,38 78,95 22,95 5,38" fill="rgba(236, 72, 153, 0.2)" stroke="#ec4899" strokeWidth="4" strokeLinejoin="round" />
                      {problem.measurement === 'perimeter' && (
                        <text x="50" y="110" className="text-lg font-bold fill-pink-600" textAnchor="middle">{problem.sides![0]}</text>
                      )}
                    </svg>
                  </div>
                )}
                {problem.figure === 'irregular_pentagon' && (
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                      <polygon points={IRREGULAR_PENTAGONS[problem.shapeVariant || 0].points} fill="rgba(236, 72, 153, 0.2)" stroke="#ec4899" strokeWidth="4" strokeLinejoin="round" />
                      {problem.measurement === 'perimeter' && IRREGULAR_PENTAGONS[problem.shapeVariant || 0].texts.map((pos, idx) => (
                        <text key={idx} x={pos.x} y={pos.y} className="text-sm font-bold fill-pink-600" textAnchor={pos.anchor || "start"}>{problem.sides![idx]}</text>
                      ))}
                    </svg>
                  </div>
                )}
                {problem.figure === 'hexagon' && (
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                      <polygon points="50,5 93,25 93,75 50,95 7,75 7,25" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="4" strokeLinejoin="round" />
                      {problem.measurement === 'perimeter' && (
                        <text x="50" y="110" className="text-lg font-bold fill-amber-600" textAnchor="middle">{problem.sides![0]}</text>
                      )}
                    </svg>
                  </div>
                )}
                {problem.figure === 'irregular_hexagon' && (
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                      <polygon points={IRREGULAR_HEXAGONS[problem.shapeVariant || 0].points} fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="4" strokeLinejoin="round" />
                      {problem.measurement === 'perimeter' && IRREGULAR_HEXAGONS[problem.shapeVariant || 0].texts.map((pos, idx) => (
                        <text key={idx} x={pos.x} y={pos.y} className="text-sm font-bold fill-amber-600" textAnchor={pos.anchor || "start"}>{problem.sides![idx]}</text>
                      ))}
                    </svg>
                  </div>
                )}
                {problem.figure === 'irregular_quadrilateral' && (
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                      <polygon points={IRREGULAR_QUADRILATERALS[problem.shapeVariant || 0].points} fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="4" strokeLinejoin="round" />
                      {problem.measurement === 'perimeter' && IRREGULAR_QUADRILATERALS[problem.shapeVariant || 0].texts.map((pos, idx) => (
                        <text key={idx} x={pos.x} y={pos.y} className="text-sm font-bold fill-blue-600" textAnchor={pos.anchor || "start"}>{problem.sides![idx]}</text>
                      ))}
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ) : (
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
          )}

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
