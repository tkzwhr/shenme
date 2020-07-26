import {
  Mutation,
  VuexModule,
  Module,
  getModule
} from "vuex-module-decorators";
import store from "./index";
import SheetStatistics from "@/models/sheetStatistics";
import Bitstack from "@/utils/bitstack";
import { LATEST_ANSWER_HISTORY_COUNT } from "@/const";

export interface SheetStatisticsState {
  items: Array<SheetStatistics>;
}

@Module({
  dynamic: true,
  store,
  name: "sheetStatistics",
  namespaced: true,
  preserveState: localStorage.getItem("vuex") !== null
})
class SheetStatisticsModule extends VuexModule implements SheetStatisticsState {
  items: Array<SheetStatistics> = [];

  @Mutation
  RECORD_TIME(data: { sheetId: string; time: number }) {
    const item = this.items.find(s => s.sheetId === data.sheetId);
    if (item) {
      item.learningTime += data.time;
    } else {
      this.items.push({
        sheetId: data.sheetId,
        learningTime: data.time,
        correct: 0,
        incorrect: 0,
        answeredHistory: "0",
        chained: 0,
        maxChained: 0
      });
    }
  }

  @Mutation
  ANSWER(data: { sheetId: string; isCorrect: boolean }) {
    const item = this.items.find(s => s.sheetId === data.sheetId);
    if (item) {
      const bitstack = new Bitstack(
        BigInt("0x" + item.answeredHistory),
        LATEST_ANSWER_HISTORY_COUNT
      );
      bitstack.add(data.isCorrect);
      item.correct += data.isCorrect ? 1 : 0;
      item.incorrect += data.isCorrect ? 0 : 1;
      item.answeredHistory = bitstack.hex;
      item.chained = data.isCorrect ? item.chained + 1 : 0;
      item.maxChained = Math.max(item.maxChained, item.chained);
    } else {
      this.items.push({
        sheetId: data.sheetId,
        learningTime: 0,
        correct: data.isCorrect ? 1 : 0,
        incorrect: data.isCorrect ? 0 : 1,
        answeredHistory: data.isCorrect ? "1" : "0",
        chained: data.isCorrect ? 1 : 0,
        maxChained: data.isCorrect ? 1 : 0
      });
    }
  }

  @Mutation
  DELETE() {
    this.items = [];
  }
}

const $sheetStatistics = getModule(SheetStatisticsModule, store);
export default $sheetStatistics;
