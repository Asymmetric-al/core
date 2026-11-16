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

// Bun's pinned Windows shim stores its target and Node launcher in UTF-16LE.
// Verify that target instead of treating the .exe wrapper as a Unix symlink.
export function resolveRootCompilerCommand(root, platform = process.platform) {
  const bin = path.join(root, "node_modules", ".bin", "tsc");
  if (platform !== "win32") return realpathSync(bin);
  if (!existsSync(bin + ".exe") || !existsSync(bin + ".bunx")) return null;
  const shim = readFileSync(bin + ".bunx");
  if (shim.length < 16 || shim.length % 2) return null;
  const flags = shim.readUInt16LE(shim.length - 2);
  // Version 5, Node launcher, shebang present; bit 3 permits absolute targets.
  if ((flags & ~8) !== ((2739 << 4) | 7)) return null;
  const targetBytes = shim.readUInt32LE(shim.length - 10);
  const launcherBytes = shim.readUInt32LE(shim.length - 6);
  if (
    !targetBytes ||
    targetBytes % 2 ||
    launcherBytes !== 10 ||
    targetBytes + 4 + launcherBytes + 10 !== shim.length
  )
    return null;
  if (
    shim.toString("utf16le", targetBytes, targetBytes + 4) !== '\"\0' ||
    shim.toString("utf16le", targetBytes + 4, targetBytes + 14) !== "node "
  )
    return null;
  const target = shim.toString("utf16le", 0, targetBytes);
  if (target.includes("\0")) return null;
  const resolved = path.resolve(
    root,
    "node_modules",
    target.replaceAll("\\", path.sep),
  );
  return existsSync(resolved) ? realpathSync(resolved) : null;
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
        resolveRootCompilerCommand(root) ===
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
