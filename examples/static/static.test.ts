import path from 'path';
import fs from 'fs';

import { TypescriptBundler } from "../../src/main";

const bundler = new TypescriptBundler(path.resolve(__dirname, '../example-projects/multi-import/index.ts'));
const dist = path.resolve(__dirname, 'dist');

if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist);
}

bundler.bundle().then(v => {
  fs.writeFileSync(path.resolve(dist, 'test.export.js'), v.output);
  fs.writeFileSync(path.resolve(dist, 'index.html'), `<body><script type="text/javascript" src="./test.export.js"></script></body>`);
});
