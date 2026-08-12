import { describe, it, expect } from 'vitest';
import { generateProblem } from './problemGenerator';
import { GameMode, Operation } from '../types';

describe('problemGenerator', () => {
  it('generates column multiplication problems with non-zero 2-digit numbers', () => {
    for (let i = 0; i < 10; i++) {
      const problem = generateProblem(GameMode.Kveshmicera, i);
      expect(problem.num1).toBeGreaterThanOrEqual(11);
      expect(problem.num1).toBeLessThanOrEqual(99);
      expect(problem.num2).toBeGreaterThanOrEqual(11);
      expect(problem.num2).toBeLessThanOrEqual(99);
      expect(problem.operation).toBe(Operation.Multiply);
      expect(problem.answer).toBe(problem.num1! * problem.num2!);
    }
  });

  it('generates geometry problems with positive answers and valid figures', () => {
    for (let i = 0; i < 15; i++) {
      const problem = generateProblem(GameMode.Gethometria, i);
      expect(problem.category).toBe('geometry');
      expect(problem.figure).toBeDefined();
      expect(problem.measurement).toBeDefined();
      expect(problem.sides).toBeDefined();
      expect(problem.answer).toBeGreaterThan(0);
    }
  });

  it('generates arithmetic problems with valid answers and operations', () => {
    for (let i = 0; i < 20; i++) {
      const problem = generateProblem(GameMode.Thomthematica, i);
      expect(problem.num1).toBeDefined();
      expect(problem.num2).toBeDefined();
      expect(problem.operation).toBeDefined();
      expect(typeof problem.answer).toBe('number');
      expect(Number.isNaN(problem.answer)).toBe(false);
    }
  });

  it('generates multiplication table problems within expected ranges', () => {
    for (let i = 0; i < 20; i++) {
      const problem = generateProblem(GameMode.ThomravlebisTabula, i);
      expect(problem.operation).toBe(Operation.Multiply);
      expect(problem.answer).toBe(problem.num1! * problem.num2!);
    }
  });
});
