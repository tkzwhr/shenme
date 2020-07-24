import { BehaviorSubject, Observable } from "rxjs";

export interface SpeechEvent {
  type: "RESET" | "SPEAK" | "SPOKE";
  count: number;
}

export default class Speech {
  private readonly _speech = new SpeechSynthesisUtterance("");
  private readonly _event$ = new BehaviorSubject<SpeechEvent>({
    type: "RESET",
    count: 0
  });
  private readonly _window: Window;

  constructor(window: Window, lang: string) {
    this._window = window;
    this._speech.lang = lang;
    this._speech.onstart = () => {
      this._event$.next({ type: "SPEAK", count: this._event$.value.count });
    };
    this._speech.onend = () => {
      this._event$.next({ type: "SPOKE", count: this._event$.value.count + 1 });
    };
  }

  get event(): Observable<SpeechEvent> {
    return this._event$.asObservable();
  }

  setText(text: string) {
    this._speech.text = text;
    this._event$.next({ type: "RESET", count: 0 });
  }

  speak() {
    this._window.speechSynthesis.speak(this._speech);
  }
}
