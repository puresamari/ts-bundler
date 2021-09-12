import { Test } from './libraries/test';
import { initLibs } from './libraries';

const t = new Test("testMessage");
t.log();
t.testBeautify();

initLibs();