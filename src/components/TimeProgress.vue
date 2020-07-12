<template>
  <div class="level is-mobile">
    <div class="level-left is-vcentered time">
      Time :
    </div>
    <div class="level-right is-vcentered">
      <b-progress
        class="prog"
        :type="type"
        :value="progress"
        size="is-small"
      ></b-progress>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class TimeProgress extends Vue {
  @Prop() private readonly progress!: number;

  get type() {
    if (this.progress <= 25) {
      return "is-danger";
    }
    if (this.progress <= 50) {
      return "is-warning";
    }
    return "is-success";
  }
}
</script>

<style lang="scss" scoped>
.prog {
  width: 10rem;
}
.time {
  margin-right: 4px;
}
progress {
  transition: all 0.2s linear;
}
</style>
