<template>
  <el-container>
    <el-header class="nav">
      <el-page-header @back="$router.back()" :content="sheetName">
      </el-page-header>
    </el-header>
    <el-main v-if="question !== null">
      <el-row class="voice" type="flex" justify="space-around" align="middle">
        <el-col :span="7">
          <div>
            SCORE: <number :number="score"></number>
          </div>
        </el-col>
        <el-col :span="8">
          <speaker
            :text="question.question"
            :disabled="spokeExceeded"
            @spoke="provideQuestion"
          />
        </el-col>
        <el-col :span="7">
          <el-row type="flex" align="middle">
            <el-col :span="-1" style="padding-right: .25rem">TIME:</el-col>
            <el-col><time-indicator :progress="timeProgress" /></el-col>
          </el-row>
        </el-col>
      </el-row>

      <question-panel
        :question="question"
        :disabled="!readyToAnswer"
        :shows-answer="timeIsUp"
        @on-selected="answered"
      />

      <el-dialog title="The game is over..." :visible="visible" :show-close="false">
        <div>
          Your SCORE is: <number :number="score"></number>
        </div>
        <div slot="footer">
          <el-button @click="close(false)">Exit</el-button>
          <el-button type="primary" @click="close(true)">Retry</el-button>
        </div>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script lang="ts">
  import { Component, Vue, Watch } from 'vue-property-decorator';
  import Question from '@/entities/question';
  import ActionState from '@/enums/actionState';
  import $spreadsheet from '@/store/spreadsheet';
  import $records from '@/store/records';
  import $settings from '@/store/settings';
  import $quiz from '@/store/quiz';
  import $timer from '@/store/timer';
  import TimeIndicator from '@/components/TimeIndicator.vue';
  import Speaker from '@/components/Speaker.vue';
  import QuestionPanel from '@/components/QuestionPanel.vue';
  import Number from '@/components/Number.vue';

  @Component({
    components: {
      TimeIndicator,
      Speaker,
      QuestionPanel,
      Number
    }
  })
  export default class Quiz extends Vue {
    private question: Question | null = null;

    private sheetId = '';
    private sheetName = '';

    private visible = false;

    private spokeExceeded = false;
    private spokeCount = 0;

    // noinspection JSUnusedGlobalSymbols
    mounted() {
      const sheetId: string = this.$route.params.sheetId as string;
      const sheet = $spreadsheet.sheets.find(t => t.sheetId === sheetId);
      if (sheet) {
        this.sheetId = sheet.sheetId;
        this.sheetName = sheet.sheetName;
        $timer.SET_DURATION($settings.answerTime * 1000);
        $quiz.INITIALIZE(sheet.words);
      } else {
        this.$router.replace({ name: 'Top', query: { error: `Sheet ID '${sheetId}' is not found.` } });
      }
    }

    get numberOfRepeatQuestion(): number {
      return $settings.numberOfRepeatQuestion;
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

    get score(): number {
      return $quiz.correctCount;
    }

    get timeProgress(): number {
      return $timer.timeProgress;
    }

    @Watch('actionState', { immediate: true })
    setup(value: ActionState) {
      switch (value) {
        case ActionState.STANDBY:
          this.question = $quiz.question();
          this.spokeExceeded = false;
          this.spokeCount = 0;
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
        $records.UPDATE_CHAINED_COUNT({
          sheetId: this.sheetName,
          newChainedCount: this.score
        });
        this.visible = true;
      }
    }

    provideQuestion() {
      $quiz.PROVIDE_QUESTION();

      this.spokeCount += 1;
      if (this.spokeCount >= $settings.numberOfRepeatQuestion) {
        this.spokeExceeded = true;
      }
    }

    answered(isCorrect: boolean) {
      $quiz.answer(isCorrect);

      if (!isCorrect) {
        $records.UPDATE_CHAINED_COUNT({
          sheetId: this.sheetId,
          newChainedCount: this.score
        });
        this.visible = true;
      }
    }

    close(isRetry: boolean) {
      if (!isRetry) {
        this.$router.back()
        return;
      }

      $quiz.RESET();
      this.visible = false;
    }
  }
</script>

<style lang="scss" scoped>
  .voice {
    text-align: center;
    margin-bottom: 10rem;
  }
</style>
