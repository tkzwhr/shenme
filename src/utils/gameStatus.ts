import { BehaviorSubject, Observable } from "rxjs";
import Timer from "@/utils/timer";
import Speech from "@/utils/speech";
import Word from "@/models/word";
import { QuestionMode } from "@/enums/questionMode";

export type GameStatusEvent =
  | "READY"
  | "PROVIDE_QUESTION"
  | "LISTEN_FIRST"
  | "ACCEPTING_ANSWER"
  | "ANSWERING_CLOSED"
  | "ANSWERED_CORRECTLY"
  | "ANSWERED_INCORRECTLY"
  | "GAME_IS_OVER";

export interface GameStatusConfiguration {
  voiceName: string;
  questionMode: QuestionMode;
  answerTime?: number;
  limitToListen?: number;
  numOfQuestions?: number;
}

export default class GameStatus {
  private readonly _timer = new Timer();
  private readonly _speech = new Speech(
    this._window,
    this._configuration.voiceName
  );
  private readonly _event$ = new BehaviorSubject<GameStatusEvent>("READY");
  private readonly _words: Array<Word> = [];

  // provide question
  private _remainTime = (this._configuration.answerTime ?? 0) * 1000;
  private _question = "";
  private _answer = "";
  private _options: Array<string> = [];
  private _latestQuestion = "";
  private _correct = 0;
  private _incorrect = 0;

  get event(): Observable<GameStatusEvent> {
    return this._event$.asObservable();
  }

  get remainTime(): number {
    return this._remainTime;
  }

  get currentQuestion(): string {
    return this._question;
  }

  get currentAnswer(): string {
    return this._answer;
  }

  get currentOptions(): Array<string> {
    return this._options;
  }

  get canListen(): boolean {
    return (
      (this._event$.value === "PROVIDE_QUESTION" ||
        this._event$.value === "ACCEPTING_ANSWER") &&
      (this._configuration.limitToListen === undefined ||
        this._speech.spokenCount < this._configuration.limitToListen)
    );
  }

  get isListening(): boolean {
    return this._speech.isSpeaking;
  }

  get canLookOptions(): boolean {
    return (
      this._event$.value === "ACCEPTING_ANSWER" ||
      this._event$.value === "ANSWERING_CLOSED" ||
      this._event$.value === "ANSWERED_CORRECTLY" ||
      this._event$.value === "ANSWERED_INCORRECTLY"
    );
  }

  get canAnswer(): boolean {
    return this._event$.value === "ACCEPTING_ANSWER";
  }

  get timeIsUp(): boolean {
    return this._event$.value === "ANSWERING_CLOSED";
  }

  get correct(): number {
    return this._correct;
  }

  get incorrect(): number {
    return this._incorrect;
  }

  constructor(
    private _window: Window,
    private _configuration: GameStatusConfiguration
  ) {
    this._timer.remainTime$.subscribe(remainTime => {
      this._remainTime = remainTime;
    });
  }

  setWords(words: Array<Word>) {
    this._words.length = 0;
    this._words.push(...words);
  }

  provideQuestion() {
    this._remainTime = (this._configuration.answerTime ?? 0) * 1000;

    // fisher-yates algorithm
    for (let i = this._words.length - 1; i > 0; --i) {
      const r = Math.floor(Math.random() * (i + 1));
      const tmp = this._words[i];
      this._words[i] = this._words[r];
      this._words[r] = tmp;
    }

    let correct: number | null = null;
    while (correct === null) {
      correct = Math.floor(Math.random() * 4);
      if (this._latestQuestion === this._words[correct].front) {
        correct = null;
      }
    }

    let isBack = true;
    switch (this._configuration.questionMode) {
      case "NORMAL":
        isBack = true;
        break;
      case "ONLY_FRONT":
        isBack = false;
        break;
      case "AT_RANDOM":
        isBack = Math.floor(Math.random() * 2) === 0;
        break;
    }

    this._question = this._words[correct].front;
    this._answer = isBack
      ? this._words[correct].back
      : this._words[correct].front;
    this._options = this._words
      .slice(0, 4)
      .map(t => (isBack ? t.back : t.front));

    this._speech.setText(this._question);

    this._event$.next("PROVIDE_QUESTION");
  }

  listen() {
    if (this._speech.spokenCount === 0) {
      this._event$.next("LISTEN_FIRST");
    }
    this._speech.speak().then(() => {
      if (this._speech.spokenCount === 1) {
        if (this._configuration.answerTime) {
          this._timer
            .start(this._configuration.answerTime * 1000)
            .catch(() => this.answer());
        }
        this._event$.next("ACCEPTING_ANSWER");
      }
    });
  }

  answer(selected?: string) {
    if (selected === undefined) {
      this._incorrect += 1;
      this._event$.next("ANSWERING_CLOSED");
    } else if (selected === this._answer) {
      this._timer.stop();
      this._correct += 1;
      this._event$.next("ANSWERED_CORRECTLY");
    } else {
      this._timer.stop();
      this._incorrect += 1;
      this._event$.next("ANSWERED_INCORRECTLY");
    }
    if (
      this._configuration.numOfQuestions &&
      this._correct + this._incorrect === this._configuration.numOfQuestions
    ) {
      setTimeout(() => {
        this._event$.next("GAME_IS_OVER");
      }, 2000);
    } else {
      setTimeout(() => {
        this._event$.next("READY");
      }, 2000);
    }
  }

  reset() {
    this._correct = 0;
    this._incorrect = 0;
    this._event$.next("READY");
  }

  finalize() {
    this._timer.stop();
  }
}
