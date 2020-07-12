<template>
  <div class="columns is-multiline" v-if="options.length === 4">
    <div v-for="i in [0, 1, 2, 3]" :key="i" class="column is-half">
      <b-button
        class="answer"
        expanded
        :type="type(i)"
        :outlined="type(i) === null"
        :disabled="disabled"
        @click="checkAnswer(options[i])"
        >{{ options[i] }}</b-button
      >
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Watch, Vue } from "vue-property-decorator";

@Component
export default class AnswersPanel extends Vue {
  @Prop() private readonly disabled!: boolean;
  // noinspection JSMismatchedCollectionQueryUpdate
  @Prop() private readonly options!: Array<string>;
  @Prop() private readonly correct!: string | null;

  @Emit() answered(value: any): any {
    return value;
  }

  private selected!: string | null;

  get type(): (index: number) => string | null {
    return (index: number) => {
      if (this.correct !== null) {
        if (this.options[index] === this.correct) {
          return "is-success";
        }
        if (this.options[index] === this.selected) {
          return "is-danger";
        }
      }
      return null;
    };
  }

  @Watch("options")
  onOptionsChanged() {
    this.selected = null;
  }

  checkAnswer(answer: string) {
    this.selected = answer;
    this.answered(answer);
  }
}
</script>
