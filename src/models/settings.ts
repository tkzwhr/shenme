import { GameMode } from "@/enums/gameMode";

export default interface Settings {
  gameMode: GameMode;
  answerTime: number;
  limitToListen: number;
  numOfQuestions: number;
}
