import Word from "@/models/word";
import Question from "@/models/question";

export default class QuestionGenerator {
  private _words: Array<Word> = [];
  private _latestQuestion?: string;

  setWords(words: Array<Word>) {
    this._words.length = 0;
    this._words.push(...words);
  }

  generate(): Question {
    // fisher-yates algorithm
    for (let i = this._words.length - 1; i > 0; --i) {
      const r = Math.floor(Math.random() * (i + 1));
      const tmp = this._words[i];
      this._words[i] = this._words[r];
      this._words[r] = tmp;
    }

    let correct: number | null = null;
    while (correct === null) {
      correct = Math.floor(Math.random() * 4);
      if (this._latestQuestion === this._words[correct].front) {
        correct = null;
      }
    }

    return {
      question: this._words[correct].front,
      answer: this._words[correct].back,
      options: this._words.slice(0, 4).map(t => t.back)
    };
  }
}
