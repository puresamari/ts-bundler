import path from "path";
import { js } from "js-beautify";

const HEAD = `
"use strict";
// common code for implementing require()/exports
var dependencies = {} // loaded modules
var modules = {} // code of your dependencies
// require function
var require = function (_module) {
  if (!dependencies[_module]) {
    // module not loaded, let's load it
    var exports = {}
    modules[_module](exports, { module: _module })
    // now in exports we have the things made "public"
    dependencies[_module] = exports
  }
  return dependencies[_module]
}
`;

function buildModule(key: string, module: { node_module: boolean; content: string; }, base: string) {
  const name = module.node_module ? path.relative(base, key) : './' + path.relative(base, key);
  return `modules['${name}'] = function(exports, module) {
    // ${module.node_module}
    ${module.content || '/* empty */'}
  }`;
}

export function buildFile(modules: Map<string, { node_module: boolean; content: string; }>, base: string, entryFile?: string) {
  const file = entryFile || [...modules.keys()][0];
  if (!file) {
    return "// Error while bundling: No entry file found";
  }
  return js(
    [
      HEAD,
      ...[...modules.keys()].map((name) => buildModule(name, modules.get(name)!, base)),
      `require("./${path.relative(base, file)}")`,
    ].join("\n\n"),
    { indent_size: 2 }
  );
}
