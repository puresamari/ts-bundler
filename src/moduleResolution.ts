export function resolveModule(moduleName: string, base: string) {
  try {
    return require.resolve(moduleName);
  } catch (e) {
    return require.resolve(moduleName.replace(base + '/', ''));
  }
}