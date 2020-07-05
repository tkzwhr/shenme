import { Mutation, Action, VuexModule, Module, getModule } from 'vuex-module-decorators';
import axios from 'axios';
import store from './index';
import Word from '@/entities/word';

export interface SpreadsheetSheetState {
  fetching: boolean;
  fetchingErrors: Array<string>;
  sheetId: string;
  sheetName: string;
  words: Array<Word>;
}

export interface SpreadsheetState {
  fetching: boolean;
  fetchingErrors: Array<string>;
  url: string | null;
  sheets: Array<SpreadsheetSheetState>;
}

@Module({
  dynamic: true,
  store,
  name: "spreadsheet",
  namespaced: true,
  preserveState: localStorage.getItem('vuex') !== null
})
class Spreadsheet extends VuexModule implements SpreadsheetState {
  fetching = false;
  fetchingErrors: Array<string> = [];
  url: string | null = null;
  sheets: Array<SpreadsheetSheetState> = [];

  @Mutation
  START_FETCHING() {
    this.fetching = false;
    this.fetchingErrors = [];
  }

  @Mutation
  SET_SHEETS(data: { url: string; sheets: Array<SpreadsheetSheetState> }) {
    this.fetching = false;
    this.fetchingErrors = [];
    this.url = data.url;
    this.sheets = data.sheets;
  }

  @Mutation
  SET_SPREADSHEET_ERRORS(errors: Array<string>) {
    this.fetching = false;
    this.fetchingErrors = errors;
  }

  @Mutation
  DELETE() {
    this.fetching = false;
    this.fetchingErrors = [];
    this.url = null;
    this.sheets = [];
  }

  @Mutation
  START_FETCHING_SHEET(sheetId: string) {
    const sheet = this.sheets.find(t => t.sheetId === sheetId);
    if (sheet) {
      sheet.fetching = true;
      sheet.fetchingErrors = [];
    }
  }

  @Mutation
  SET_WORDS(data: { sheetId: string; words: Array<Word> }) {
    const sheet = this.sheets.find(t => t.sheetId === data.sheetId);
    if (sheet) {
      sheet.fetching = false;
      sheet.fetchingErrors = [];
      sheet.words = data.words;
    }
  }

  @Mutation
  SET_SHEET_ERRORS(data: { sheetId: string; errors: Array<string> }) {
    const sheet = this.sheets.find(t => t.sheetId === data.sheetId);
    if (sheet) {
      sheet.fetching = false;
      sheet.fetchingErrors = data.errors;
    }
  }

  @Action({ rawError: true })
  async fetch(spreadsheetId: string) {
    try {
      // Fetch a worksheet
      this.START_FETCHING();
      const url = `https://spreadsheets.google.com/feeds/worksheets/${spreadsheetId}/public/basic?alt=json`;
      const data = await axios.get(url);
      const sheets: Array<SpreadsheetSheetState> = data.data['feed']['entry'].map((t: any) => ({
        fetching: false,
        fetchingErrors: [],
        sheetId: t.id['$t'].split("/").slice(-1)[0],
        sheetName: t.title['$t'],
        words: []
      }));
      this.SET_SHEETS({
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
        sheets
      });

      // Fetch all sheets
      sheets.map(async t => {
        try {
          this.START_FETCHING_SHEET(t.sheetId);
          const url = `https://spreadsheets.google.com/feeds/list/${spreadsheetId}/${t.sheetId}/public/values?alt=json`;
          const data = await axios.get(url);
          const words: Array<Word> = data.data['feed']['entry'].map((u: any) => ({
            front: u['gsx$front']['$t'],
            back: u['gsx$back']['$t']
          }));
          if (words.length < 4) {
            // noinspection ExceptionCaughtLocallyJS
            throw { message: "too few words" };
          }
          this.SET_WORDS({sheetId: t.sheetId, words: words});
        } catch (e) {
          const errors: Array<string> = [];
          switch (e.message) {
            case '_data.data.feed.entry is undefined':
              errors.push('No words are found.');
              break;
            case 'u.gsx$front is undefined':
              errors.push('`Front` is not defined at first row.');
              break;
            case 'u.gsx$back is undefined':
              errors.push('`Back` is not defined at first row.');
              break;
            case 'too few words':
              errors.push('At least 4 rows are required.');
              break;
            default:
              errors.push('Unknown error');
          }
          this.SET_SHEET_ERRORS({sheetId: t.sheetId, errors});
        }
      });
    } catch (e) {
      const errors: Array<string> = [];
      switch (e.message) {
        case 'Network Error':
          errors.push('Cannot access to spreadsheet.');
          break;
        default:
          errors.push('Unknown error');
      }
      this.SET_SPREADSHEET_ERRORS(errors);
    }
  }
}

const $spreadsheet = getModule(Spreadsheet, store);
export default $spreadsheet;
