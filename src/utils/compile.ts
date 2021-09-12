import fs from 'fs';
import path from 'path';
import ts, { TranspileOutput } from 'typescript';

export async function compile(absolutePath: string, base: string): Promise<TranspileOutput> {
  try {
    const tsCode = fs.readFileSync(
      absolutePath,
      "utf-8"
    );
    const jsCode = await ts.transpileModule(tsCode, {
      compilerOptions: {
        baseUrl: base,
        removeComments: true
      },
    });
    return jsCode;
  } catch (e) {
    console.log(absolutePath)
    throw e
  }
}

export async function compileRel(rel: string, base: string): Promise<TranspileOutput> {
  return compile(path.resolve(base, rel), base);
}