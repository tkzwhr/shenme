<template>
  <div class="a-container">
    <div class="has-text-centered question">
      <speaker
        :disabled="false"
        :inactive="isSpeaking"
        @speak="speech.speak()"
      ></speaker>
    </div>
    <answers-panel
      v-if="question"
      :disabled="!canAnswer"
      :options="question.options"
      :answer="question.answer"
      @answered="answered"
    ></answers-panel>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import $spreadsheet from "@/store/spreadsheet";
import $sheetStatistics from "../store/sheetStatistics";
import $dailyStatistics from "@/store/dailyStatistics";
import Speaker from "@/components/Speaker.vue";
import TimeProgress from "@/components/TimeProgress.vue";
import ExamProgress from "@/components/ExamProgress.vue";
import AnswersPanel from "@/components/AnswersPanel.vue";
import Stopwatch, { StopwatchEvent } from "@/utils/stopwatch";
import Speech, { SpeechEvent } from "@/utils/speech";
import QuestionGenerator from "@/utils/questionGenerator";
import Question from "@/models/question";

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

  private readonly speech = new Speech(window, "zh-CN");
  private readonly stopwatch = new Stopwatch();
  private readonly questionGenerator = new QuestionGenerator();

  private isSpeaking = false;
  private canAnswer = false;
  private question: Question | null = null;

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
    this.speech.event.subscribe(this.handleSpeech);
    this.stopwatch.event.subscribe(this.handleStopwatch);

    const { words } = this.spreadsheet$.sheets.find(
      t => t.sheetId === this.spreadsheetId
    ) ?? { words: [] };
    this.questionGenerator.setWords(words);
    this.question = this.questionGenerator.generate();
    this.speech.setText(this.question.question);
  }

  handleSpeech(value: SpeechEvent) {
    switch (value.type) {
      case "SPEAK":
        this.isSpeaking = true;
        this.stopwatch.start();
        break;
      case "SPOKE":
        this.isSpeaking = false;
        this.canAnswer = value.count > 0;
        break;
      case "RESET":
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

  answered() {
    this.stopwatch.stop();
    setTimeout(() => {
      this.question = this.questionGenerator.generate();
      this.speech.setText(this.question.question);
      this.canAnswer = false;
    }, 2000);
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
