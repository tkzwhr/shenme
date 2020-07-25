import dayjs from "dayjs";

export function date(value: Date): string {
  return dayjs(value).format("YYYY-MM-DD");
}

export function time(value: number): string {
  const zp = (v: number): string => ("0" + v).substr(-2);
  const h = Math.floor(value / 3600);
  const m = Math.floor((value % 3600) / 60);
  const s = value % 60;
  return `${h}:${zp(m)}:${zp(s)}`;
}

export function percentage(value: number): string {
  return `${Math.round(value * 1000) / 10} %`;
}
