import {
  Mutation,
  Action,
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

  get find(): (date: Date) => DailyStatistics | undefined {
    return (date: Date) => {
      const today = dayjs(date).startOf("day");
      const found = this.items.find(s => today.isSame(s.date, "day"));
      if (found) {
        return Object.assign({}, found);
      }
      return undefined;
    };
  }

  @Mutation
  STORE(data: DailyStatistics) {
    const today = dayjs(data.date).startOf("day");
    this.items = this.items.filter(s => !today.isSame(s.date, "day"));
    this.items.push(data);
  }

  @Mutation
  DELETE() {
    this.items = [];
  }

  @Action({ commit: "STORE" })
  answer(data: { time: number; isCorrect: boolean }) {
    const today = new Date();
    const statistics = (this.context.getters as DailyStatisticsModule).find(
      today
    ) ?? {
      date: dayjs(today)
        .startOf("day")
        .toDate(),
      learningTime: 0,
      correct: 0,
      incorrect: 0
    };
    statistics.learningTime += data.time;
    statistics.correct += data.isCorrect ? 1 : 0;
    statistics.incorrect += data.isCorrect ? 0 : 1;
    return statistics;
  }
}

const $dailyStatistics = getModule(DailyStatisticsModule, store);
export default $dailyStatistics;
