export default class Bitstack {
  private value: bigint;

  constructor(initial: bigint, private digit: number) {
    const binStr = initial.toString(2).substr(-digit);
    this.value = BigInt("0b" + binStr);
  }

  get bin(): string {
    return this.value.toString(2);
  }

  get hex(): string {
    return this.value.toString(16);
  }

  get rate(): number {
    const hit = this.bin.substr(-this.digit).replace(/0/g, "").length;
    return hit / this.digit;
  }

  add(bit: boolean) {
    this.value <<= 1n;
    if (bit) {
      this.value += 1n;
    }
    this.value = BigInt("0b" + this.bin.substr(-this.digit));
  }
}
