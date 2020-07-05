import { Mutation, VuexModule, Module, getModule } from 'vuex-module-decorators';
import store from './index';
import Setting from '@/entities/setting';
import GameMode from '@/enums/gameMode';

@Module({
  dynamic: true,
  store,
  name: "settings",
  namespaced: true,
  preserveState: localStorage.getItem('vuex') !== null
})
class Settings extends VuexModule implements Setting {
  gameMode = GameMode.TRAINING;
  answerTime = 5;
  repeatQuestion = 2;
  numberOfQuestions = 10;

  @Mutation
  UPDATE(payload: Setting) {
    this.gameMode = payload.gameMode;
    this.answerTime = payload.answerTime;
    this.repeatQuestion = payload.repeatQuestion;
    this.numberOfQuestions = payload.numberOfQuestions;
  }
}

const $settings = getModule(Settings, store);
export default $settings;
