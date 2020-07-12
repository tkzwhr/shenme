import {
  Mutation,
  VuexModule,
  Module,
  getModule
} from "vuex-module-decorators";
import store from "./index";
import Settings from "@/models/settings";
import { GameMode, GameModeEnum } from "@/enums/gameMode";

@Module({
  dynamic: true,
  store,
  name: "settings",
  namespaced: true,
  preserveState: localStorage.getItem("vuex") !== null
})
class SettingsModule extends VuexModule implements Settings {
  gameMode: GameMode = GameModeEnum.TRAINING;
  answerTime = 5;
  limitToListen = 2;
  numOfQuestions = 10;

  @Mutation
  UPDATE(payload: Settings) {
    this.gameMode = payload.gameMode;
    this.answerTime = payload.answerTime;
    this.limitToListen = payload.limitToListen;
    this.numOfQuestions = payload.numOfQuestions;
  }
}

const $settings = getModule(SettingsModule, store);
export default $settings;
