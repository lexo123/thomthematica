import React, { useState, useCallback } from 'react';
import { ColMultState, MathProblem } from '../types';
import { getSolvingSequence } from '../utils/columnMultiplication';

export const INITIAL_COL_MULT_STATE: ColMultState = {
  r1: ['', '', '', ''],
  r2: ['', '', '', ''],
  res: ['', '', '', '']
};

export const useColumnMultiplication = (problem: MathProblem | null) => {
  const [colMultState, setColMultState] = useState<ColMultState>(INITIAL_COL_MULT_STATE);
  const [showKveshValidation, setShowKveshValidation] = useState<boolean>(false);
  const [hasKveshFailedThisQuestion, setHasKveshFailedThisQuestion] = useState<boolean>(false);

  const resetColMultState = useCallback(() => {
    setColMultState({
      r1: ['', '', '', ''],
      r2: ['', '', '', ''],
      res: ['', '', '', '']
    });
    setShowKveshValidation(false);
    setHasKveshFailedThisQuestion(false);
  }, []);

  const isColMultFilled = useCallback(() => {
    if (!problem) return false;
    return colMultState.r1.some(v => v !== '') || 
           colMultState.r2.some(v => v !== '') || 
           colMultState.res.some(v => v !== '');
  }, [problem, colMultState]);

  const handleCellChange = useCallback((row: 'r1' | 'r2' | 'res', colIndex: number, val: string) => {
    if (val === '') {
      setColMultState(prev => ({
        ...prev,
        [row]: prev[row].map((c, idx) => idx === colIndex ? '' : c)
      }));
      return;
    }

    const digit = val.slice(-1);
    if (!/^[0-9]$/.test(digit)) return;

    setColMultState(prev => ({
      ...prev,
      [row]: prev[row].map((c, idx) => idx === colIndex ? digit : c)
    }));

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
  }, [problem]);

  const handleKeyDown = useCallback((row: 'r1' | 'r2' | 'res', colIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (colMultState[row][colIndex] !== '') {
        setColMultState(prev => ({
          ...prev,
          [row]: prev[row].map((c, idx) => idx === colIndex ? '' : c)
        }));
        return;
      }

      if (problem) {
        const sequence = getSolvingSequence(problem);
        const currentIndex = sequence.findIndex(item => item.row === row && item.col === colIndex);
        if (currentIndex > 0) {
          const prevCell = sequence[currentIndex - 1];
          setColMultState(prev => ({
            ...prev,
            [prevCell.row]: prev[prevCell.row].map((c, idx) => idx === prevCell.col ? '' : c)
          }));
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
  }, [problem, colMultState]);

  return {
    colMultState,
    setColMultState,
    showKveshValidation,
    setShowKveshValidation,
    hasKveshFailedThisQuestion,
    setHasKveshFailedThisQuestion,
    handleCellChange,
    handleKeyDown,
    isColMultFilled,
    resetColMultState
  };
};
