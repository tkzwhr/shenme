import {
  Mutation,
  Action,
  VuexModule,
  Module,
  getModule
} from "vuex-module-decorators";
import store from "./index";
import Word from "@/entities/word";
import Question from "@/entities/question";
import ActionState from "@/enums/actionState";

export interface QuizState {
  words: Array<Word>;
  actionState: ActionState;
  correctCount: number;
  incorrectCount: number;
}

@Module({
  dynamic: true,
  store,
  name: "quiz",
  namespaced: true
})
class Quiz extends VuexModule implements QuizState {
  words: Array<Word> = [];
  actionState = ActionState.CREATED;
  correctCount = 0;
  incorrectCount = 0;

  get answeredCount(): number {
    return this.correctCount + this.incorrectCount;
  }

  get question(): () => Question {
    return () => {
      const items = this.words.concat();

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
    };
  }

  @Mutation
  INITIALIZE(payload: Array<Word>) {
    this.words = payload;
    this.correctCount = 0;
    this.incorrectCount = 0;
    this.actionState = ActionState.STANDBY;
  }

  @Mutation
  PROVIDE_QUESTION() {
    if (this.actionState === ActionState.STANDBY) {
      this.actionState = ActionState.PROVIDED_QUESTION;
    }
  }

  @Mutation
  ANSWER(isCorrect: boolean | null) {
    if (this.actionState === ActionState.PROVIDED_QUESTION) {
      this.correctCount += isCorrect ? 1 : 0;
      this.incorrectCount += isCorrect ? 0 : 1;
      this.actionState =
        isCorrect === null ? ActionState.TIME_IS_UP : ActionState.ANSWERED;
    }
  }

  @Mutation
  ADVANCE() {
    if (
      this.actionState === ActionState.ANSWERED ||
      this.actionState === ActionState.TIME_IS_UP
    ) {
      this.actionState = ActionState.STANDBY;
    }
  }

  @Mutation
  RESET() {
    this.actionState = ActionState.STANDBY;
    this.correctCount = 0;
    this.incorrectCount = 0;
  }

  @Action({ rawError: true })
  async answer(isCorrect: boolean | null) {
    this.context.commit("ANSWER", isCorrect);
    const promise = new Promise(resolve => {
      setTimeout(resolve, 2000);
    });
    await promise;
    this.context.commit("ADVANCE", ActionState.STANDBY);
  }
}

const $quiz = getModule(Quiz, store);
export default $quiz;
