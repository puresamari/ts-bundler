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

/*
bundle returns:
{
  output: string;
  modules: string[];
}
*/
const result = await bundler.bundle();

```

Feel free to let me know what you think
