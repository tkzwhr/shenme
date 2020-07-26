<template>
  <div class="a-container">
    <div class="level">
      <div class="level-left is-vcentered">
        <exam-progress
          :progress="game.correct + game.incorrect"
          :max="settings$.numOfQuestions"
        ></exam-progress>
      </div>
      <div class="level-right is-vcentered">
        <time-progress :progress="timeProgress"></time-progress>
      </div>
    </div>
    <div class="has-text-centered question">
      <speaker
        :disabled="!game.canListen"
        :inactive="game.isListening"
        @click="game.listen()"
      ></speaker>
    </div>
    <answers-panel
      v-if="game.currentQuestion"
      :disabled="!game.canAnswer"
      :options="game.currentOptions"
      :answer="game.currentAnswer"
      :shows-answer="game.timeIsUp"
      @select="game.answer($event)"
    ></answers-panel>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import $spreadsheet from "@/store/spreadsheet";
import $sheetStatistics from "@/store/sheetStatistics";
import $dailyStatistics from "@/store/dailyStatistics";
import $settings from "@/store/settings";
import Speaker from "@/components/Speaker.vue";
import TimeProgress from "@/components/TimeProgress.vue";
import ExamProgress from "@/components/ExamProgress.vue";
import AnswersPanel from "@/components/AnswersPanel.vue";
import GameOverModal from "@/components/GameOver.modal.vue";
import GameStatus, { GameStatusEvent } from "@/utils/gameStatus";
import Stopwatch, { StopwatchEvent } from "@/utils/stopwatch";

@Component({
  components: {
    Speaker,
    TimeProgress,
    ExamProgress,
    AnswersPanel
  }
})
export default class ExamPage extends Vue {
  private readonly spreadsheet$ = $spreadsheet;
  private readonly sheetStatistics$ = $sheetStatistics;
  private readonly dailyStatistics$ = $dailyStatistics;
  private readonly settings$ = $settings;

  private readonly game = new GameStatus(window, {
    voiceName: this.settings$.learningLanguage,
    questionMode: this.settings$.questionMode,
    answerTime: this.settings$.answerTime,
    limitToListen: this.settings$.limitToListen,
    numOfQuestions: this.settings$.numOfQuestions
  });
  private readonly stopwatch = new Stopwatch();

  get spreadsheetId(): string {
    return this.$route.params.sheetId as string;
  }

  get timeProgress(): number {
    return Math.ceil(
      (this.game.remainTime / (this.settings$.answerTime * 1000)) * 100
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
    this.stopwatch.stop();
    this.game.finalize();
    next();
  }

  // noinspection JSUnusedGlobalSymbols
  mounted() {
    const { words } = this.spreadsheet$.sheets.find(
      t => t.sheetId === this.spreadsheetId
    ) ?? { words: [] };
    this.game.setWords(words);

    this.game.event.subscribe(this.handleGameStatus);
    this.stopwatch.event.subscribe(this.handleStopwatch);
  }

  handleGameStatus(event: GameStatusEvent) {
    switch (event) {
      case "READY":
        this.game.provideQuestion();
        break;
      case "PROVIDE_QUESTION":
        break;
      case "LISTEN_FIRST":
        this.stopwatch.start();
        break;
      case "ACCEPTING_ANSWER":
        break;
      case "ANSWERING_CLOSED":
        this.answered(false);
        break;
      case "ANSWERED_CORRECTLY":
        this.answered(true);
        this.checkCombo();
        break;
      case "ANSWERED_INCORRECTLY":
        this.answered(false);
        break;
      case "GAME_IS_OVER":
        this.showGameOverModal();
        break;
    }
  }

  handleStopwatch(event: StopwatchEvent) {
    switch (event.type) {
      case "STOPPED":
        this.sheetStatistics$.RECORD_TIME({
          sheetId: this.spreadsheetId,
          time: event.elapsed
        });
        this.dailyStatistics$.RECORD_TIME(event.elapsed);
        break;
      case "RUNNING":
        break;
    }
  }

  answered(isCorrect: boolean) {
    this.stopwatch.stop();
    this.sheetStatistics$.ANSWER({
      sheetId: this.spreadsheetId,
      isCorrect: isCorrect
    });
    this.dailyStatistics$.ANSWER(isCorrect);
  }

  private checkCombo() {
    const item = this.sheetStatistics$.items.find(
      s => s.sheetId === this.spreadsheetId
    );
    if (item && item.chained > item.maxChained) {
      this.$buefy.toast.open({
        duration: 2000,
        message: `${item.chained} COMBO!`,
        position: "is-bottom",
        type: "is-success"
      });
    }
  }

  private showGameOverModal() {
    // noinspection JSUnusedGlobalSymbols
    this.$buefy.modal.open({
      parent: this,
      component: GameOverModal,
      hasModalCard: true,
      trapFocus: true,
      canCancel: false,
      props: {
        message: `Your accuracy is`,
        score: `${Math.round(
          (this.game.correct / (this.game.correct + this.game.incorrect)) * 1000
        ) / 10}%`
      },
      events: {
        retry: this.game.reset,
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
