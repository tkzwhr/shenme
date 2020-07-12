<template>
  <div class="a-container">
    <div
      v-if="settings$.gameMode !== GameModeEnum.TRAINING"
      class="level has-text-weight-bold"
    >
      <div
        v-if="settings$.gameMode === GameModeEnum.MARATHON"
        class="level-left is-vcentered"
      >
        Chained Count : {{ quiz$.correctCount }}
      </div>
      <div v-else class="level-left is-vcentered">
        <div class="level is-mobile">
          <div class="level-left is-vcentered answered">
            Answered :
          </div>
          <div class="level-right is-vcentered">
            <b-progress
              type="is-primary"
              :value="examProgress"
              size="is-small"
            ></b-progress>
          </div>
        </div>
      </div>
      <div class="level-right is-vcentered">
        <time-progress
          :progress="Math.floor(100 - timer$.elapsedTimeRatio * 100)"
        ></time-progress>
      </div>
    </div>
    <div class="has-text-centered question">
      <speaker
        :disabled="!canSpeak"
        :is-speaking="speech$.isSpeaking"
        @speak="speech$.speak(window)"
      ></speaker>
    </div>
    <answers-panel
      :disabled="!canAnswer"
      :options="quiz$.question.options"
      :correct="
        quiz$.actionState === ActionState.ANSWERED
          ? quiz$.question.answer
          : null
      "
      @answered="answered"
    ></answers-panel>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { GameModeEnum } from "@/enums/gameMode";
import ActionState from "@/enums/actionState";
import $spreadsheet from "@/store/spreadsheet";
import $records from "@/store/records";
import $settings from "@/store/settings";
import $quiz from "@/store/quiz";
import $speech from "@/store/speech";
import $timer from "@/store/timer";
import Speaker from "@/components/Speaker.vue";
import TimeProgress from "@/components/TimeProgress.vue";
import AnswersPanel from "@/components/AnswersPanel.vue";
import GameOverModal from "@/components/GameOver.modal.vue";

@Component({
  components: {
    Speaker,
    TimeProgress,
    AnswersPanel
  }
})
export default class Quiz extends Vue {
  private readonly spreadsheet$ = $spreadsheet;
  private readonly records$ = $records;
  private readonly settings$ = $settings;
  private readonly quiz$ = $quiz;
  private readonly speech$ = $speech;
  private readonly timer$ = $timer;
  private readonly GameModeEnum = GameModeEnum;
  private readonly ActionState = ActionState;

  private window?: Window;

  get spreadsheetId(): string {
    return this.$route.params.sheetId as string;
  }
  get examProgress(): number {
    return Math.floor(
      (this.quiz$.answeredCount / this.settings$.numOfQuestions) * 100
    );
  }
  get canSpeak(): boolean {
    return (
      this.quiz$.actionState === ActionState.PROVIDED_QUESTION &&
      (this.settings$.gameMode === GameModeEnum.TRAINING ||
        this.speech$.spokenCount < this.settings$.limitToListen)
    );
  }
  get canAnswer(): boolean {
    return (
      this.quiz$.actionState === ActionState.PROVIDED_QUESTION &&
      this.speech$.spokenCount > 0
    );
  }

  beforeRouteEnter(to: any, from: any, next: (vm?: any) => void) {
    const sheetId: string = to.params.sheetId;
    const spreadsheet = $spreadsheet.sheets.find(t => t.sheetId === sheetId);
    if (!spreadsheet) {
      next({
        name: "Top",
        query: { error: `Sheet ID '${sheetId}' is not found.` }
      });
      return;
    }
    next();
  }

  beforeRouteLeave(to: any, from: any, next: (vm?: any) => void) {
    this.timer$.STOP_TIMER();
    next();
  }

  // noinspection JSUnusedGlobalSymbols
  mounted() {
    this.window = window;
    const { words } = this.spreadsheet$.sheets.find(
      t => t.sheetId === this.spreadsheetId
    ) ?? { words: [] };
    this.quiz$.INITIALIZE(words);
    this.speech$.initialize(this.quiz$.question.question);
    this.timer$.INITIALIZE(this.settings$.answerTime * 1000);
  }

  @Watch("speech$.spokenCount", { immediate: true })
  onSpoke(value: number) {
    if (value === 1) {
      this.timer$.runTimer();
    }
  }

  @Watch("timer$.expired", { immediate: true })
  onExpired(expired: boolean) {
    this.timer$.STOP_TIMER();
    if (this.settings$.gameMode !== GameModeEnum.TRAINING && expired) {
      this.quiz$.TIME_IS_UP();
      this.judge();
    }
  }

  answered(answer: string) {
    this.timer$.STOP_TIMER();
    this.quiz$.ANSWER(answer);
    this.judge();
  }

  judge() {
    if (this.checkGameIsOver()) {
      this.storeRecord();
      this.showGameOverModal();
    } else {
      setTimeout(() => {
        this.quiz$.NEXT();
        this.speech$.SET_TEXT(this.quiz$.question.question);
        this.timer$.RESET_TIMER();
      }, 2000);
    }
  }

  private checkGameIsOver(): boolean {
    switch (this.settings$.gameMode) {
      case GameModeEnum.MARATHON:
        return this.quiz$.latestAnswerIsCorrect === false;
      case GameModeEnum.EXAMINATION:
        return this.examProgress >= 100;
      default:
        return false;
    }
  }

  private storeRecord() {
    switch (this.settings$.gameMode) {
      case GameModeEnum.MARATHON:
        this.records$.UPDATE_CHAINED_COUNT({
          sheetId: this.spreadsheetId,
          newChainedCount: this.quiz$.correctCount
        });
        break;
      case GameModeEnum.EXAMINATION:
        this.records$.UPDATE_ACCURACY({
          sheetId: this.spreadsheetId,
          newAccuracy: this.quiz$.correctCount / this.quiz$.answeredCount
        });
        break;
      default:
        break;
    }
  }

  private showGameOverModal() {
    let message = "";
    let score = "";
    switch (this.settings$.gameMode) {
      case GameModeEnum.MARATHON:
        message = `Your chained count is`;
        score = `${this.quiz$.correctCount}`;
        break;
      case GameModeEnum.EXAMINATION:
        message = `Your accuracy is`;
        score = `${this.quiz$.accuracy}%`;
        break;
      default:
        break;
    }

    // noinspection JSUnusedGlobalSymbols
    this.$buefy.modal.open({
      parent: this,
      component: GameOverModal,
      hasModalCard: true,
      trapFocus: true,
      canCancel: false,
      props: {
        message,
        score
      },
      events: {
        retry: () => {
          this.quiz$.RESTART();
          this.speech$.SET_TEXT(this.quiz$.question.question);
          this.timer$.RESET_TIMER();
        },
        exit: () => {
          this.$router.replace({ name: "Top" });
        }
      }
    });
  }
}
</script>

<style lang="scss" scoped>
.question {
  margin: 4rem 0;
}
.answer {
  font-size: 120%;
  padding: 1rem 0;
}
.answered {
  margin-right: 4px;
}
</style>
