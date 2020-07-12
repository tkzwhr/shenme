export default interface Record {
  sheetId: string;
  playedCount: number;
  accuracy: number | null;
  chainedCount: number | null;
}
