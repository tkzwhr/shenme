import {
  Mutation,
  Action,
  VuexModule,
  Module,
  getModule
} from "vuex-module-decorators";
import store from "./index";
import SheetStatistics from "@/models/sheetStatistics";

export interface DailyStatisticsState {
  items: Array<SheetStatistics>;
}

@Module({
  dynamic: true,
  store,
  name: "sheetStatistics",
  namespaced: true,
  preserveState: localStorage.getItem("vuex") !== null
})
class SheetStatisticsModule extends VuexModule implements DailyStatisticsState {
  items: Array<SheetStatistics> = [];

  get find(): (sheetId: string) => SheetStatistics | undefined {
    return (sheetId: string) => {
      const found = this.items.find(s => s.sheetId === sheetId);
      if (found) {
        return Object.assign({}, found);
      }
      return undefined;
    };
  }

  @Mutation
  STORE(data: SheetStatistics) {
    this.items = this.items.filter(s => s.sheetId !== data.sheetId);
    this.items.push(data);
  }

  @Mutation
  DELETE() {
    this.items = [];
  }

  @Action({ commit: "STORE" })
  answer(data: { sheetId: string; time: number; isCorrect: boolean }) {
    const statistics = (this.context.getters as SheetStatisticsModule).find(
      data.sheetId
    ) ?? {
      sheetId: data.sheetId,
      learningTime: 0,
      correct: 0,
      incorrect: 0,
      answeredHistory: "0",
      chained: 0
    };
    statistics.learningTime += data.time;
    statistics.correct += data.isCorrect ? 1 : 0;
    statistics.incorrect += data.isCorrect ? 0 : 1;
    statistics.answeredHistory = "0"; // TODO
    statistics.chained = data.isCorrect ? statistics.chained + 1 : 0;
    return statistics;
  }
}

const $sheetStatistics = getModule(SheetStatisticsModule, store);
export default $sheetStatistics;
