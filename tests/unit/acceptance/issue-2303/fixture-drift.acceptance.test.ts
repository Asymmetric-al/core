/**
 * #2303 criteria 1, 2, 3 and 8 (spec r1, issue comment 6392009852; approved in
 * 6392018376): the Builder poison fixture uses the real AuthenticatedContext
 * and fails on both drifts, M1 (AuthenticatedContext gains `sources`) and M2
 * (the resolver parameter is loosened). Owned by Acceptance. Implementers must
 * not edit this file to satisfy their PR.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import ts from "typescript";
import { describe, expect, it, vi } from "vitest";

import * as H from "../issue-492/harness";

import type { AuthenticatedContext } from "../../../../packages/auth/context";

// Same seam as packages/auth/context.require.test.ts: context.ts loads the admin client.
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: vi.fn(() => ({ client: null, error: null })),
}));

const DIR = "tests/fixtures/capability-registry";
const FIXTURE = "authenticated-context.ts";
const TAGGED = `${FIXTURE}:7 TS2345`;
const CONTEXT = "packages/auth/context.ts";
const EFF = `${H.CAP_DIR}/effective-capabilities.ts`;
/** §2.1 prototyped fixture text, byte for byte (with the final newline). */
const SPEC_FIXTURE = [
  'import { resolveEffectiveCapabilities as resolve } from "../../../packages/auth/capabilities/effective-capabilities";',
  "",
  'import type { AuthenticatedContext } from "../../../packages/auth/context";',
  "",
  "declare const auth: AuthenticatedContext;",
  "",
  "export const fromAuth = resolve(auth); // error TS2345",
  "",
].join("\n");
/** The fixture tsconfig at develop 88eefbd9. §2.1 / §7: only `lib` changes. */
const DEVELOP_TSCONFIG = {
  compilerOptions: {
    target: "ES2022",
    module: "ESNext",
    moduleResolution: "Bundler",
    lib: ["ES2022"],
    types: [],
    strict: true,
    noUncheckedIndexedAccess: true,
    verbatimModuleSyntax: true,
    skipLibCheck: true,
    noEmit: true,
  },
  include: ["*.ts"],
};
type Rewrite = Record<string, (src: string) => string>;
/** M1 (§0): AuthenticatedContext gains `sources`. Same line, so no line moves. */
const M1: Rewrite = {
  [CONTEXT]: (s) =>
    s.replace(
      "export interface AuthenticatedContext extends AuthContext {",
      '$& sources: readonly import("./capabilities/effective-capabilities").GrantSource[];',
    ),
};
/** M2 (§0): the resolver parameter is loosened to an optional `sources`. */
const M2: Rewrite = {
  [EFF]: (s) =>
    s.replace(
      /(\n\s*context): SelectedGrantContext,/,
      "$1: { readonly tenantId: string; readonly sources?: readonly GrantSource[] },",
    ),
};

const TAG = /\/\/ error TS(\d+)$/;
/** `file:line TScode` for every `// error TSxxxx` tag (as fixtures.test.ts reads them). */
function tags() {
  return readdirSync(DIR)
    .filter((f) => f.endsWith(".ts"))
    .flatMap((f) =>
      readFileSync(join(DIR, f), "utf8")
        .split("\n")
        .flatMap((line, i) => {
          const m = TAG.exec(line);
          return m ? [`${f}:${i + 1} TS${m[1]}`] : [];
        }),
    )
    .sort();
}

/** Compiles DIR with its tsconfig through the TS API, with in-memory rewrites. */
function compile(rewrite: Rewrite = {}) {
  const config = ts.getParsedCommandLineOfConfigFile(
    join(DIR, "tsconfig.json"),
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic() {} },
  );
  if (!config) throw new Error("fixture tsconfig did not parse");
  const edits = new Map<string, string>();
  for (const [file, edit] of Object.entries(rewrite)) {
    const src = H.read(file);
    const out = edit(src);
    expect(out, `${file}: the drift rewrite must apply`).not.toBe(src);
    edits.set(resolve(file), out);
  }
  const host = ts.createCompilerHost(config.options);
  const { getSourceFile, readFile } = host;
  host.readFile = (f) => edits.get(resolve(f)) ?? readFile(f);
  host.getSourceFile = (f, lang, ...rest) => {
    const text = edits.get(resolve(f));
    if (text === undefined) return getSourceFile(f, lang, ...rest);
    return ts.createSourceFile(f, text, lang);
  };
  const program = ts.createProgram(config.fileNames, config.options, host);
  const diags = ts.getPreEmitDiagnostics(program).map((d) => {
    if (!d.file) return `global TS${d.code}`;
    const { line } = d.file.getLineAndCharacterOfPosition(d.start ?? 0);
    return `${relative(DIR, d.file.fileName)}:${line + 1} TS${d.code}`;
  });
  return { program, diags: diags.sort() };
}
let cached: ReturnType<typeof compile> | undefined;
const baseline = () => (cached ??= compile());

