import { Mutation, Action, VuexModule, Module, getModule } from 'vuex-module-decorators';
import dayjs, { Dayjs } from 'dayjs';
import store from './index';

export interface TimerState {
  duration: number;
  currentDate: Date | null;
  beginDate: Dayjs | null;
  timeIntervalId: number | null;
}

@Module({
  dynamic: true,
  store,
  name: "timer",
  namespaced: true
})
class Timer extends VuexModule implements TimerState {
  duration = 0;
  currentDate: Date | null = null;
  beginDate: Dayjs | null = null;
  timeIntervalId: number | null = null;

  get timeProgress(): number {
    if (!this.currentDate || !this.beginDate) {
      return 0;
    }

    const elapsed = this.beginDate.diff(this.currentDate, 'ms');
    return Math.min(-elapsed / this.duration, 1.0);
  }

  @Mutation
  SET_DURATION(payload: number) {
    this.duration = payload;
  }

  @Mutation
  SET_CURRENT_TIME() {
    this.currentDate = new Date();
  }

  @Mutation
  START_TIMER() {
    this.beginDate = dayjs(new Date());
    this.currentDate = new Date();
  }

  @Mutation
  SET_TIME_INTERVAL_ID(payload: number) {
    this.timeIntervalId = payload;
  }

  @Mutation
  STOP_TIMER() {
    if (this.timeIntervalId) {
      clearInterval(this.timeIntervalId);
    }
    this.timeIntervalId = null;
  }

  @Mutation
  RESET_TIMER() {
    this.beginDate = null;
    this.currentDate = null;
  }

  @Action({ rawError: true })
  async runTimer() {
    this.context.commit('START_TIMER');
    const promise = new Promise(resolve => {
      const intervalId = setInterval(() => {
        const isRunning = (this.context.state as any).beginDate !== null;
        if (!isRunning) {
          this.context.commit('STOP_TIMER');
          resolve();
          return;
        }

        this.context.commit('SET_CURRENT_TIME');

        const currentProgress: number = (this.context.getters as any).timeProgress;
        if (currentProgress >= 1.0) {
          this.context.commit('STOP_TIMER');
          resolve();
          return;
        }
      }, 200);
      this.context.commit('SET_TIME_INTERVAL_ID', intervalId);
    });
    await promise;
  }
}

const $timer = getModule(Timer, store);
export default $timer;
