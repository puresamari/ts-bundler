import path from 'path';
import { BehaviorSubject } from 'rxjs';
import { filter, first, map, tap } from 'rxjs/operators';

import { buildFile } from './buildFile';
import { compileRel } from './utils/compile';
import { findModules } from './utils/findModules';
import { IModulePath, resolveModule } from './utils/moduleResolution';

export class ModuleMapData extends Map<
  string,
  {
    content: string;
    node_module: boolean;
    file: string;
    absolutePath: string;
  } | undefined
> {}

export class ModuleMap extends BehaviorSubject<{
  output: string;
  map: ModuleMapData;
}> {
  constructor(private readonly base: string, private readonly file: string) {
    super({ output: "", map: new ModuleMapData() });
  }

  render(map: ModuleMapData = this.getValue().map) {
    return buildFile(map, this.base, path.relative(this.base, this.file));
  }

  private async compileFile(
    moduleKey: string,
    modules: ModuleMapData = new ModuleMapData([])
  ): Promise<ModuleMapData> {
    
    const _module = resolveModule(moduleKey, this.base);
    const js = { ...(await compileRel(_module.file, this.base)) };

    const submodules = findModules(js.outputText);

    // Go through the submodules
    for await (const subModule of submodules) {
      let file = subModule.moduleKey;
      let mod: IModulePath | undefined;

      // Try to identify the submodule file and path
      try {
        // First resolve the file directly like the require('...')
        mod = resolveModule(file, this.base);
      } catch {
        // If it fails, resolve it in relation to the file where it was imprted from
        try {
          file = path.join(path.dirname(moduleKey), subModule.moduleKey);
          mod = resolveModule(file, this.base);
        } catch (e) {
          if (!(e instanceof Error)) {
            throw e;
          }
        }
      }

      if (!mod) {
        modules.set(file, undefined);
      } else {
        // modify all the require(...) statements to use the actual file name.
        js.outputText = js.outputText.replace(subModule.match, subModule.match.replace(subModule.moduleKey, mod.file));
        await this.compileFile(mod.file, modules);
      }
    }
    
    modules.set(moduleKey, {
      content: js.outputText,
      file: moduleKey,
      absolutePath: path.resolve(this.base, moduleKey),
      node_module: moduleKey.indexOf('node_modules') >= 0,
    });

    return modules;
  }

  public async rebundle() {
    const map = await this.compileFile(path.relative(this.base, this.file));

    this.next({
      output: this.render(map),
      map,
    });
  }

  public async refreshModule(_module: string) {
    const map = this.getValue().map;
    this.compileFile(_module, map);
    this.next({
      map,
      output: this.render()
    });
  }
}

export class TypescriptBundler {
  private readonly modules: ModuleMap;

  constructor(public readonly file: string, public readonly base?: string) {
    this.base = base || path.dirname(file);
    this.modules = new ModuleMap(this.base, file);
  }

  public refreshModule(_module: string) {
    this.modules.refreshModule(_module);
  }

  public observe(rebundle = true, once = false) {
    if (rebundle) {
      this.modules.rebundle();
    }
    return this.modules.pipe(
      filter((v) => !!v && !!v.map && v.map.size > 0),
      once ? first() : tap()
    );
  }

  public async bundle() {
    return new Promise<{
      output: string;
      map: ModuleMapData;
    }>((resolve) => {
      this.observe(true, true).pipe(first()).subscribe((v) => {
        resolve(v);
      });
    });
  }
}
