import {
  Mutation,
  VuexModule,
  Module,
  getModule
} from "vuex-module-decorators";
import store from "./index";
import DailyStatistics from "@/models/dailyStatistics";
import dayjs from "dayjs";

export interface DailyStatisticsState {
  items: Array<DailyStatistics>;
}

@Module({
  dynamic: true,
  store,
  name: "dailyStatistics",
  namespaced: true,
  preserveState: localStorage.getItem("vuex") !== null
})
class DailyStatisticsModule extends VuexModule implements DailyStatisticsState {
  items: Array<DailyStatistics> = [];

  @Mutation
  RECORD_TIME(time: number) {
    const today = dayjs().startOf("day");
    const item = this.items.find(s => today.isSame(s.date, "day"));
    if (item) {
      item.learningTime += time;
    } else {
      this.items.push({
        date: today.toISOString(),
        learningTime: time,
        correct: 0,
        incorrect: 0
      });
    }
  }

  @Mutation
  ANSWER(isCorrect: boolean) {
    const today = dayjs().startOf("day");
    const item = this.items.find(s => today.isSame(s.date, "day"));
    if (item) {
      item.correct += isCorrect ? 1 : 0;
      item.incorrect += isCorrect ? 0 : 1;
    } else {
      this.items.push({
        date: today.toISOString(),
        learningTime: 0,
        correct: isCorrect ? 1 : 0,
        incorrect: isCorrect ? 0 : 1
      });
    }
  }

  @Mutation
  DELETE() {
    this.items = [];
  }
}

const $dailyStatistics = getModule(DailyStatisticsModule, store);
export default $dailyStatistics;
