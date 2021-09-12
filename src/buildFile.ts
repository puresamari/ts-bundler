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
    var module = { exports: {} };
    if (typeof modules[_module] !== 'function') {
      throw new Error("Module '" + _module + "' not found!")
    }
    modules[_module](module, module.exports)
    dependencies[_module] = module;
  }
  return dependencies[_module] ? dependencies[_module].exports : undefined
}
`;

function buildModule(key: string, module: { node_module: boolean; content: string; } | undefined, base: string) {
  // const name = module.node_module ? path.relative(base, key) : './' + path.relative(base, key);
  return `modules['${key}'] = function(module, exports) {
    ${module?.content || '/* empty */'}
  }`;
}

export function buildFile(modules: Map<string, { node_module: boolean; content: string; } | undefined>, base: string, entryFile: string) {
  if (!entryFile) {
    return "// Error while bundling: No entry file found";
  }
  return js(
    [
      HEAD,
      ...[...modules.keys()].map((name) => buildModule(name, modules.get(name), base)),
      `require("${entryFile}")`,
    ].join("\n\n"),
    { indent_size: 2 }
  );
}
