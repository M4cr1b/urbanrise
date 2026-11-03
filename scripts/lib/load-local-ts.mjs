import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

/** Read-only loader for offline verification of the app's typed data modules. */
export function localTsLoader(root) {
  const cache = new Map();
  function load(filename) {
    filename = path.resolve(filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    if (filename.endsWith('.json')) return JSON.parse(fs.readFileSync(filename, 'utf8'));
    const loaded = { exports: {} };
    cache.set(filename, loaded);
    const require = createRequire(filename);
    const localRequire = (specifier) => {
      if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return require(specifier);
      const target = specifier.startsWith('@/') ? path.join(root, 'src', specifier.slice(2)) : path.resolve(path.dirname(filename), specifier);
      const resolved = [target, target + '.ts', path.join(target, 'index.ts')].find(file => fs.existsSync(file) && fs.statSync(file).isFile());
      if (!resolved) throw new Error('Cannot resolve ' + specifier);
      return load(resolved);
    };
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
      fileName: filename,
    }).outputText;
    new Function('require', 'module', 'exports', code)(localRequire, loaded, loaded.exports);
    return loaded.exports;
  }
  return load;
}
