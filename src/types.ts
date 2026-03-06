export enum GameMode {
  Thomthematica = 'thomthematica',
  ThomravlebisTabula = 'thomravlebis_tabula'
}

export enum Operation {
  Add = '+',
  Subtract = '-',
  Multiply = '×',
  Divide = '÷'
}

export type MissingPart = 'num1' | 'num2' | 'num3' | 'result';

export interface MathProblem {
  num1: number;
  num2: number;
  num3?: number;
  operation: Operation;
  operation2?: Operation;
  answer: number;
  missingPart: MissingPart;
  equationResult: number;
}

export enum GameState {
  Playing,
  Correct,
  Incorrect
}
