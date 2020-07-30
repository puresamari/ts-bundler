export class Test {
  constructor(public readonly testMessage: string) { }

  public log() {
    console.log(this.testMessage);
  }
}