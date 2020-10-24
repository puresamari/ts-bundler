import path from 'path';
import fs from 'fs';

import { TypescriptBundler } from "./src/main";

const bundler = new TypescriptBundler(path.resolve(__dirname, './examples/multi-import/index.ts'));

bundler.bundle().then(v => {
  fs.writeFileSync(path.resolve(__dirname, 'test.export.js'), v.output);
});