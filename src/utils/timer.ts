import dayjs from "dayjs";
import { Observable, Subject } from "rxjs";

export default class Timer {
  private _remainTime$ = new Subject<number>();

  private _timerId?: number;
  private _requireToStop = false;

  get remainTime$(): Observable<number> {
    return this._remainTime$.asObservable();
  }

  start(interval: number): Promise<void> {
    if (this._timerId) {
      clearInterval(this._timerId);
    }
    this._requireToStop = false;

    return new Promise<void>((resolve, reject) => {
      const target = dayjs().add(interval, "millisecond");
      this._timerId = setInterval(() => {
        if (this._requireToStop) {
          this._requireToStop = false;
          clearInterval(this._timerId);
          resolve();
          return;
        }

        const remainTime = Math.max(target.diff(new Date(), "millisecond"), 0);
        this._remainTime$.next(remainTime);

        if (remainTime === 0) {
          clearInterval(this._timerId);
          reject();
        }
      }, 100);
    });
  }

  stop() {
    this._requireToStop = true;
  }
}
