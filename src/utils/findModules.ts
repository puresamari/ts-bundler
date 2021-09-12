const requireRegex = /require\((("(.*?)")|('(.*?)'))\)/g;

export function findModules(jsCode: string): { moduleKey: string, match: string }[] {
  const matches = jsCode.match(requireRegex) as string[];
  if (!matches) {
    return [];
  }
  return matches.map((v) => ({
    moduleKey: v
      .replace('require("', "").replace('")', "")
      .replace("require('", "").replace("')", ""),
    match: v
  }));
}