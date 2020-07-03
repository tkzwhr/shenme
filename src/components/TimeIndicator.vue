<template>
  <el-progress
    :percentage="Math.round(percentage)"
    :status="status"
    :show-text="false"
  ></el-progress>
</template>

<script lang="ts">
  import { Component, Vue, Emit, Prop, Watch } from 'vue-property-decorator';

  @Component
  export default class Speaker extends Vue {
    @Prop() private readonly command!: string;

    private initial = 0;
    private percentage = 0;
    private isActive = false;
    private status: string | null = null;

    @Watch('command', { immediate: true })
    setTimer(value: string) {
      if (value === 'start') {
        this.isActive = true;
        this.tick(0);
      } else if (value === 'stop') {
        this.isActive = false;
      } else if (value.startsWith("set:")) {
        this.percentage = 100;
        this.status = null;
        this.initial = parseInt(value.split(":")[1]) / 250;
      }
    }

    tick(current: number) {
      if (!this.isActive) {
        return;
      }

      this.percentage = (1 - current / this.initial) * 100;
      this.status = this.percentage <= 25.0 ? "warning" : null;

      if (current >= this.initial) {
        this.status = "exception";
        this.timeOver();
        return;
      }

      setTimeout(() => {
        this.tick(current + 1);
      }, 250);
    }

    @Emit()
    timeOver() {
      return;
    }
  }
</script>

<style>
  .custom-icon {
    font-size: 10vh;
  }
</style>
