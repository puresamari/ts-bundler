import fs from 'fs';
import path from 'path';

import ts from 'typescript';
import beautify from 'js-beautify';
import { resolveModule } from './moduleResolution';
import { buildFile } from './buildFile';

const requireRegex = /require\("(.*?)"\);/g

export class TypescriptBundler {

  public readonly base: string;

  constructor(public readonly file: string) {
    this.base = path.dirname(file);
  }

  private findModules(jsCode: string): string[] {
    const matches = (jsCode.match(requireRegex) as string[]);
    if (!matches) { return []; }
    return matches.map(
      (v => v.replace('require("', '').replace('");', ''))
    )
  }

  private async compileFile(file: string): Promise<{
    content: string;
    node_module: boolean;
    file: string;
    modules: string[];
  }> {
    const tsCode = fs.readFileSync(resolveModule(file, this.base).file, 'utf-8');
    const jsCode = await ts.transpileModule(tsCode, {
      compilerOptions: {
        baseUrl: this.base
      }
    });
    return {
      content: jsCode.outputText,
      file,
      node_module: resolveModule(file, this.base).nodeModule,
      modules: this.findModules(jsCode.outputText)
    }
  }

  private modulesToString(modules: Map<string, {  node_module: boolean; content: string }>) { return buildFile(modules, this.base); }

  public async bundle() {
    const modules = new Map<string, {
      node_module: boolean;
      content: string;
      file: string;
    } | null>([ [path.relative(this.base, this.file), null] ]);

    while ([ ...modules.keys() ].filter(v => !modules.get(v)).length > 0) {
      const moduleKey = [ ...modules.keys() ].filter(v => !modules.get(v))[0];
      const comp = await this.compileFile(path.resolve(this.base, moduleKey));
      modules.set(moduleKey, comp);
      comp.modules.forEach(m => {
        if (!modules.get(m)) {
          modules.set(m, null);
        }
      });
    }

    return {
      output: this.modulesToString(modules as Map<string, { node_module: boolean; content: string; }>),
      modules: ([ ...modules.values() ])
        .filter(v => !!v)
        .filter(v => !v?.node_module)
        .map((v) => ({ ...v, file: require.resolve(path.resolve(this.base, v!.file)) }))
    };
  }
}