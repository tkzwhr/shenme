import GameMode from "@/enums/gameMode";

export default interface Setting {
  gameMode: GameMode;
  answerTime: number;
  numberOfRepeatQuestion: number;
  numberOfQuestions: number;
}
