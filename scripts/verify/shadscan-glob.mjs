import { realpathSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

export function normalizeScannerPatterns(patterns) {
  const normalize = (pattern) => pattern.replaceAll("\\", "/");
  return typeof patterns === "string"
    ? normalize(patterns)
    : patterns.map(normalize);
}

export function normalizeScannerMatches(
  matches,
  options,
  platform = process.platform,
) {
  return platform === "win32" && options?.absolute
    ? matches.map((file) => path.win32.normalize(file))
    : matches;
}

export function createScannerGlobHooks({
  scannerURL,
  platform = process.platform,
}) {
  return {
    resolve(specifier, context, nextResolve) {
      const resolved = nextResolve(specifier, context);
      if (
        platform !== "win32" ||
        specifier !== "tinyglobby" ||
        context.parentURL !== scannerURL
      )
        return resolved;
      const dependency = JSON.stringify(resolved.url);
      const source = `
export * from ${dependency};
import { glob as originalGlob } from ${dependency};
import { normalizeScannerMatches, normalizeScannerPatterns } from ${JSON.stringify(import.meta.url)};
export const glob = async (patterns, options) => normalizeScannerMatches(
  await originalGlob(normalizeScannerPatterns(patterns), options),
  options,
);
`;
      return {
        url: `data:text/javascript,${encodeURIComponent(source)}`,
        shortCircuit: true,
      };
    },
  };
}

if (process.platform === "win32" && process.argv[1]) {
  registerHooks(
    createScannerGlobHooks({
      scannerURL: pathToFileURL(realpathSync(process.argv[1])).href,
    }),
  );
}
