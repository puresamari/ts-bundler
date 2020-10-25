import path from 'path';
import fs from 'fs';

import { TypescriptBundler } from "./src/main";

const bundler = new TypescriptBundler(path.resolve(__dirname, './examples/multi-import/index.ts'));

bundler.bundle().then(() => console.log('success'));
