import { SheetListRowView } from "@/components/views.type";
import { SpreadsheetSheetState } from "@/store/spreadsheet";
import SheetStatistics from "@/models/sheetStatistics";

export function modelToView(
  sheet: SpreadsheetSheetState,
  sheetStatistics: Array<SheetStatistics>
): SheetListRowView {
  const s = sheetStatistics.find(s => s.sheetId === sheet.sheetId);
  return {
    sheetId: sheet.sheetId,
    sheetName: sheet.sheetName,
    numOfWords: sheet.words.length,
    learningTime: s?.learningTime ?? 0,
    correct: s?.correct ?? null,
    incorrect: s?.incorrect ?? null,
    chained: s?.chained ?? null,
    loading: sheet.fetching,
    error: sheet.fetchingErrors.join("\n")
  };
}
