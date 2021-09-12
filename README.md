# TS-Bundler

This is a **(super)** lightweight typescript bundle library, which I created for my build tool [@puresamari/spb]([https://](https://www.npmjs.com/package/@puresamari/spb)) since webpack creates way too much overhead.

# Installation

`npm i[nstall] [--save[-dev]|-D|-S] @puresamari/ts-bundler`

# Usage

```ts
import { TypescriptBundler } from '@puresamari/ts-bundler';

...

// Create the bundler with the file as attribute (file has to be an absolute path)
const bundler = new TypescriptBundler(file);
```

The bundlers observe method returns a rxjs observable that contains the following values:

```ts
interface {
  output: string,
  map: Map<string, {
    content: string;
    node_module: boolean;
    file: string;
    absolutePath: string;
  }>
}
```

The observe method takes 2 oparameters:
- Rebundle: should the bundle be compiled when running observe() (default = true)
- Once, should you only get the first trigger. (default = false)


## Example use cases
(To run these please first create a bundler instance like above.)

The examples compile file into `test.export.js`.

### Bundle the module:
```ts
import fs from 'fs';

const result = bundler.observe().subscribe(({ output }) => {
  fs.writeFileSync(path.resolve(__dirname, 'test.export.js'), v.output);
});
```

### The same but with file watching and module replacement:
```ts
import fs from 'fs';

const result = bundler.observe().subscribe(({ output }) => {
  fs.writeFileSync(path.resolve(__dirname, 'test.export.js'), v.output);
});

bundler.observe(false, true).subscribe(v => {
  v.map.forEach((v, _module) => {
    if (!v?.file || v.node_module) { return; }
    fs.watchFile(v.absolutePath, () => {
      bundler.refreshModule(_module);
    })
  })
});

```

### Bundle once using await:
```ts
import fs from 'fs';

fs.writeFileSync(path.resolve(__dirname, 'test.export.js'), await bundle.bundle().output);
```

### Bundle once using promise:
```ts
import fs from 'fs';

bundle.bundle().then(({ output }) => fs.writeFileSync(path.resolve(__dirname, 'test.export.js'), output);
```

