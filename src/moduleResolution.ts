import path from 'path';


function resolveModulee(moduleName: string, base: string) {
  var findNodeModules = require('find-node-modules') as (any: string) => string[];
  const modules = findNodeModules(base);
  const paths = modules.map(v => {
    try {
      return { nodeModule: true, file: require.resolve(
        path.resolve(base, v, moduleName.replace(base + '/', ''))
      ) };
    } catch {
      return null;
    }
  }).filter(v => !!v);
  if (paths && paths.length > 0) {
    return paths![0] as { nodeModule: boolean, file: string };
  }

  try {
    return { nodeModule: false, file: require.resolve(moduleName) };
  } catch (e) {
    try {
      return { nodeModule: false, file: require.resolve(moduleName.replace(base + '/', '')) };
    } catch (e) {
      return { nodeModule: true, file: moduleName.replace(base + '/', '') };
    }
  }
}

export function resolveModule(moduleName: string, base: string) {
  return resolveModulee(moduleName, base);
}