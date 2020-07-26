import Settings from "@/models/settings";
import { SettingsView } from "@/components/views.type";
import { GameMode } from "@/enums/gameMode";
import { QuestionMode } from "@/enums/questionMode";

export function modelToView(value: Settings): SettingsView {
  return {
    learningLanguage: value.learningLanguage,
    gameMode: value.gameMode,
    questionMode: value.questionMode,
    answerTime: value.answerTime,
    limitToListen: value.limitToListen,
    numOfQuestions: value.numOfQuestions
  };
}

export function viewToModel(value: SettingsView): Settings | null {
  return {
    learningLanguage: value.learningLanguage,
    gameMode: value.gameMode as GameMode,
    questionMode: value.questionMode as QuestionMode,
    answerTime: value.answerTime,
    limitToListen: value.limitToListen,
    numOfQuestions: value.numOfQuestions
  };
}
