import { GameMode } from "@/enums/gameMode";
import { QuestionMode } from "@/enums/questionMode";

export default interface Settings {
  learningLanguage: string;
  gameMode: GameMode;
  questionMode: QuestionMode;
  answerTime: number;
  limitToListen: number;
  numOfQuestions: number;
}
