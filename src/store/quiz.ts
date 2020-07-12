import {
  Mutation,
  VuexModule,
  Module,
  getModule
} from "vuex-module-decorators";
import store from "./index";
import Word from "@/models/word";
import Question from "@/models/question";
import ActionState from "@/enums/actionState";

export interface QuizState {
  words: Array<Word>;
  actionState: ActionState;
  question: Question;
  latestAnswerIsCorrect: boolean | null;
  correctCount: number;
  incorrectCount: number;
}

function generateQuestion(words: Array<Word>): Question {
  const items = words.concat();

  // fisher-yates algorithm
  for (let i = items.length - 1; i > 0; --i) {
    const r = Math.floor(Math.random() * (i + 1));
    const tmp = items[i];
    items[i] = items[r];
    items[r] = tmp;
  }

  const correct = Math.floor(Math.random() * 4);

  return {
    question: items[correct].front,
    answer: items[correct].back,
    options: items.slice(0, 4).map(t => t.back)
  };
}

@Module({
  dynamic: true,
  store,
  name: "quiz",
  namespaced: true
})
class QuizModule extends VuexModule implements QuizState {
  words: Array<Word> = [];
  actionState = ActionState.TIME_IS_UP;
  question: Question = {
    question: "",
    answer: "",
    options: []
  };
  latestAnswerIsCorrect: boolean | null = null;
  correctCount = 0;
  incorrectCount = 0;

  get answeredCount(): number {
    return this.correctCount + this.incorrectCount;
  }

  get accuracy(): number {
    return Math.floor(this.correctCount + this.answeredCount * 1000) / 10;
  }

  @Mutation
  INITIALIZE(payload: Array<Word>) {
    this.words = payload;
    this.actionState = ActionState.PROVIDED_QUESTION;
    this.question = generateQuestion(this.words);
    this.latestAnswerIsCorrect = null;
    this.correctCount = 0;
    this.incorrectCount = 0;
  }

  @Mutation
  ANSWER(answer: string) {
    if (this.actionState === ActionState.PROVIDED_QUESTION) {
      this.latestAnswerIsCorrect = this.question.answer === answer;
      this.correctCount += this.latestAnswerIsCorrect ? 1 : 0;
      this.incorrectCount += this.latestAnswerIsCorrect ? 0 : 1;
      this.actionState = ActionState.ANSWERED;
    } else {
      console.warn("Question is not provided or already answered.");
    }
  }

  @Mutation
  TIME_IS_UP() {
    if (this.actionState === ActionState.PROVIDED_QUESTION) {
      this.latestAnswerIsCorrect = false;
      this.incorrectCount += 1;
      this.actionState = ActionState.TIME_IS_UP;
    } else {
      console.warn("Question is not provided or already answered.");
    }
  }

  @Mutation
  NEXT() {
    if (
      this.actionState === ActionState.ANSWERED ||
      this.actionState === ActionState.TIME_IS_UP
    ) {
      this.question = generateQuestion(this.words);
      this.latestAnswerIsCorrect = null;
      this.actionState = ActionState.PROVIDED_QUESTION;
    } else {
      console.warn("You did not answer.");
    }
  }

  @Mutation
  RESTART() {
    this.actionState = ActionState.PROVIDED_QUESTION;
    this.question = generateQuestion(this.words);
    this.latestAnswerIsCorrect = null;
    this.correctCount = 0;
    this.incorrectCount = 0;
  }
}

const $quiz = getModule(QuizModule, store);
export default $quiz;
