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
  console.log('built!');
});

bundler.observe(false, true).subscribe(v => {
  v.map.forEach((v, _module) => {
    if (!v?.file || v.node_module) { return; }
    let initial = true;

    fs.watchFile(v.absolutePath, () => {
      if (initial) {
        initial = false;
        return;
      }
      console.log('want to refershisdf');
      bundler.refreshModule(_module);
    })
  })
});
