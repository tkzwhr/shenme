import { Subject } from "rxjs";

export default class Speech {
  private readonly _spoke$ = new Subject<void>();
  private readonly _speech = new SpeechSynthesisUtterance("");

  private _isSpeaking = false;
  private _spokenCount = 0;

  constructor(private _window: Window, voiceName: string) {
    this._speech.voice =
      _window.speechSynthesis.getVoices().find(v => v.name === voiceName) ??
      null;
    _window.speechSynthesis.onvoiceschanged = () => {
      this._speech.voice =
        _window.speechSynthesis.getVoices().find(v => v.name === voiceName) ??
        null;
    };
    this._speech.onstart = () => {
      this._isSpeaking = true;
    };
    this._speech.onend = () => {
      this._isSpeaking = false;
      this._spokenCount += 1;
      this._spoke$.next();
    };
  }

  get isSpeaking(): boolean {
    return this._isSpeaking;
  }

  get spokenCount(): number {
    return this._spokenCount;
  }

  setText(text: string) {
    this._speech.text = text;
    this._spokenCount = 0;
  }

  speak(): Promise<void> {
    return new Promise<void>(resolve => {
      const subscription = this._spoke$.subscribe(() => {
        resolve();
        subscription.unsubscribe();
      });
      this._window.speechSynthesis.speak(this._speech);
    });
  }
}
