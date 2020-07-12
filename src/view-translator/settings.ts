import Settings from "@/models/settings";
import { SettingsView } from "@/components/views.type";
import { GameMode } from "@/enums/gameMode";

export function modelToView(value: Settings): SettingsView {
  return {
    gameMode: value.gameMode,
    answerTime: value.answerTime,
    limitToListen: value.limitToListen,
    numOfQuestions: value.numOfQuestions
  };
}

export function viewToModel(value: SettingsView): Settings | null {
  return {
    gameMode: value.gameMode as GameMode,
    answerTime: value.answerTime,
    limitToListen: value.limitToListen,
    numOfQuestions: value.numOfQuestions
  };
}
