<template>
  <div>
    <el-row class="options-row" type="flex" justify="space-around">
      <el-col :span="11">
        <el-button
          class="option"
          :type="buttonType(0)"
          :disabled="disabled"
          rounded
          @click="e => onSelected(e, question.options[0])"
        >
          {{question.options[0]}}
        </el-button>
      </el-col>
      <el-col :span="11">
        <el-button
          class="option"
          :type="buttonType(1)"
          :disabled="disabled"
          rounded
          @click="e => onSelected(e, question.options[1])"
        >
          {{question.options[1]}}
        </el-button>
      </el-col>
    </el-row>
    <el-row class="options-row" type="flex" justify="space-around">
      <el-col :span="11">
        <el-button
          class="option"
          :type="buttonType(2)"
          :disabled="disabled"
          rounded
          @click="e => onSelected(e, question.options[2])"
        >
          {{question.options[2]}}
        </el-button>
      </el-col>
      <el-col :span="11">
        <el-button
          class="option"
          :type="buttonType(3)"
          :disabled="disabled"
          rounded
          @click="e => onSelected(e, question.options[3])"
        >
          {{question.options[3]}}
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Emit, Watch, Vue } from 'vue-property-decorator';
  import { Question } from '@/store/quiz';

  @Component
  export default class QuestionPanel extends Vue {
    @Prop() private readonly question!: Question;
    @Prop() private readonly disabled!: boolean;
    @Prop() private readonly showsAnswer!: boolean;

    private selected?: string;

    @Watch('question')
    reset() {
      this.selected = undefined;
    }

    buttonType(index: number) {
      if (this.selected || this.showsAnswer) {
        if (this.question.options[index] === this.question.answer) {
          return "success";
        } else if (this.question.options[index] === this.selected) {
          return "danger";
        }
      }
      return "default";
    }

    @Emit()
    onSelected(e: any, selected: string) {
      e.target.blur();
      this.selected = selected;
      return selected === this.question.answer;
    }
  }
</script>

<style lang="scss">
  .option {
    width: 100%;

    > span {
      display: inline-block;
      padding: 1rem;
      font-size: 200%;
    }
  }
  .options-row {
    margin-bottom: 2rem;

  & :last-child {
      margin-bottom: 0;
    }
  }
</style>
