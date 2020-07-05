<template>
  <el-container>
    <el-header class="nav">
      <el-page-header @back="$router.back()" :content="sheetName">
      </el-page-header>
    </el-header>
    <el-main v-if="question !== null">
      <el-row class="voice" type="flex" justify="space-around" align="middle">
        <el-col :span="7">
          <div v-if="settings$.gameMode === GameMode.MARATHON">
            SCORE: <number :number="quiz$.correctCount"></number>
          </div>
          <div v-else-if="settings$.gameMode === GameMode.EXAMINATION">
            <el-row type="flex" align="middle">
              <el-col :span="-1" class="panel-label">PROGRESS:</el-col>
              <el-col><el-progress :percentage="examProgress"></el-progress></el-col>
            </el-row>
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
          <el-row v-if="settings$.gameMode !== GameMode.TRAINING" type="flex" align="middle">
            <el-col :span="-1" class="panel-label">TIME:</el-col>
            <el-col><time-indicator :progress="timer$.timeProgress" /></el-col>
          </el-row>
        </el-col>
      </el-row>

      <question-panel
        :question="question"
        :disabled="quiz$.actionState !== ActionState.PROVIDED_QUESTION"
        :shows-answer="quiz$.actionState === ActionState.TIME_IS_UP"
        @on-selected="answered"
      />

      <el-dialog title="The game is over..." :visible="visible" :show-close="false">
        <div v-if="settings$.gameMode === GameMode.MARATHON" class="result">
          Your SCORE is: <number :number="quiz$.correctCount"></number>
        </div>
        <div v-else-if="settings$.gameMode === GameMode.EXAMINATION" class="result">
          Your accuracy is: <number :number="Math.floor(quiz$.correctCount / quiz$.answeredCount * 100)"></number> %
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
  import {Component, Vue, Watch} from 'vue-property-decorator';
  import Question from '@/entities/question';
  import GameMode from '@/enums/gameMode';
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
    private readonly spreadsheet$ = $spreadsheet;
    private readonly records$ = $records;
    private readonly settings$ = $settings;
    private readonly quiz$ = $quiz;
    private readonly timer$ = $timer;
    private readonly GameMode = GameMode;
    private readonly ActionState = ActionState;

    private question: Question | null = null;

    private sheetId = '';
    private sheetName = '';

    private visible = false;

    private spokeExceeded = false;
    private spokeCount = 0;

    // noinspection JSUnusedGlobalSymbols
    mounted() {
      const sheetId: string = this.$route.params.sheetId as string;
      const sheet = this.spreadsheet$.sheets.find(t => t.sheetId === sheetId);
      if (sheet) {
        this.sheetId = sheet.sheetId;
        this.sheetName = sheet.sheetName;
        this.timer$.SET_DURATION(this.settings$.answerTime * 1000);
        this.quiz$.INITIALIZE(sheet.words);
      } else {
        this.$router.replace({ name: 'Top', query: { error: `Sheet ID '${sheetId}' is not found.` } });
      }
    }

    get examProgress(): number {
      return Math.floor(this.quiz$.answeredCount / this.settings$.numberOfQuestions * 100);
    }

    @Watch('quiz$.actionState', { immediate: true })
    setup(value: ActionState) {
      switch (value) {
        case ActionState.STANDBY:
          this.question = this.quiz$.question();
          this.spokeExceeded = false;
          this.spokeCount = 0;
          this.timer$.STOP_TIMER();
          this.timer$.RESET_TIMER();
          break;
        case ActionState.PROVIDED_QUESTION:
          this.timer$.runTimer();
          break;
        case ActionState.ANSWERED:
          this.timer$.STOP_TIMER();
          break;
        default:
          break;
      }
    }

    @Watch('timer$.timeProgress', { immediate: true })
    checkTimeIsUp(value: number) {
      if (this.settings$.gameMode !== GameMode.TRAINING && value >= 1.0) {
        this.quiz$.answer(null);
        const isOver = this.checkGameIsOver(false);
        if (isOver) {
          this.visible = true;
        }
      }
    }

    provideQuestion() {
      this.quiz$.PROVIDE_QUESTION();

      this.spokeCount += 1;
      if (this.settings$.gameMode !== GameMode.TRAINING && this.spokeCount >= this.settings$.numberOfRepeatQuestion) {
        this.spokeExceeded = true;
      }
    }

    answered(isCorrect: boolean) {
      this.quiz$.answer(isCorrect);

      const isOver = this.checkGameIsOver(isCorrect);
      if (isOver) {
        this.visible = true;
      }
    }

    checkGameIsOver(isCorrect: boolean): boolean {
      let isOver = false;
      switch (this.settings$.gameMode) {
        case GameMode.MARATHON:
          isOver = !isCorrect;
          if (isOver) {
            this.records$.UPDATE_CHAINED_COUNT({
              sheetId: this.sheetId,
              newChainedCount: this.quiz$.correctCount
            });
          }
          break;
        case GameMode.EXAMINATION:
          isOver = this.examProgress >= 100;
          if (isOver) {
            this.records$.UPDATE_ACCURACY({
              sheetId: this.sheetId,
              newAccuracy: this.quiz$.correctCount / this.quiz$.answeredCount
            });
          }
          break;
        default:
          break;
      }
      return isOver;
    }

    close(isRetry: boolean) {
      if (!isRetry) {
        this.$router.back()
        return;
      }

      this.quiz$.RESET();
      this.visible = false;
    }
  }
</script>

<style lang="scss" scoped>
  .voice {
    text-align: center;
    margin-bottom: 10rem;
  }
  .panel-label {
    padding-right: 0.25rem;
  }
  .result {
    text-align: center;
  }
</style>
