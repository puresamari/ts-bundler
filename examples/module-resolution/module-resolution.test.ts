import path from 'path';
import fs from 'fs';

import { TypescriptBundler } from "../../src/main";

const bundler = new TypescriptBundler(path.resolve(__dirname, '../example-projects/multi-import/index.ts'));

const dist = path.resolve(__dirname, 'dist');

if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist);
}

bundler.observe().subscribe(v => {
  console.log('rebuilding');
  fs.writeFileSync(path.resolve(dist, 'test.export.js'), v.output);
  fs.writeFileSync(path.resolve(dist, 'index.html'), `<body><script type="text/javascript" src="./test.export.js"></script></body>`);
});

bundler.observe(false, true).subscribe(v => {
  v.map.forEach((v, file) => {
    if (!v?.file || v.node_module) { return; }
    let initial = true;
    fs.watchFile(v.file, () => {
      if (initial) {
        initial = false;
        return;
      }
      bundler.refreshModule(file);
    })
  })
});
