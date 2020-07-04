<template>
  <el-container>
    <el-main class="quiz" v-if="question !== null">
      <el-row class="voice" type="flex" justify="space-around" align="middle">
        <el-col :span="7">
          <div>
            正解数: {{correctCount}} / {{answeredCount}}
          </div>
          <div>
            連続正解数: {{chainedCount}}
          </div>
        </el-col>
        <el-col :span="8">
          <speaker
            :text="question.question"
            @click="gameState = 'wait-answer'"
          />
        </el-col>
        <el-col :span="7">
          <time-indicator
            :command="timeIndicatorCommand"
            @time-over="gameState = 'time-over'"
          />
        </el-col>
      </el-row>
      <question-panel
        :question="question"
        :disabled="gameState !== 'wait-answer'"
        :shows-answer="gameState === 'time-over'"
        @on-selected="checkAnswer"
      />
    </el-main>
  </el-container>
</template>

<script lang="ts">
  import { Component, Vue, Watch } from 'vue-property-decorator';
  import $wordNote, { Question } from '@/store/wordNote';
  import TimeIndicator from '@/components/TimeIndicator.vue';
  import Speaker from '@/components/Speaker.vue';
  import QuestionPanel from '@/components/QuestionPanel.vue';

  @Component({
    components: {
      TimeIndicator,
      Speaker,
      QuestionPanel
    }
  })
  export default class Quiz extends Vue {
    private gameState = '';

    private timeIndicatorCommand = '';

    private question: Question | null = null;
    private answeredCount = 0;
    private correctCount = 0;
    private chainedCount = 0;

    mounted() {
      const holderId: string = this.$route.params.holderId as string;
      $wordNote.SELECT(holderId);
      this.gameState = 'ready';
    }

    @Watch('gameState', { immediate: true })
    setup(value: string) {
      switch (value) {
        case 'ready':
          this.question = $wordNote.question();
          this.timeIndicatorCommand = 'set:3000';
          break;
        case 'wait-answer':
          this.timeIndicatorCommand = 'start';
          break;
        case 'time-over':
          this.answeredCount += 1;
          this.chainedCount = 0;
          this.timeIndicatorCommand = 'stop';
          setTimeout(() => { this.gameState = 'ready'; }, 2000);
          break;
        case 'answered':
          this.timeIndicatorCommand = 'stop';
          setTimeout(() => { this.gameState = 'ready'; }, 2000);
          break;
      }
    }

    checkAnswer(isCorrect: boolean) {
      this.answeredCount += 1;
      this.correctCount += isCorrect ? 1 : 0;
      this.chainedCount = isCorrect ? this.chainedCount + 1 : 0;
      this.gameState = 'answered';
    }
  }
</script>

<style lang="scss" scoped>
  .quiz {
    min-width: 90%;
  }
  .voice {
    text-align: center;
    margin-bottom: 10rem;
  }
</style>
