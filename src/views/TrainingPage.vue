<template>
  <div class="a-container">
    <div class="has-text-centered question">
      <speaker
        :disabled="false"
        :inactive="game.isListening"
        @click="game.listen()"
      ></speaker>
    </div>
    <answers-panel
      v-if="game.currentQuestion"
      :disabled="!game.canAnswer"
      :options="game.currentOptions"
      :answer="game.currentAnswer"
      @select="game.answer($event)"
    ></answers-panel>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import $spreadsheet from "@/store/spreadsheet";
import $sheetStatistics from "@/store/sheetStatistics";
import $dailyStatistics from "@/store/dailyStatistics";
import Speaker from "@/components/Speaker.vue";
import TimeProgress from "@/components/TimeProgress.vue";
import ExamProgress from "@/components/ExamProgress.vue";
import AnswersPanel from "@/components/AnswersPanel.vue";
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
export default class TrainingPage extends Vue {
  private readonly spreadsheet$ = $spreadsheet;
  private readonly sheetStatistics$ = $sheetStatistics;
  private readonly dailyStatistics$ = $dailyStatistics;

  private readonly game = new GameStatus(window, { lang: "zh-CN" });
  private readonly stopwatch = new Stopwatch();

  get spreadsheetId(): string {
    return this.$route.params.sheetId as string;
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
        break;
      case "ANSWERED_CORRECTLY":
        this.stopwatch.stop();
        break;
      case "ANSWERED_INCORRECTLY":
        this.stopwatch.stop();
        break;
      case "GAME_IS_OVER":
        break;
    }
  }

  handleStopwatch(value: StopwatchEvent) {
    switch (value.type) {
      case "STOPPED":
        this.sheetStatistics$.RECORD_TIME({
          sheetId: this.spreadsheetId,
          time: value.elapsed
        });
        this.dailyStatistics$.RECORD_TIME(value.elapsed);
        break;
      case "RUNNING":
        break;
    }
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
