import fs from 'fs';
import path from 'path';
import resolve from 'resolve';

export interface IModulePath {
  nodeModule: boolean;
  file: string;
};

const extensions = ['', '.ts', '.js'];

function resolveFileName(file: string, base: string): string | undefined {
  for (var i = 0; i < extensions.length; i++) {
    if (fs.existsSync(file + extensions[i])) { return file + extensions[i]; }
  }
  return undefined;
  // try {
  //   if (path.extname(file) !== '') { return file; }
  //   const _module = file.split('/')[file.split('/').length - 1];
  //   const res = resolve.sync(_module, { basedir: base });
  //   return res;
  // }
  // catch {
  //   console.log('Error')
  // }
}

function resolveNodeModule(moduleName: string, base: string): string | undefined {
  const debug = moduleName.indexOf('sha.js') >= 0;
  
  var findNodeModules = require('find-node-modules') as (any: string) => string[];
  const relModuleName = path.relative(base, moduleName);
  const modules = findNodeModules(base);
  const paths = modules.filter(v => path.extname(v) === '').map(v => {
    try {
      const absolutePath = path.resolve(base, v, relModuleName);
      const relativePath = path.relative(__dirname, absolutePath);
      const resolvedAbsolute = path.resolve(__dirname, relativePath);
      if (resolvedAbsolute.indexOf('node_modules') >= 0) {
        // Try to find the main file
        const moduleMain = (JSON.parse(fs.readFileSync(path.resolve(resolvedAbsolute, 'package.json'), 'utf-8')).main || 'index.js') as string
        return path.resolve(resolvedAbsolute, moduleMain);
      }
    } catch (e) {
      return null;
    }
  }).filter(v => !!v);
  debug && console.log('modules', modules)
  if (paths && paths.length > 0) {
    return paths[0] || undefined;
  }
}

export function resolveModule(moduleName: string, base: string): IModulePath {
  
  const fileName = resolveFileName(moduleName, base);
  
  if (fileName) {
    return {
      nodeModule: false,
      file: fileName
    }
  }

  const nodeModule = resolveNodeModule(moduleName, base);

  if (nodeModule) {
    return {
      nodeModule: false,
      file: nodeModule
    }
  }

  throw new Error(`Module ${path.relative(base, moduleName)} could not be found in ${base} or node_modules`);
}