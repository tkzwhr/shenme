import dayjs from "dayjs";

export default class Stopwatch {
  private _begin?: Date;
  private _latestTime?: number;

  get latestTime(): number {
    return this._latestTime ?? 0;
  }

  start() {
    if (this._begin) {
      this.stop();
    }
    this._begin = new Date();
  }

  stop() {
    if (this._begin) {
      this._latestTime = dayjs().diff(this._begin, "second");
      this._begin = undefined;
    }
  }
}
