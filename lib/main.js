"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypescriptBundler = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const typescript_1 = tslib_1.__importDefault(require("typescript"));
const js_beautify_1 = tslib_1.__importDefault(require("js-beautify"));
const requireRegex = /require\("(.*?)"\);/g;
class TypescriptBundler {
    constructor(file) {
        this.file = file;
        this.base = path_1.default.dirname(file);
    }
    findModules(jsCode) {
        const matches = jsCode.match(requireRegex);
        if (!matches) {
            return [];
        }
        return matches.map((v => v.replace('require("', '').replace('");', '')));
    }
    compileFile(file) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const tsCode = fs_1.default.readFileSync(file + (!path_1.default.extname(file) ? '.ts' : ''), 'utf-8');
            const jsCode = yield typescript_1.default.transpileModule(tsCode, {
                compilerOptions: {
                    baseUrl: this.base
                }
            });
            return {
                content: jsCode.outputText,
                file,
                modules: this.findModules(jsCode.outputText)
            };
        });
    }
    modulesToString(modules) {
        return js_beautify_1.default.js(`
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
      ${[...modules.keys()].map(module => `
      modules['${module}'] = function(exports) {
      ${modules.get(module)}}
      `).join('\n')}
      require('${path_1.default.relative(this.base, this.file)}')
    `, { indent_size: 2 });
    }
    bundle() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const modules = new Map([[path_1.default.relative(this.base, this.file), null]]);
            while ([...modules.keys()].filter(v => !modules.get(v)).length > 0) {
                const moduleKey = [...modules.keys()].filter(v => !modules.get(v))[0];
                const comp = yield this.compileFile(path_1.default.resolve(this.base, moduleKey));
                modules.set(moduleKey, comp.content);
                comp.modules.forEach(m => {
                    if (!modules.get(m)) {
                        modules.set(m, null);
                    }
                });
            }
            return {
                output: this.modulesToString(modules),
                modules: [...modules.keys()].map(v => path_1.default.resolve(this.base, v + (!path_1.default.extname(v) ? '.ts' : '')))
            };
        });
    }
}
exports.TypescriptBundler = TypescriptBundler;
