import init from './three-test';
import shaTest from './sha-test';

// const t = new Test('Hello');

// t.log();

export function initLibs() {
  init();
  shaTest();
}