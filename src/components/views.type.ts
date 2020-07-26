export interface SheetListRowView {
  sheetId: string;
  sheetName: string;
  numOfWords: number;
  learningTime: number;
  answered: number | null;
  correctRate: number | null;
  maxChained: number | null;
  loading: boolean;
  error: string;
}

export interface SettingsView {
  learningLanguage: string;
  gameMode: string;
  questionMode: string;
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
