export default interface SheetStatistics {
  sheetId: string;
  learningTime: number;
  correct: number;
  incorrect: number;
  answeredHistory: string;
  chained: number;
  maxChained: number;
}
