import fs from 'fs';
import path from 'path';
import { BehaviorSubject, pipe } from 'rxjs';
import { distinctUntilChanged, filter, first, map, tap } from 'rxjs/operators';
import ts from 'typescript';

import { buildFile } from './buildFile';
import { IModulePath, resolveModule } from './moduleResolution';

const requireRegex = /require\("(.*?)"\);/g;

export class ModuleMapData extends Map<string, {
  content: string;
  node_module: boolean;
  file: IModulePath;
  modules: string[];
}> {}

export class ModuleMap extends BehaviorSubject<{
    output: string,
    map: ModuleMapData
  }> {

  constructor(private readonly base: string, private readonly file: string) {
    super({ output: '', map: new ModuleMapData() });
  }

  render(map?: ModuleMapData) {
    return buildFile((map || this.getValue().map), this.base);
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
    const tsCode = fs.readFileSync(resolveModule(file, this.base)!.file, 'utf-8');
    const jsCode = await ts.transpileModule(tsCode, {
      compilerOptions: {
        baseUrl: this.base
      }
    });
    return {
      content: jsCode.outputText,
      file,
      node_module: resolveModule(file, this.base)!.nodeModule,
      modules: this.findModules(jsCode.outputText)
    }
  }

  public async rebundle() {
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

    const iter = ([ ...modules.values() ])
    .filter(v => !!v)
    .map((v) => [ v!.file, { ...v, file: resolveModule(path.resolve(this.base, v!.file), this.base) } ] as [
      string, {
        content: string;
        node_module: boolean;
        file: IModulePath;
        modules: string[];
      }
    ])

    const map = new ModuleMapData(iter);

    this.next({
      output: this.render(map),
      map
    });

  }

  public async refreshModule(module: string) {
    if (!this.getValue().map.has(module)) { return; }
    const d = await this.compileFile(path.resolve(this.base, module));
    this.getValue().map.get(module)!.content = d.content;
    // TODO: compiling could probably also be done directly in the file instead of recompiling as a whole.
    this.getValue().output = this.render();
    this.next(this.getValue());
  }
}

export class TypescriptBundler {

  public readonly base: string;
  private readonly modules: ModuleMap;

  constructor(public readonly file: string) {
    this.base = path.dirname(file);
    this.modules = new ModuleMap(this.base, file);
  }

  public refreshModule(module: string) {
    this.modules.refreshModule(module);
  }

  public observe(rebundle = true, once = false) {
    if (rebundle) {
      this.modules.rebundle();
    }
    return this.modules.pipe(
      filter(v => !!v && !!v.map && v.map.size > 0),
      once ? first() : tap()
    );
  }

}