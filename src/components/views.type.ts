export interface SheetListRowView {
  sheetId: string;
  sheetName: string;
  numOfWords: number;
  learningTime: number;
  correct: number | null;
  incorrect: number | null;
  chained: number | null;
  loading: boolean;
  error: string;
}

export interface SettingsView {
  gameMode: string;
  answerTime: number;
  limitToListen: number;
  numOfQuestions: number;
}

export interface DailyStatisticsView {
  date: string;
  learningTime: number;
  correct: number;
  incorrect: number;
}

export interface GroupedDailyStatisticsView
  extends Omit<DailyStatisticsView, "date"> {
  yearMonth: string;
  items: Array<DailyStatisticsView>;
}
