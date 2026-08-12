import { describe, it, expect } from 'vitest';
import { getExpectedDigits, getSolvingSequence } from './columnMultiplication';
import { MathProblem, Operation } from '../types';

describe('columnMultiplication utils', () => {
  it('calculates expected column multiplication digits correctly for 24 x 66', () => {
    // 24 * 66:
    // ones = 6 -> 24 * 6 = 144 -> r1: ["", "1", "4", "4"]
    // tens = 6 -> 24 * 6 = 144 -> r2: ["1", "4", "4", ""]
    // res = 24 * 66 = 1584 -> res: ["1", "5", "8", "4"]
    const digits = getExpectedDigits(24, 66);
    
    expect(digits.r1).toEqual(["", "1", "4", "4"]);
    expect(digits.r2).toEqual(["1", "4", "4", ""]);
    expect(digits.res).toEqual(["1", "5", "8", "4"]);
  });

  it('generates correct solving sequence for problem', () => {
    const problem: MathProblem = {
      num1: 24,
      num2: 66,
      operation: Operation.Multiply,
      answer: 1584,
    };

    const sequence = getSolvingSequence(problem);
    expect(sequence.length).toBe(12);
    expect(sequence[0]).toEqual({ row: 'r1', col: 3 });
    expect(sequence[4]).toEqual({ row: 'r2', col: 3 });
    expect(sequence[8]).toEqual({ row: 'res', col: 3 });
  });

  it('returns empty sequence when problem is null', () => {
    expect(getSolvingSequence(null)).toEqual([]);
  });
});
