<template>
  <div class="level is-mobile">
    <div class="level-left is-vcentered progress-label">
      Progress :
    </div>
    <div class="level-right is-vcentered">
      <b-progress class="progress-bar" :max="max" :value="progress" show-value
        >{{ progress }} / {{ max }}</b-progress
      >
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class TimeProgress extends Vue {
  @Prop() private readonly max!: number;
  @Prop() private readonly progress!: number;
}
</script>

<style lang="scss" scoped>
.progress-bar {
  width: 12rem;
}
.progress-label {
  margin-right: 4px;
}
progress {
  transition: all 0.2s linear;
}
</style>
