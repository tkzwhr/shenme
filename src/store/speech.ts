import {
  Mutation,
  Action,
  VuexModule,
  Module,
  getModule
} from "vuex-module-decorators";
import store from "./index";

export interface SpeechState {
  speech: SpeechSynthesisUtterance;
  text: string;
  isSpeaking: boolean;
  spokenCount: number;
}

@Module({
  dynamic: true,
  store,
  name: "speech",
  namespaced: true
})
class SpeechModule extends VuexModule implements SpeechState {
  speech = new SpeechSynthesisUtterance("");
  text = "";
  isSpeaking = false;
  spokenCount = 0;

  @Mutation
  SET_TEXT(text: string) {
    this.spokenCount = 0;
    this.speech.text = text;
  }

  @Mutation
  SPEAK() {
    this.isSpeaking = true;
  }

  @Mutation
  SPOKE() {
    this.isSpeaking = false;
    this.spokenCount += 1;
  }

  @Action
  initialize(text: string) {
    const speech = (this.context.state as SpeechState).speech;
    speech.text = text;
    speech.lang = "zh-CN";
    speech.onstart = () => {
      this.context.commit("SPEAK");
    };
    speech.onend = () => {
      this.context.commit("SPOKE");
    };
  }

  @Action
  speak(window: Window) {
    window.speechSynthesis.speak((this.context.state as SpeechState).speech);
  }
}

const $speech = getModule(SpeechModule, store);
export default $speech;
