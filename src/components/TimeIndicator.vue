<template>
  <el-progress
    :percentage="percentage"
    :status="status"
    :show-text="false"
  ></el-progress>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class Speaker extends Vue {
  @Prop() private readonly progress!: number;

  get percentage(): number {
    return 100 - Math.floor(this.progress * 100);
  }

  get status(): string {
    if (this.percentage < 25) {
      return "exception";
    }
    if (this.percentage < 50) {
      return "warning";
    }
    return "success";
  }
}
</script>
