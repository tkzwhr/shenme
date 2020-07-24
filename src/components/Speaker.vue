<template>
  <b-button
    class="speaker"
    :type="disabled ? null : 'is-primary'"
    :disabled="disabled || inactive"
    rounded
    size="is-large"
    icon-right="headphones"
    @click="speak"
  ></b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";

@Component
export default class Speaker extends Vue {
  @Prop() private readonly disabled!: boolean;
  @Prop() private readonly inactive!: boolean;

  @Emit() speak() {
    return;
  }
}
</script>

<style lang="scss" scoped>
button.speaker {
  font-size: 300%;
}
</style>
