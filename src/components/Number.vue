<template>
  <span>
    <!--suppress HtmlUnknownTarget -->
    <img
      v-for="num in numberArray"
      class="num"
      :key="num.i"
      :src="images[num.n]"
      :alt="num.n"
    />
  </span>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

interface Num {
  i: number;
  n: number;
}

function zeroPadding(number: number, length: number): string {
  if (number.toString().length > length) {
    return number.toString();
  }
  return (Array(length).join("0") + number.toString()).slice(-length);
}

@Component
export default class Number extends Vue {
  @Prop() private readonly number!: number;
  @Prop() private readonly length?: number;

  private images = [
    require("@/assets/num/0.png"),
    require("@/assets/num/1.png"),
    require("@/assets/num/2.png"),
    require("@/assets/num/3.png"),
    require("@/assets/num/4.png"),
    require("@/assets/num/5.png"),
    require("@/assets/num/6.png"),
    require("@/assets/num/7.png"),
    require("@/assets/num/8.png"),
    require("@/assets/num/9.png")
  ];

  get numberArray(): Array<Num> {
    return zeroPadding(this.number, this.length ?? 1)
      .split("")
      .map((n: any, i: any) => ({
        i: i,
        n: parseInt(n)
      }));
  }
}
</script>

<style lang="scss" scoped>
.num {
  position: relative;
  bottom: -2px;
}
</style>
