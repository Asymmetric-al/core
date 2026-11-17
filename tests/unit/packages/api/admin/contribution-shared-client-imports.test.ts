import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";
import { describe, expect, it } from "vitest";

import { loadSharedContributionRowInputs } from "../../../../../packages/api/src/admin/contribution-shared/row-inputs";
import { ApiHttpError as BrowserSafeApiHttpError } from "../../../../../packages/api/src/shared/api-http-error";
import { ApiHttpError } from "../../../../../packages/api/src/shared/http-errors";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const barrelPath = path.join(
  repoRoot,
  "packages/api/src/admin/contribution-shared/index.ts",
);
const serverOnlySpecifier = /^(?:next\/server|next\/headers|server-only|node:)/;

function workspacePackageDirs(): Map<string, string> {
  const dirs = new Map<string, string>();
  const packagesRoot = path.join(repoRoot, "packages");
  for (const entry of readdirSync(packagesRoot, { withFileTypes: true })) {
    const manifestPath = path.join(packagesRoot, entry.name, "package.json");
    if (!entry.isDirectory() || !existsSync(manifestPath)) continue;
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      name?: string;
    };
    if (manifest.name) dirs.set(manifest.name, path.dirname(manifestPath));
  }
  return dirs;
}

function resolveFile(base: string): string | undefined {
  return [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")].find(
    (candidate) => existsSync(candidate) && candidate.match(/\.tsx?$/),
  );
}

function resolveWorkspaceSpecifier(
  specifier: string,
  packageDirs: Map<string, string>,
): string {
  const [scope, name, ...rest] = specifier.split("/");
  const packageDir = packageDirs.get(`${scope}/${name}`);
  if (!packageDir) throw new Error(`Unknown workspace package: ${specifier}`);
  const manifest = JSON.parse(
    readFileSync(path.join(packageDir, "package.json"), "utf8"),
  ) as { exports?: Record<string, string | { default?: string }> };
  const target = manifest.exports?.[["."].concat(rest).join("/")];
  const relative = typeof target === "string" ? target : target?.default;
  const resolved = relative && resolveFile(path.join(packageDir, relative));
  if (!resolved) throw new Error(`Cannot resolve ${specifier}`);
  return resolved;
}

// Lists the specifiers a module loads at runtime; type-only imports and
// exports are erased by the compiler and never reach a bundle.
function runtimeSpecifiers(filePath: string): string[] {
  const source = ts.createSourceFile(
    filePath,
    readFileSync(filePath, "utf8"),
    ts.ScriptTarget.Latest,
  );
  const specifiers: string[] = [];
  for (const statement of source.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      !statement.importClause?.isTypeOnly
    ) {
      const bindings = statement.importClause?.namedBindings;
      const onlyTypes =
        !statement.importClause?.name &&
        bindings !== undefined &&
        ts.isNamedImports(bindings) &&
        bindings.elements.length > 0 &&
        bindings.elements.every((element) => element.isTypeOnly);
      if (!onlyTypes && ts.isStringLiteral(statement.moduleSpecifier)) {
        specifiers.push(statement.moduleSpecifier.text);
      }
    }
    if (
      ts.isExportDeclaration(statement) &&
      !statement.isTypeOnly &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      const clause = statement.exportClause;
      const onlyTypes =
        clause !== undefined &&
        ts.isNamedExports(clause) &&
        clause.elements.length > 0 &&
        clause.elements.every((element) => element.isTypeOnly);
      if (!onlyTypes) specifiers.push(statement.moduleSpecifier.text);
    }
  }
  return specifiers;
}

function collectRuntimeGraph(entry: string) {
  const packageDirs = workspacePackageDirs();
  const modules = new Set<string>();
  const externalSpecifiers = new Set<string>();
  const pending = [entry];
  while (pending.length > 0) {
    const filePath = pending.pop()!;
    if (modules.has(filePath)) continue;
    modules.add(filePath);
    for (const specifier of runtimeSpecifiers(filePath)) {
      if (specifier.startsWith(".")) {
        const resolved = resolveFile(
          path.resolve(path.dirname(filePath), specifier),
        );
        if (!resolved) throw new Error(`Cannot resolve ${specifier}`);
        pending.push(resolved);
      } else if (specifier.startsWith("@asym/")) {
        pending.push(resolveWorkspaceSpecifier(specifier, packageDirs));
      } else {
        externalSpecifiers.add(specifier);
      }
    }
  }
  return {
    modules: [...modules].map((modulePath) =>
      path.relative(repoRoot, modulePath).split(path.sep).join("/"),
    ),
    externalSpecifiers: [...externalSpecifiers],
  };
}

describe("@asym/api/admin/contribution-shared client import graph", () => {
  // Contributions and CRM client components import this barrel, so nothing it
  // loads at runtime may reach next/server (which reads Node's `process`).
  it("never reaches next/server or the server HTTP error helpers", () => {
    const graph = collectRuntimeGraph(barrelPath);

    expect(graph.modules).toContain(
      "packages/api/src/admin/contribution-shared/row-inputs.ts",
    );
    expect(graph.modules).toContain(
      "packages/api/src/shared/api-http-error.ts",
    );
    expect(graph.modules).not.toContain(
      "packages/api/src/shared/http-errors.ts",
    );
    expect(
      graph.externalSpecifiers.filter((specifier) =>
        serverOnlySpecifier.test(specifier),
      ),
    ).toEqual([]);
  });

  it("keeps one ApiHttpError class for server instanceof checks", async () => {
    expect(BrowserSafeApiHttpError).toBe(ApiHttpError);

    interface FailingQuery {
      select(): FailingQuery;
      eq(): FailingQuery;
      in(): FailingQuery;
      order(): FailingQuery;
      then(
        resolve: (value: { data: null; error: { message: string } }) => void,
      ): void;
    }
    const failingQuery: FailingQuery = {
      select: () => failingQuery,
      eq: () => failingQuery,
      in: () => failingQuery,
      order: () => failingQuery,
      then: (resolve) =>
        resolve({ data: null, error: { message: "corrections offline" } }),
    };
    const supabaseStub = {
      from: () => failingQuery,
    } as unknown as Parameters<typeof loadSharedContributionRowInputs>[0];

    const failure = await loadSharedContributionRowInputs(supabaseStub, {
      tenantId: "tenant-1",
      donations: [
        {
          id: "donation-1",
          amount: 2500,
          currency: "usd",
          fund_id: null,
          missionary_id: null,
          status: "completed",
        },
      ],
      stagedGifts: [],
    }).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(ApiHttpError);
    expect(failure).toMatchObject({
      status: 500,
      message: "corrections offline",
    });
  });
});
