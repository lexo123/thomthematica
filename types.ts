export enum GameMode {
  Thomthematica = 'thomthematica',
  ThomravlebisTabula = 'thomravlebis_tabula',
  Gethometria = 'gethometria'
}

export enum Operation {
  Add = '+',
  Subtract = '-',
  Multiply = '×',
  Divide = '÷'
}

export type MissingPart = 'num1' | 'num2' | 'num3' | 'result';

export type ProblemCategory = 'math' | 'geometry';
export type FigureType = 'square' | 'rectangle' | 'triangle' | 'pentagon' | 'hexagon' | 'irregular_pentagon' | 'irregular_hexagon' | 'irregular_quadrilateral';
export type MeasurementType = 'perimeter' | 'area' | 'sidesCount' | 'anglesCount';

export interface MathProblem {
  category?: ProblemCategory; // default 'math'
  
  // მათემატიკის ველები
  num1?: number;
  num2?: number;
  num3?: number;       // მესამე რიცხვი (არასავალდებულო)
  operation?: Operation;
  operation2?: Operation; // მეორე მოქმედება (არასავალდებულო)
  missingPart?: MissingPart; // რომელი ნაწილია გამოსაცნობი
  equationResult?: number;   // განტოლების რეალური შედეგი (ვიზუალიზაციისთვის)
  
  // გეომეტრიის ველები
  figure?: FigureType;
  measurement?: MeasurementType;
  sides?: number[]; // [a] კვადრატისთვის, [a,b] მართკუთხედისთვის, [a,b,c] სამკუთხედისთვის
  shapeVariant?: number; // არაწესიერი ფიგურების ვიზუალური ვარიანტისთვის
  
  // საერთო
  answer: number;      // რიცხვი, რომელიც მომხმარებელმა უნდა შეიყვანოს
}

export enum GameState {
  Playing,
  Correct,
  Incorrect
}