describe("#2303 criterion 1: the poison fixture is the §2.1 text", () => {
  it("criterion 1: authenticated-context.ts is exactly §2.1, and the fixture dir has 11 tags including authenticated-context.ts:7 TS2345", () => {
    const file = join(DIR, FIXTURE);
    expect(existsSync(file), `${file} must exist (spec §2.1)`).toBe(true);
    expect(H.read(file)).toBe(SPEC_FIXTURE);
    expect(tags()).toContain(TAGGED);
    expect(tags()).toHaveLength(11);
  });
});

describe("#2303 criterion 2: fixture tsconfig and workspace isolation", () => {
  it('criterion 2: the fixture tsconfig differs from develop only in lib, which is exactly ["ES2022", "DOM"]', () => {
    const { compilerOptions, ...rest } = DEVELOP_TSCONFIG;
    expect(JSON.parse(H.read(join(DIR, "tsconfig.json")))).toEqual({
      ...rest,
      compilerOptions: { ...compilerOptions, lib: ["ES2022", "DOM"] },
    });
  });

  it("criterion 2: no workspace tsconfig includes the fixture directory", () => {
    const listed = spawnSync("git", ["ls-files", "*tsconfig.json"], {
      encoding: "utf8",
    });
    expect(listed.status, listed.stderr).toBe(0);
    const configs = listed.stdout
      .split("\n")
      .filter((f) => /^(apps|packages|tests)\//.test(f))
      .filter((f) => !f.startsWith("tests/fixtures/"));
    expect(configs.length).toBeGreaterThan(10);
    const dir = resolve(DIR);
    for (const f of configs) {
      const parsed = ts.getParsedCommandLineOfConfigFile(
        f,
        {},
        { ...ts.sys, onUnRecoverableConfigFileDiagnostic() {} },
      );
      const hits = (parsed?.fileNames ?? []).filter((n) =>
        resolve(n).startsWith(`${dir}/`),
      );
      expect(hits, f).toEqual([]);
    }
  });
});

describe("#2303 criterion 8: the fixture fails on both drifts", () => {
  it("criterion 8: the fixture dir compiles through the TS API with diagnostics equal to its tags, including authenticated-context.ts:7 TS2345", () => {
    expect(tags()).toContain(TAGGED);
    expect(baseline().diags).toEqual(tags());
  });

  it.each([
    ["M1 (AuthenticatedContext gains sources)", M1],
    ["M2 (resolver parameter loosened to optional sources)", M2],
  ])(
    "criterion 8 (drift evidence for 3): %s removes authenticated-context.ts:7 TS2345 and changes nothing else",
    (_label, rewrite) => {
      const base = baseline().diags;
      expect(base, "baseline must carry the fixture diagnostic").toContain(
        TAGGED,
      );
      expect(compile(rewrite).diags).toEqual(base.filter((d) => d !== TAGGED));
    },
  );

  it("criterion 8: the fixture passes the real AuthenticatedContext from packages/auth/context to the resolver, not a RoleSnapshot", () => {
    const { program } = baseline();
    const sf = program.getSourceFile(resolve(DIR, FIXTURE));
    expect(sf, `${FIXTURE} must be in the fixture program`).toBeDefined();
    if (!sf) return;
    expect(sf.text).not.toMatch(/RoleSnapshot|permissions/);
    const imported = sf.statements
      .filter(ts.isImportDeclaration)
      .filter((d) => d.importClause?.isTypeOnly)
      .filter(
        (d) =>
          (d.moduleSpecifier as ts.StringLiteral).text ===
          "../../../packages/auth/context",
      )
      .flatMap((d) => {
        const b = d.importClause?.namedBindings;
        return b && ts.isNamedImports(b)
          ? b.elements.map((e) => e.name.text)
          : [];
      });
    expect(imported).toEqual(["AuthenticatedContext"]);

    const checker = program.getTypeChecker();
    const calls: ts.CallExpression[] = [];
    const visit = (n: ts.Node): void => {
      if (ts.isCallExpression(n)) calls.push(n);
      ts.forEachChild(n, visit);
    };
    visit(sf);
    expect(calls).toHaveLength(1);
    const [call] = calls as [ts.CallExpression];
    const callee = checker.getSymbolAtLocation(call.expression);
    expect(callee && checker.getAliasedSymbol(callee).name).toBe(
      "resolveEffectiveCapabilities",
    );
    expect(call.arguments).toHaveLength(1);
    const argType = checker.getTypeAtLocation(call.arguments[0]!);
    const decl = argType.getSymbol()?.declarations?.[0];
    expect(argType.getSymbol()?.name).toBe("AuthenticatedContext");
    expect(decl && relative(".", decl.getSourceFile().fileName)).toBe(CONTEXT);
  });

  it("criterion 8: a runtime AuthenticatedContext accepted by requireAuth is rejected by the resolver with missing_context", async () => {
    const context = await import("../../../../packages/auth/context");
    const auth: AuthenticatedContext = {
      userId: "usr-2303",
      email: null,
      tenantId: H.T,
      role: "staff",
      profileRole: "staff",
      memberships: [],
      profileId: "prf-2303",
      isAuthenticated: true,
    };
    expect(() => context.requireAuth(auth)).not.toThrow();
    expect((await H.thrown(auth)).code).toBe("missing_context");
  });
});
