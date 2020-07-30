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
    file: string;
    modules: string[];
  }> {
    const tsCode = fs.readFileSync(resolveModule(file, this.base), 'utf-8');
    const jsCode = await ts.transpileModule(tsCode, {
      compilerOptions: {
        baseUrl: this.base
      }
    });
    return {
      content: jsCode.outputText,
      file,
      modules: this.findModules(jsCode.outputText)
    }
  }

  private modulesToString(modules: Map<string, string>) { return buildFile(modules, this.base); }

  public async bundle() {
    const modules = new Map<string, string | null>([ [path.relative(this.base, this.file), null] ]);

    while ([ ...modules.keys() ].filter(v => !modules.get(v)).length > 0) {
      const moduleKey = [ ...modules.keys() ].filter(v => !modules.get(v))[0];
      const comp = await this.compileFile(path.resolve(this.base, moduleKey));
      modules.set(moduleKey, comp.content);
      comp.modules.forEach(m => {
        if (!modules.get(m)) {
          modules.set(m, null);
        }
      });
    }

    return {
      output: this.modulesToString(modules as Map<string, string>),
      modules: [ ...modules.keys() ].map(v => path.resolve(this.base, v + (!path.extname(v) ? '.ts' : '')))
    };
  }
}