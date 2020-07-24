import { SheetListRowView } from "@/components/views.type";
import { SpreadsheetSheetState } from "@/store/spreadsheet";
import SheetStatistics from "@/models/sheetStatistics";
import Bitstack from "@/utils/bitstack";

export function modelToView(
  sheet: SpreadsheetSheetState,
  sheetStatistics: Array<SheetStatistics>
): SheetListRowView {
  const s = sheetStatistics.find(s => s.sheetId === sheet.sheetId);
  const bitstack = new Bitstack(BigInt("0x" + (s?.answeredHistory ?? "0")), 50);
  return {
    sheetId: sheet.sheetId,
    sheetName: sheet.sheetName,
    numOfWords: sheet.words.length,
    learningTime: s?.learningTime ?? 0,
    answered: s ? s.correct + s.incorrect : null,
    correctRate: s ? bitstack.rate : null,
    maxChained: s?.maxChained ?? null,
    loading: sheet.fetching,
    error: sheet.fetchingErrors.join("\n")
  };
}
