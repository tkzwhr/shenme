export interface SheetListRowView {
  sheetId: string;
  sheetName: string;
  numOfWords: number;
  playCount: number;
  accuracy: number | null;
  chainedCount: number | null;
  loading: boolean;
  error: string;
}

export interface SettingsView {
  gameMode: string;
  answerTime: number;
  limitToListen: number;
  numOfQuestions: number;
}
