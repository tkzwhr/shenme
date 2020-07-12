<template>
  <b-button
    :type="disabled ? null : 'is-primary'"
    rounded
    size="is-large"
    icon-right="headphones"
    :disabled="disabled || isSpeaking"
    @click="speak"
  ></b-button>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";

@Component
export default class Speaker extends Vue {
  @Prop() private readonly disabled!: boolean;
  @Prop() private readonly isSpeaking!: boolean;

  @Emit() speak() {
    return;
  }
}
</script>
