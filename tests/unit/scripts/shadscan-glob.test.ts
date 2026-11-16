import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import {
  createScannerGlobHooks,
  normalizeScannerMatches,
  normalizeScannerPatterns,
} from "../../../scripts/verify/shadscan-glob.mjs";
import {
  scannerArguments,
  scannerEnvironment,
} from "../../../scripts/verify/shadscan.mjs";

const require = createRequire(import.meta.url);
const cliRequire = createRequire(require.resolve("@shadscan/cli/package.json"));
const globURL = pathToFileURL(cliRequire.resolve("tinyglobby")).href;
const preloadURL = new URL(
  "../../../scripts/verify/shadscan-glob.mjs",
  import.meta.url,
).href;

describe("Shadscan Windows glob discovery", () => {
  it("adds only the trusted preload on Windows, including staged roots", () => {
    const args = scannerArguments("scanner", "index snapshot", "win32");
    expect(args).toEqual([
      "--import",
      preloadURL,
      "scanner",
      "index snapshot",
      "--json",
      "--no-interactive",
      "--no-roast",
    ]);
    expect(scannerArguments("scanner", "index snapshot", "linux")).toEqual(
      args.slice(2),
    );
  });

  it("normalizes native string and array patterns without mutating the input", () => {
    const patterns = ["app\\**\\page.tsx", "!app\\ignored\\**"];
    expect(normalizeScannerPatterns(patterns)).toEqual([
      "app/**/page.tsx",
      "!app/ignored/**",
    ]);
    expect(normalizeScannerPatterns("app\\global-error.tsx")).toBe(
      "app/global-error.tsx",
    );
    expect(patterns[0]).toBe("app\\**\\page.tsx");
  });

  it("normalizes only absolute Windows results without mutating matches", () => {
    const matches = ["C:/workspace/app/page.tsx"];
    expect(
      normalizeScannerMatches(matches, { absolute: true }, "win32"),
    ).toEqual([String.raw`C:\workspace\app\page.tsx`]);
    expect(normalizeScannerMatches(matches, { absolute: true }, "linux")).toBe(
      matches,
    );
    expect(normalizeScannerMatches(matches, { absolute: false }, "win32")).toBe(
      matches,
    );
    expect(normalizeScannerMatches(matches, undefined, "win32")).toBe(matches);
    expect(matches).toEqual(["C:/workspace/app/page.tsx"]);
  });

  it("does not intercept other importers, dependencies, or operating systems", () => {
    const scannerURL = "file:///scanner/cli.js";
    const nextResolve = (specifier: string) => ({
      url: "original:" + specifier,
    });
    for (const [platform, parentURL, specifier] of [
      ["linux", scannerURL, "tinyglobby"],
      ["win32", "file:///scanner/other.js", "tinyglobby"],
      ["win32", scannerURL, "node:path"],
      ["win32", scannerURL, globURL],
    ]) {
      const hooks = createScannerGlobHooks({ scannerURL, platform });
      expect(hooks.resolve(specifier, { parentURL }, nextResolve)).toEqual(
        nextResolve(specifier),
      );
    }
  });

  it.runIf(process.platform === "win32")(
    "discovers native pages and boundaries through the real glob without changing other imports",
    () => {
      const fixture = mkdtempSync(
        path.join(os.tmpdir(), "core-shadscan-glob-"),
      );
      try {
        for (const file of [
          "app/page.tsx",
          "app/loading.tsx",
          "app/settings/page.tsx",
          "app/global-error.tsx",
          "app/global-not-found.tsx",
          "app/ignored/page.tsx",
          "outside/page.tsx",
        ]) {
          mkdirSync(path.dirname(path.join(fixture, file)), {
            recursive: true,
          });
          writeFileSync(path.join(fixture, file), "export default null;\n");
        }
        const dependency = path.join(fixture, "node_modules/tinyglobby");
        mkdirSync(dependency, { recursive: true });
        writeFileSync(
          path.join(dependency, "package.json"),
          JSON.stringify({ type: "module", exports: "./index.mjs" }),
        );
        writeFileSync(
          path.join(dependency, "index.mjs"),
          "export * from " + JSON.stringify(globURL) + ";\n",
        );
        writeFileSync(
          path.join(fixture, "other.mjs"),
          'import { glob } from "tinyglobby"; export { glob };\n',
        );
        const binary = path.join(fixture, "cli.mjs");
        writeFileSync(
          binary,
          [
            'import { glob, globSync } from "tinyglobby";',
            'import { glob as unwrapped } from "./other.mjs";',
            'const options = { cwd: process.argv[2], absolute: true, onlyFiles: true, followSymbolicLinks: false, ignore: ["app/ignored/**"] };',
            'const patterns = ["app\\\\**\\\\page.tsx", "app\\\\global-error.tsx", "app\\\\global-not-found.tsx"];',
            "console.log(JSON.stringify({",
            "native: (await glob(patterns, options)).sort(),",
            "single: (await glob(patterns[1], options)).sort(),",
            'posix: (await glob(patterns.map(pattern => pattern.replaceAll("\\\\", "/")), options)).sort(),',
            "other: await unwrapped(patterns, options), syncExport: typeof globSync, options,",
            "}));",
          ].join("\n"),
        );
        const vendorBefore = readFileSync(cliRequire.resolve("tinyglobby"));
        const result = JSON.parse(
          execFileSync(process.execPath, scannerArguments(binary, fixture), {
            env: scannerEnvironment(),
            encoding: "utf8",
            timeout: 10_000,
          }),
        );
        expect(result.native).toEqual(result.posix);
        const relative = (file: string) =>
          path.relative(fixture, file).replaceAll("\\", "/");
        expect(result.native.map(relative)).toEqual([
          "app/global-error.tsx",
          "app/global-not-found.tsx",
          "app/page.tsx",
          "app/settings/page.tsx",
        ]);
        expect(result.single.map(relative)).toEqual(["app/global-error.tsx"]);
        const appDir = path.resolve(fixture, "app");
        const hasLoadingBoundary = (file: string) => {
          let currentDir = path.dirname(file);
          while (currentDir.startsWith(appDir)) {
            if (existsSync(path.join(currentDir, "loading.tsx"))) return true;
            if (currentDir === appDir) break;
            currentDir = path.dirname(currentDir);
          }
          return false;
        };
        expect(
          result.native
            .filter((file: string) => file.endsWith("page.tsx"))
            .every(hasLoadingBoundary),
        ).toBe(true);
        expect(result.other).toEqual([]);
        expect(result.syncExport).toBe("function");
        expect(result.options.followSymbolicLinks).toBe(false);
        expect(result.options.ignore).toEqual(["app/ignored/**"]);
        expect(readFileSync(cliRequire.resolve("tinyglobby"))).toEqual(
          vendorBefore,
        );
      } finally {
        if (
          !path
            .resolve(fixture)
            .startsWith(path.join(os.tmpdir(), "core-shadscan-glob-"))
        )
          throw new Error("Unexpected fixture directory");
        rmSync(fixture, { recursive: true, force: true });
      }
    },
  );
});
