import { Mutation, Action, VuexModule, Module, getModule } from 'vuex-module-decorators';
import store from './index';
import jsonp from '@/libs/jsonp';

export interface WordCard {
  front: string;
  back: string;
}

export interface Quiz {
  question: string;
  options: Array<string>;
  correctIndex: number;
}

export interface WardSetState {
  items: Array<WordCard>;
  quiz: Quiz | null;
}

@Module({ dynamic: true, store, name: "wordset", namespaced: true })
class WordSet extends VuexModule implements WardSetState {
  items: Array<WordCard> = [];
  quiz: Quiz | null = null;

  @Mutation
  REPLACE(payload: Array<WordCard>) {
    this.items = payload;
  }

  @Mutation
  REFRESH_QUIZ() {
    const cloned = this.items.concat();

    // fisher-yates algorithm
    for (let i = cloned.length - 1; i > 0; --i) {
      const r = Math.floor(Math.random() * (i + 1));
      const tmp = cloned[i];
      cloned[i] = cloned[r];
      cloned[r] = tmp;
    }

    const correctIndex = Math.floor(Math.random() * 4);

    this.quiz = {
      question: cloned[correctIndex].front,
      options: cloned.slice(0, 4).map(t => t.back),
      correctIndex
    }
  }

  @Action({ commit: 'REPLACE', rawError: true })
  async downloadWordSet(payload: { sheetId: string; sheetNumber: string }) {
    const url = `https://spreadsheets.google.com/feeds/list/${payload.sheetId}/${payload.sheetNumber}/public/values?alt=json-in-script`;
    const data = await jsonp(url, {});
    const wordSet: Array<WordCard> = data.feed.entry.map((t: any) => ({
      front: t['gsx$front']['$t'],
      back: t['gsx$back']['$t']
    }));
    return wordSet;
  }
}

const $wordSet = getModule(WordSet, store);
export default $wordSet;
