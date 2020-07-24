<template>
  <div class="a-container">
    <div class="level has-text-weight-bold">
      <div class="level-left is-vcentered">
        <exam-progress
          :progress="this.correct + this.incorrect"
          :max="settings$.numOfQuestions"
        ></exam-progress>
      </div>
      <div class="level-right is-vcentered">
        <time-progress :progress="timeProgress"></time-progress>
      </div>
    </div>
    <div class="has-text-centered question">
      <speaker
        :disabled="!canSpeak"
        :inactive="isSpeaking"
        @speak="speech.speak()"
      ></speaker>
    </div>
    <answers-panel
      v-if="question"
      :disabled="!canAnswer"
      :options="question.options"
      :answer="question.answer"
      :shows-answer="showsAnswer"
      @answered="answered"
    ></answers-panel>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import $spreadsheet from "@/store/spreadsheet";
import $sheetStatistics from "../store/sheetStatistics";
import $dailyStatistics from "@/store/dailyStatistics";
import $settings from "@/store/settings";
import Speaker from "@/components/Speaker.vue";
import TimeProgress from "@/components/TimeProgress.vue";
import ExamProgress from "@/components/ExamProgress.vue";
import AnswersPanel from "@/components/AnswersPanel.vue";
import GameOverModal from "@/components/GameOver.modal.vue";
import Stopwatch, { StopwatchEvent } from "@/utils/stopwatch";
import Timer, { TimerEvent } from "@/utils/timer";
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
  private readonly settings$ = $settings;

  private readonly speech = new Speech(window, "zh-CN");
  private readonly stopwatch = new Stopwatch();
  private readonly timer = new Timer();
  private readonly questionGenerator = new QuestionGenerator();

  private timeProgress = 100;
  private isSpeaking = false;
  private canSpeak = true;
  private canAnswer = false;
  private question: Question | null = null;
  private correct = 0;
  private incorrect = 0;
  private showsAnswer = false;

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

  beforeRouteLeave(to: any, from: any, next: (vm?: any) => void) {
    this.timer.stop();
    next();
  }

  // noinspection JSUnusedGlobalSymbols
  mounted() {
    this.speech.event.subscribe(this.handleSpeech);
    this.stopwatch.event.subscribe(this.handleStopwatch);
    this.timer.event.subscribe(this.handleTimer);

    const { words } = this.spreadsheet$.sheets.find(
      t => t.sheetId === this.spreadsheetId
    ) ?? { words: [] };
    this.questionGenerator.setWords(words);
    this.question = this.questionGenerator.generate();
    this.timer.setInterval(this.settings$.answerTime * 1000);

    this.restart();
  }

  handleSpeech(value: SpeechEvent) {
    switch (value.type) {
      case "SPEAK":
        this.isSpeaking = true;
        this.stopwatch.start();
        break;
      case "SPOKE":
        if (value.count === 1) {
          this.timer.start();
        }
        this.isSpeaking = false;
        this.canSpeak = value.count < this.settings$.limitToListen;
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

  handleTimer(value: TimerEvent) {
    switch (value.type) {
      case "STOPPED":
        break;
      case "RUNNING":
        this.timeProgress = Math.ceil(
          (value.remain / (this.settings$.answerTime * 1000)) * 100
        );
        break;
      case "TIME_IS_UP":
        this.showsAnswer = true;
        this.stopwatch.stop();
        this.sheetStatistics$.ANSWER({
          sheetId: this.spreadsheetId,
          isCorrect: false
        });
        this.dailyStatistics$.ANSWER(false);
        this.incorrect += 1;
        this.judgeAndNext();
        break;
    }
  }

  answered(answer: string) {
    const isCorrect = this.question?.answer === answer;
    this.timer.stop();
    this.stopwatch.stop();
    this.sheetStatistics$.ANSWER({
      sheetId: this.spreadsheetId,
      isCorrect
    });
    this.dailyStatistics$.ANSWER(isCorrect);
    this.correct += isCorrect ? 1 : 0;
    this.incorrect += isCorrect ? 0 : 1;
    this.combo();
    this.judgeAndNext();
  }

  private restart() {
    this.showsAnswer = false;
    this.question = this.questionGenerator.generate();
    this.speech.setText(this.question.question);
    this.canSpeak = true;
    this.canAnswer = false;
    this.timeProgress = 100;
  }

  private judgeAndNext() {
    if (this.correct + this.incorrect === this.settings$.numOfQuestions) {
      this.showGameOverModal();
    } else {
      setTimeout(this.restart, 2000);
    }
  }

  private combo() {
    const item = this.sheetStatistics$.items.find(
      s => s.sheetId === this.spreadsheetId
    );
    if (item && item.chained >= 5) {
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
          (this.correct / (this.correct + this.incorrect)) * 1000
        ) / 10}%`
      },
      events: {
        retry: () => {
          this.correct = 0;
          this.incorrect = 0;
          this.restart();
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
