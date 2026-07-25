import fs from "node:fs";
import path from "node:path";

import ts from "typescript";
import type { Plugin } from "vitest/config";

/**
 * Per-importer `@/` alias for the root Vitest config.
 *
 * There is no repo-root `src/`, so `@/` has no single target; each workspace's
 * tsconfig maps `@/*` to its own directory (see docs/ai/rules/frontend.md).
 * This module discovers those mappings and resolves `@/x` against the
 * workspace that contains the importing file, mirroring per-workspace
 * tsconfig `paths`.
 */

export interface AtAliasWorkspace {
  /** Absolute path of the workspace directory (e.g. `<root>/packages/ui`). */
  workspaceRoot: string;
  /** Absolute directory that `@/*` maps onto (the tsconfig `paths` target). */
  aliasBaseDir: string;
}

const WORKSPACE_GROUPS = ["apps", "packages"];

function diagnosticText(diagnostic: ts.Diagnostic): string {
  return ts.flattenDiagnosticMessageText(diagnostic.messageText, " ");
}

function readAtAliasTarget(tsconfigPath: string): string | undefined {
  const tsconfigText = fs.readFileSync(tsconfigPath, "utf8");
  // Fast path only: workspaces without the alias never need parsing, which also
  // keeps parse failures scoped to configs that actually declare `@/*`.
  if (!tsconfigText.includes("@/*")) {
    return undefined;
  }

  // `tsconfig.json` is JSONC (comments and trailing commas are legal), so parse
  // it the way `tsc` does rather than with `JSON.parse`. TypeScript asserts
  // that the file name it is handed is already slash-normalized.
  const { config, error } = ts.parseConfigFileTextToJson(
    tsconfigPath.replaceAll("\\", "/"),
    tsconfigText,
  );
  if (error) {
    throw new Error(
      `Cannot parse ${tsconfigPath} while discovering "@/*" path aliases for Vitest: ${diagnosticText(error)}`,
    );
  }

  const parsed: unknown = config;
  if (typeof parsed !== "object" || parsed === null) {
    return undefined;
  }

  const compilerOptions = (parsed as Record<string, unknown>).compilerOptions;
  if (typeof compilerOptions !== "object" || compilerOptions === null) {
    return undefined;
  }

  const paths = (compilerOptions as Record<string, unknown>).paths;
  if (typeof paths !== "object" || paths === null) {
    return undefined;
  }

  const targets = (paths as Record<string, unknown>)["@/*"];
  if (!Array.isArray(targets) || typeof targets[0] !== "string") {
    return undefined;
  }

  return targets[0];
}

export function discoverAtAliasWorkspaces(rootDir: string): AtAliasWorkspace[] {
  const workspaces: AtAliasWorkspace[] = [];

  for (const group of WORKSPACE_GROUPS) {
    const groupDir = path.join(rootDir, group);
    if (!fs.existsSync(groupDir)) {
      continue;
    }

    for (const entry of fs.readdirSync(groupDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }

      const workspaceRoot = path.join(groupDir, entry.name);
      const tsconfigPath = path.join(workspaceRoot, "tsconfig.json");
      if (!fs.existsSync(tsconfigPath)) {
        continue;
      }

      const aliasTarget = readAtAliasTarget(tsconfigPath);
      if (aliasTarget === undefined) {
        continue;
      }

      // `"@/*": ["./*"]` maps onto the workspace root; `"./src/*"` onto src/.
      const targetBase = aliasTarget.replace(/\*$/, "");
      workspaces.push({
        workspaceRoot,
        aliasBaseDir: path.resolve(workspaceRoot, targetBase),
      });
    }
  }

  return workspaces;
}

export function findWorkspaceForImporter(
  workspaces: AtAliasWorkspace[],
  importer: string,
): AtAliasWorkspace | undefined {
  const [importerFsPath] = importer.split("?");
  if (!importerFsPath) {
    return undefined;
  }

  const normalizedImporter = path.normalize(importerFsPath);
  const containing = workspaces.filter((workspace) => {
    const relative = path.relative(workspace.workspaceRoot, normalizedImporter);
    return (
      relative !== "" &&
      !relative.startsWith("..") &&
      !path.isAbsolute(relative)
    );
  });

  // Most specific wins if workspace directories ever nest.
  let best: AtAliasWorkspace | undefined;
  for (const workspace of containing) {
    if (!best || workspace.workspaceRoot.length > best.workspaceRoot.length) {
      best = workspace;
    }
  }
  return best;
}

/**
 * Files outside every `@/`-mapped workspace (including test files) are left
 * to Vite's normal resolution, which reports them as unresolved `@/...`
 * imports naming the importing file — there is deliberately no fallback.
 * A mapped-but-missing target behaves the same way: returning the joined path
 * would make Vite fail later on loading a file that does not exist, hiding the
 * `@/...` specifier that actually needs fixing.
 */
export function perImporterAtAlias(rootDir: string): Plugin {
  const workspaces = discoverAtAliasWorkspaces(rootDir);

  return {
    name: "core:per-importer-at-alias",
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (!source.startsWith("@/") || !importer) {
        return null;
      }

      const workspace = findWorkspaceForImporter(workspaces, importer);
      if (!workspace) {
        return null;
      }

      const target = path.join(
        workspace.aliasBaseDir,
        source.slice("@/".length),
      );
      return await this.resolve(target, importer, {
        skipSelf: true,
        ...options,
      });
    },
  };
}
