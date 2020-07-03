import { Mutation, Action, VuexModule, Module, getModule } from 'vuex-module-decorators';
import store from './index';
import jsonp from '@/libs/jsonp';

export interface WordCard {
  holderId: string;
  front: string;
  back: string;
}

export interface Question {
  question: string;
  answer: string;
  options: Array<string>;
}

export interface WordNoteState {
  items: Array<WordCard>;
  activeHolderId: string;
}

@Module({
  dynamic: true,
  store,
  name: "wordNote",
  namespaced: true,
  preserveState: localStorage.getItem('vuex') !== null
})
class WordNote extends VuexModule implements WordNoteState {
  items: Array<WordCard> = [];
  activeHolderId = '';

  get question(): () => Question {
    return () => {
      const items = this.items.filter(t => t.holderId === this.activeHolderId);

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
  SELECT(payload: string) {
    this.activeHolderId = payload;
  }

  @Mutation
  REPLACE(payload: Array<WordCard>) {
    this.items = payload;
  }

  @Action({ commit: 'REPLACE', rawError: true })
  async download(payload: { sheetId: string; sheetNumber: string }) {
    const url = `https://spreadsheets.google.com/feeds/list/${payload.sheetId}/${payload.sheetNumber}/public/values?alt=json-in-script`;
    const data = await jsonp(url, {});
    const wordnote: Array<WordCard> = data.feed.entry.map((t: any) => ({
      holderId: `${payload.sheetId}-${payload.sheetNumber}`,
      front: t['gsx$front']['$t'],
      back: t['gsx$back']['$t']
    }));
    return wordnote;
  }
}

const $wordNote = getModule(WordNote, store);
export default $wordNote;
