import fs from 'fs';
import path from 'path';
import resolve from 'resolve';

export interface IModulePath {
  nodeModule: boolean;
  file: string;
};

function reqRes(file: string, basedir: string): string {
  if (path.extname(file) !== '') { return file; }
  const module = file.split('/')[file.split('/').length - 1];
  const res = resolve.sync(module, { basedir });
  return res;
}

function resolveFileName(file: string, base: string) {
  try { return reqRes(file, base); }
  catch {
    if (fs.existsSync(file + '.ts')) { return file + '.ts'; }
    return file;
  }
}

function resolveModulee(moduleName: string, base: string): IModulePath | null {
  if (!path.extname(moduleName) || path.extname(moduleName) === '') {
    var findNodeModules = require('find-node-modules') as (any: string) => string[];
    const modules = findNodeModules(base);
    const paths = modules.filter(v => path.extname(v) === '').map(v => {
      try {
        const absolutePath = path.resolve(base, v, moduleName.replace(base + '/', ''));
        const relativePath = path.relative(__dirname, absolutePath);
        const resolvedAbsolute = path.resolve(__dirname, relativePath);
        if (resolvedAbsolute.indexOf('node_modules') >= 0) {
          const moduleConfig = JSON.parse(fs.readFileSync(path.resolve(resolvedAbsolute, 'package.json'), 'utf-8')) as { main: string }
          return { nodeModule: true, file: path.resolve(resolvedAbsolute, moduleConfig.main) };
          // return { nodeModule: true, file: require.resolve('relativePath') };
        }
      } catch (e) {
        return null;
      }
    }).filter(v => !!v);
    if (paths && paths.length > 0) {
      return paths![0] as { nodeModule: boolean, file: string };
    }
  }

  return {
    nodeModule: false,
    file: resolveFileName(moduleName, base)
  }
}

export function resolveModule(moduleName: string, base: string) {
  return resolveModulee(moduleName, base);
}