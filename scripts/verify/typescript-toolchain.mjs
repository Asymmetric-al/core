import { existsSync, globSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const exactVersion = /^\d+\.\d+\.\d+$/;

export function validateCompilerToolchain(snapshot) {
  const { api, native, parser, workspaces } = snapshot;
  if (
    !exactVersion.test(api.declared) ||
    !api.declared.startsWith("6.") ||
    api.installed !== api.declared ||
    !api.hasCompilerApi ||
    !api.hasEditorSdk
  ) {
    throw new Error(
      "Root tooling requires the pinned full TypeScript 6 JavaScript API and editor SDK",
    );
  }
  if (
    !exactVersion.test(native.declared) ||
    !native.declared.startsWith("7.") ||
    native.installed !== native.declared ||
    !native.rootCommandMatches
  ) {
    throw new Error(
      "Root tsc must resolve to the pinned TypeScript 7 native compiler alias",
    );
  }
  if (parser.apiPath !== api.apiPath || parser.version !== api.installed) {
    throw new Error(
      "typescript-eslint must resolve the supported root TypeScript 6 API",
    );
  }
  if (!workspaces.length)
    throw new Error("No product compiler workspaces found");
  for (const workspace of workspaces) {
    if (
      workspace.declared !== native.declared ||
      workspace.installed !== native.declared
    ) {
      throw new Error(
        `${workspace.path} must use the pinned TypeScript 7 product compiler`,
      );
    }
  }
  return snapshot;
}

export function verifyCompilerToolchain(root = repoRoot) {
  const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
  const rootPackage = readJson(path.join(root, "package.json"));
  const require = createRequire(path.join(root, "package.json"));
  const api = require("typescript");
  const apiPath = realpathSync(require.resolve("typescript"));
  const nativeManifestPath = require.resolve("@typescript/native/package.json");
  const nativePackage = readJson(nativeManifestPath);
  const nativeDirectory = path.dirname(nativeManifestPath);
  const parserRequire = createRequire(
    require.resolve("@typescript-eslint/parser"),
  );
  const estreeRequire = createRequire(
    parserRequire.resolve("@typescript-eslint/typescript-estree"),
  );
  const parserApi = estreeRequire("typescript");
  const workspaces = [
    ...new Set(
      globSync(
        rootPackage.workspaces.map((pattern) => `${pattern}/package.json`),
        { cwd: root },
      ),
    ),
  ]
    .sort()
    .flatMap((relative) => {
      const file = path.join(root, relative);
      const manifest = readJson(file);
      const declared =
        manifest.devDependencies?.typescript ??
        manifest.dependencies?.typescript;
      if (!declared) return [];
      const workspaceRequire = createRequire(file);
      return [
        {
          path: relative.replaceAll("\\", "/"),
          declared,
          installed: workspaceRequire("typescript/package.json").version,
        },
      ];
    });
  return validateCompilerToolchain({
    api: {
      declared: rootPackage.devDependencies.typescript,
      installed: api.version,
      apiPath,
      hasCompilerApi:
        typeof api.createSourceFile === "function" &&
        typeof api.parseConfigFileTextToJson === "function",
      hasEditorSdk: existsSync(
        path.join(
          path.dirname(require.resolve("typescript/package.json")),
          "lib/tsserver.js",
        ),
      ),
    },
    native: {
      declared: rootPackage.devDependencies["@typescript/native"]?.replace(
        /^npm:typescript@/,
        "",
      ),
      installed: nativePackage.version,
      rootCommandMatches:
        realpathSync(path.join(root, "node_modules/.bin/tsc")) ===
        realpathSync(path.join(nativeDirectory, nativePackage.bin.tsc)),
    },
    parser: {
      apiPath: realpathSync(estreeRequire.resolve("typescript")),
      version: parserApi.version,
    },
    workspaces,
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    const snapshot = verifyCompilerToolchain();
    console.log(
      `TypeScript ${snapshot.native.installed}: ${snapshot.workspaces.length} product workspaces; API/editor/parser ${snapshot.api.installed}`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
