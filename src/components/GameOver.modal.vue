<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Game is over</p>
    </header>
    <section class="modal-card-body">
      {{ message }}
    </section>
    <footer class="modal-card-foot">
      <button
        class="button"
        type="button"
        @click="
          () => {
            close();
            exit();
          }
        "
      >
        Exit
      </button>
      <button
        class="button is-primary"
        @click="
          () => {
            close();
            retry();
          }
        "
      >
        Retry
      </button>
    </footer>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from "vue-property-decorator";

@Component
export default class GameOverModal extends Vue {
  @Prop() private readonly message!: string;

  @Emit() retry() {
    return;
  }
  @Emit() exit() {
    return;
  }

  close() {
    (this.$parent as any).close();
  }
}
</script>

<style lang="scss" scoped>
.modal-card {
  width: auto;
}
</style>
