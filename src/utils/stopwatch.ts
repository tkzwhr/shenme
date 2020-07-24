import dayjs from "dayjs";
import { BehaviorSubject, Observable } from "rxjs";

export interface StopwatchEvent {
  type: "STOPPED" | "RUNNING";
  elapsed: number;
}

export default class Stopwatch {
  private readonly _event$ = new BehaviorSubject<StopwatchEvent>({
    type: "STOPPED",
    elapsed: 0
  });
  private _begin?: Date;

  get event(): Observable<StopwatchEvent> {
    return this._event$.asObservable();
  }

  start() {
    if (this._begin) {
      this.stop();
    }
    this._begin = new Date();
    this._event$.next({ type: "RUNNING", elapsed: 0 });
  }

  stop() {
    if (this._begin) {
      const elapsed = dayjs().diff(this._begin, "second");
      this._event$.next({ type: "STOPPED", elapsed });
      this._begin = undefined;
    }
    this._event$.next({ type: "STOPPED", elapsed: 0 });
  }
}
