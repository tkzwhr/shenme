<template>
  <el-container>
    <el-main v-if="question !== null">
      <el-row class="voice" type="flex" justify="space-around" align="middle">
        <el-col :span="7">
          <div>
            正解数: {{correctCount}} / {{correctCount + incorrectCount}}
          </div>
          <div>
            連続正解数: {{chainedCount}}
          </div>
        </el-col>
        <el-col :span="8">
          <speaker
            :text="question.question"
            @click="provideQuestion"
          />
        </el-col>
        <el-col :span="7">
          <time-indicator :progress="timeProgress" />
        </el-col>
      </el-row>
      <question-panel
        :question="question"
        :disabled="!readyToAnswer"
        :shows-answer="timeIsUp"
        @on-selected="answered"
      />
    </el-main>
  </el-container>
</template>

<script lang="ts">
  import { Component, Vue, Watch } from 'vue-property-decorator';
  import $spreadsheet from '@/store/spreadsheet';
  import $quiz, { ActionState, Question } from '@/store/quiz';
  import $timer from '@/store/timer';
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
    private question: Question | null = null;

    mounted() {
      const sheetId: string = this.$route.params.sheetId as string;
      const sheet = $spreadsheet.sheets.find(t => t.sheetId === sheetId);
      if (sheet) {
        $timer.SET_DURATION(3000);
        $quiz.INITIALIZE(sheet.words);
      } else {
        this.$router.replace({ name: 'Top', query: { error: `Sheet ID '${sheetId}' is not found.` } });
      }
    }

    get timeProgress(): number {
      return $timer.timeProgress;
    }

    get actionState(): ActionState {
      return $quiz.actionState;
    }

    get readyToAnswer(): boolean {
      return $quiz.actionState === ActionState.PROVIDED_QUESTION;
    }

    get timeIsUp(): boolean {
      return $quiz.actionState === ActionState.TIME_IS_UP;
    }

    get correctCount(): number {
      return $quiz.correctCount;
    }

    get incorrectCount(): number {
      return $quiz.incorrectCount;
    }

    get chainedCount(): number {
      return $quiz.chainedCount;
    }

    @Watch('actionState', { immediate: true })
    setup(value: ActionState) {
      switch (value) {
        case ActionState.STANDBY:
          this.question = $quiz.question();
          $timer.STOP_TIMER();
          $timer.RESET_TIMER();
          break;
        case ActionState.PROVIDED_QUESTION:
          $timer.runTimer();
          break;
        case ActionState.ANSWERED:
          $timer.STOP_TIMER();
          break;
        default:
          break;
      }
    }

    @Watch('timeProgress', { immediate: true })
    checkTimeIsUp(value: number) {
      if (value >= 1.0) {
        $quiz.answer(null);
      }
    }

    provideQuestion() {
      $quiz.PROVIDE_QUESTION();
    }

    answered(isCorrect: boolean) {
      $quiz.answer(isCorrect);
    }
  }
</script>

<style lang="scss" scoped>
  .voice {
    text-align: center;
    margin-bottom: 10rem;
  }
</style>
