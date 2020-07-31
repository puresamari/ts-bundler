import path from "path";
import { js } from "js-beautify";

const HEAD = `
"use strict";
// common code for implementing require()/exports
var dependencies = {} // loaded modules
var modules = {} // code of your dependencies
// require function
var require = function (module) {
  console.log('require', module)
  if (!dependencies[module]) {
    // module not loaded, let's load it
    var exports = {}
    modules[module](exports)
    // now in exports we have the things made "public"
    dependencies[module] = exports
  }
  return dependencies[module]
}
`;

function buildModule(moduleName: string, moduleContent: string | null | undefined) {
  return `modules['${moduleName}'] = function(exports) { ${moduleContent || '/* empty */'} }`;
}

export function buildFile(modules: Map<string, { node_module: boolean; content: string; }>, base: string) {
  const file = [...modules.keys()][0];
  if (!file) {
    return "// Error while bundling: No entry file found";
  }
  return js(
    [
      HEAD,
      ...[...modules.keys()].map((moduleName) => buildModule(moduleName, modules.get(moduleName)?.content)),
      `require('${file}')`,
    ].join("\n\n"),
    { indent_size: 2 }
  );
}
