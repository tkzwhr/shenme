import dayjs from "dayjs";
import { BehaviorSubject, Observable } from "rxjs";

export interface TimerEvent {
  type: "STOPPED" | "RUNNING" | "TIME_IS_UP";
  remain: number;
}

export default class Timer {
  private readonly _event$ = new BehaviorSubject<TimerEvent>({
    type: "STOPPED",
    remain: 0
  });
  private _interval = 2000;
  private _target?: dayjs.Dayjs;
  private _timerId?: number;

  get event(): Observable<TimerEvent> {
    return this._event$.asObservable();
  }

  setInterval(interval: number) {
    this._interval = interval;
  }

  start() {
    if (this._timerId) {
      this.stop();
    }
    this._target = dayjs().add(this._interval, "millisecond");
    this._timerId = setInterval(() => {
      if (this._target) {
        const remain = Math.max(
          this._target.diff(new Date(), "millisecond"),
          0
        );
        this._event$.next({ type: "RUNNING", remain });
        if (remain === 0) {
          this._event$.next({ type: "TIME_IS_UP", remain: 0 });
          this.stop();
        }
      }
    }, 100);
  }

  stop() {
    if (this._timerId) {
      clearInterval(this._timerId);
    }
    this._target = undefined;
    this._timerId = undefined;
    this._event$.next({ type: "STOPPED", remain: 0 });
  }
}
