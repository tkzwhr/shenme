export default class Bitstack {
  private _value: bigint;

  constructor(initial: bigint, private _digit: number) {
    const binStr = initial.toString(2).substr(-_digit);
    this._value = BigInt("0b" + binStr);
  }

  get bin(): string {
    return this._value.toString(2);
  }

  get hex(): string {
    return this._value.toString(16);
  }

  get rate(): number {
    const hit = this.bin.substr(-this._digit).replace(/0/g, "").length;
    return hit / this._digit;
  }

  add(bit: boolean) {
    this._value <<= 1n;
    if (bit) {
      this._value += 1n;
    }
    this._value = BigInt("0b" + this.bin.substr(-this._digit));
  }
}
