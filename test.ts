import path from 'path';

import { TypescriptBundler } from "./src/main";

const bundler = new TypescriptBundler(path.resolve(__dirname, './examples/example-projects/multi-import/index.ts'));

bundler.bundle().then(() => console.log('success'));