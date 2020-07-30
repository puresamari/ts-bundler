import path from 'path';

import { TypescriptBundler } from "./src/main";

const bundler = new TypescriptBundler(path.resolve(__dirname, './examples/multi-import/index.ts'));

bundler.bundle().then(v => console.log(v.output));