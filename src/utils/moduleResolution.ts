import fs from 'fs';
import path from 'path';
import resolve from 'resolve';

export interface IModulePath {
  nodeModule: boolean;
  file: string;
  absolutePath: string;
};

const extensions = ['.ts', '.js', ''];
const moduleFiles = ['common.js', 'index.js', 'index.ts'];

function resolveFileName(file: string, base: string): string | undefined {
  const absFile = path.resolve(base, file);
  for (var i = 0; i < extensions.length; i++) {
    if (fs.existsSync(absFile + extensions[i])) {
      let stats: fs.Stats = fs.statSync(absFile + extensions[i]);
      if (stats.isFile()) { return absFile + extensions[i]; }
      if (stats.isDirectory()) {
        const indexFile = moduleFiles.map(v => path.resolve(absFile, v)).find(fs.existsSync);
        if (indexFile) { return indexFile; }
      }
    }
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

function resolveNodeModule(relModuleName: string, base: string): string | undefined {
  
  var findNodeModules = require('find-node-modules') as (any: string) => string[];
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
  if (paths && paths.length > 0) {
    return paths[0] || undefined;
  }
}

export function resolveModule(moduleName: string, base: string): IModulePath {
  
  const fileName = resolveFileName(moduleName, base);
  
  if (fileName) {
    return {
      nodeModule: false,
      file: path.relative(base, fileName),
      absolutePath: fileName,
    }
  }

  const nodeModule = resolveNodeModule(moduleName, base);

  if (nodeModule) {
    return {
      nodeModule: true,
      file: path.relative(base, nodeModule),
      absolutePath: nodeModule,
    }
  }

  throw new Error(`Module ${moduleName} could not be found in ${base} or node_modules`);
}