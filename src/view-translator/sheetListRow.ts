import { SheetListRowView } from "@/components/views.type";
import { SpreadsheetSheetState } from "@/store/spreadsheet";
import Record from "@/models/record";

export function modelToView(
  sheet: SpreadsheetSheetState,
  records: Array<Record>
): SheetListRowView {
  const record = records.find(r => r.sheetId === sheet.sheetId);
  return {
    sheetId: sheet.sheetId,
    sheetName: sheet.sheetName,
    numOfWords: sheet.words.length,
    playCount: record?.playedCount ?? 0,
    accuracy: record?.accuracy ?? null,
    chainedCount: record?.chainedCount ?? null,
    loading: sheet.fetching,
    error: sheet.fetchingErrors.join("\n")
  };
}
