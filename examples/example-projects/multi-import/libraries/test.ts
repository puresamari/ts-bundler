import { js } from 'js-beautify';
export class Test {
  constructor(public readonly testMessage: string) { }

  public log() {
    console.log(this.testBeautify());
  }

  public testBeautify() {
    return js(`var tm    = '${this.testMessage}' ;`);
  }
}
