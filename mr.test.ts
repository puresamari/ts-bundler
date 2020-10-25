import path from 'path';
import fs from 'fs';

import { TypescriptBundler } from "./src/main";

const bundler = new TypescriptBundler(path.resolve(__dirname, './examples/multi-import/index.ts'));

bundler.observe().subscribe(v => {
  console.log('rebuilding');
  fs.writeFileSync(path.resolve(__dirname, 'test.export.js'), v.output);
});

bundler.observe(false, true).subscribe(v => {
  v.map.forEach((v, file) => {
    if (v.file.nodeModule) { return; }
    console.log('watching', v.file.file)
    fs.watchFile(v.file.file, () => {
      bundler.refreshModule(file);
    })
  })
});
