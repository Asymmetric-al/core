import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  CEILING,
  ceilingDigest,
  evaluateServiceRoleClientGate,
  runServiceRoleClientGate,
  scanSource,
} from "../../../scripts/verify/service-role-client-gate.mjs";

const FACTORY = "@asym/database/supabase/admin";
const OP = 'import { withOperation } from "../shared/with-operation";\n';
const FILE = "packages/api/src/posts/index.ts";
const lines = (text: string, file = "packages/api/src/admin/x.ts") =>
  scanSource(file, text).sites.map((s: { kind: string; line: number }) =>
    [s.kind, s.line].join(":"),
  );

describe("frozen ceiling", () => {
  it("is the pinned 117-entry ceiling: 81 / 29 / 8 / 70 sites in 111 files", () => {
    expect(ceilingDigest()).toBe(
      "5ee7fecf03548a4ddc4b7f81407e7b24a344a935c92cf70f313e9e64a0339ad1",
    );
    const totals: Record<string, number> = {};
    for (const [key, count] of CEILING) {
      const kind = key.split(" ")[1]!;
      totals[kind] = (totals[kind] ?? 0) + count;
    }
    expect(totals).toEqual({
      admin_client: 81,
      service_role_key: 29,
      workflow_admin_wrapper: 8,
      operation_admin_context: 70,
    });
    expect(CEILING.size).toBe(117);
    expect(
      new Set([...CEILING.keys()].map((key) => key.split(" ")[0])).size,
    ).toBe(111);
  });
});

describe("scanSource binding forms beyond the acceptance fixtures", () => {
  it.each<[string, string, string[]]>([
    [
      "a property call on an awaited dynamic import",
      `export const x = async () => (await import("${FACTORY}")).getAdminClient();`,
      ["admin_client:1"],
    ],
    [
      "a dynamic import bound to a name, then a member call",
      `const m = await import("${FACTORY}");\nm.createAdminClient();`,
      ["admin_client:2"],
    ],
    [
      "a dynamic import handed to then()",
      `import("${FACTORY}").then((m) => m);`,
      ["admin_client:1"],
    ],
    [
      "a shorthand property escape",
      `import { getAdminClient } from "${FACTORY}";\nexport const deps = { getAdminClient };`,
      ["admin_client:2"],
    ],
    [
      "a context destructured in the body",
      `${OP}withOperation(async (ctx) => { const { supabaseAdmin } = ctx; return supabaseAdmin; });`,
      ["operation_admin_context:2"],
    ],
    [
      "a context destructured in the body without the client",
      `${OP}withOperation(async (ctx) => { const { auth } = ctx; return ctx.request ?? auth; });`,
      [],
    ],
    [
      "a computed context key",
      `${OP}withOperation(async (ctx) => ctx[key]);`,
      ["operation_admin_context:2"],
    ],
    [
      "a handler without parameters, and withOperation called with none",
      `${OP}withOperation(async () => ok());\nwithOperation();`,
      ["operation_admin_context:3"],
    ],
  ])("%s", (_name, text, expected) => {
    expect(lines(text)).toEqual(expected);
  });

  it.each([
    `export * from "${FACTORY}";`,
    `export * as admin from "${FACTORY}";`,
    `import { getAdminClient } from "${FACTORY}";\nexport { getAdminClient as g };`,
    `import { getAdminClient } from "${FACTORY}";\nexport default getAdminClient;`,
  ])("re-export: %s", (text) => {
    const { reexports } = scanSource("packages/api/src/x.ts", text);
    expect(reexports).toHaveLength(1);
    expect(reexports[0]).toMatchObject({ kind: "admin_client" });
  });

  it("resolves relative paths to the tracked modules only", () => {
    const wrapper =
      'import { requireWorkflowAdminClient } from "../admin-client";\nrequireWorkflowAdminClient("x");';
    expect(lines(wrapper, "packages/api/src/workflows/functions/a.ts")).toEqual(
      ["workflow_admin_wrapper:2"],
    );
    expect(lines(wrapper, "packages/api/src/other/a.ts")).toEqual([]);
  });
});

const entry = (over: Record<string, unknown> = {}) => ({
  ...{ file: FILE, kind: "admin_client", count: 2, reason: "fx", ...over },
});
const sites = (n: number, file = FILE, kind = "admin_client") =>
  Array.from({ length: n }, (_, i) => ({ file, kind, line: 10 + i }));
const evaluate = (
  found: { file: string; kind: string; line: number }[],
  allowlist: unknown,
  reexports: { file: string; kind: string; line: number }[] = [],
) =>
  evaluateServiceRoleClientGate(
    { sites: found, reexports },
    Array.isArray(allowlist) ? { version: 1, entries: allowlist } : allowlist,
  );

describe("evaluateServiceRoleClientGate", () => {
  it("passes when the real count equals the entry and the entry is within the ceiling", () => {
    const result = evaluate(sites(2), [entry()]);
    expect(result.failures).toEqual([]);
    expect(result).toMatchObject({ ok: true, files: 1 });
    expect(result.totals.admin_client).toBe(2);
  });

  it("passes a shrink of the site and the entry together", () => {
    expect(evaluate(sites(1), [entry({ count: 1 })]).ok).toBe(true);
  });

  it.each<[string, unknown, RegExp]>([
    ["an unreadable list", new Error("bad JSON"), /^ALLOWLIST_MALFORMED .*bad/],
    ["no entries array", {}, /^ALLOWLIST_MALFORMED .*entries array/],
    ["an unknown kind", [entry({ kind: "x" })], /MALFORMED x .*kind must/],
    ["a zero count", [entry({ count: 0 })], /MALFORMED .*positive integer/],
    ["a duplicate key", [entry(), entry()], /MALFORMED .*duplicate/],
  ])("fails on %s", (_name, allowlist, message) => {
    const result = evaluate(sites(2), allowlist);
    expect(result.ok).toBe(false);
    expect(result.failures.join("\n")).toMatch(message);
  });

  it("reports a stale entry with the shrink target, and none-left when the file is clean", () => {
    expect(evaluate(sites(1), [entry()]).failures).toEqual([
      `STALE admin_client ${FILE}: allowlist 2, 1 found; shrink the entry to 1 (sites: ${FILE}:10)`,
    ]);
    expect(evaluate([], [entry()]).failures[0]).toMatch(
      /^STALE .*delete the entry \(sites: none left\)$/,
    );
  });

  it("fails a re-export even when its file and kind are listed", () => {
    const result = evaluate(
      sites(2),
      [entry()],
      [{ file: FILE, kind: "admin_client", line: 1 }],
    );
    expect(result.failures).toEqual([
      expect.stringMatching(
        /^REEXPORT admin_client .*posts\/index\.ts:1: .*never allowlisted/,
      ),
    ]);
  });
});

describe("test-path exclusions are anchored (review F2)", () => {
  it("flags nested tests/ dirs and dotted dir names; skips only test file names", () => {
    const root = mkdtempSync(path.join(tmpdir(), "srcg-f2-"));
    const site = `import { getAdminClient } from "${FACTORY}";\ngetAdminClient();\n`;
    const flaggedFiles = [
      "apps/admin/app/api/tests/route.ts",
      "apps/admin/app/example.test.com/route.ts",
    ];
    const skipped = [
      "tests/unit/root-fixture.ts",
      "apps/x/foo.test.ts",
      "apps/x/foo.spec.tsx",
      "apps/x/types.d.ts",
    ];
    for (const f of [...flaggedFiles, ...skipped]) {
      mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
      writeFileSync(path.join(root, f), site);
    }
    mkdirSync(path.join(root, "docs/security"), { recursive: true });
    writeFileSync(
      path.join(root, "docs/security/service-role-client-allowlist.json"),
      '{"version":1,"entries":[]}',
    );
    spawnSync("git", ["init", "-q"], { cwd: root });
    try {
      const { ok, failures } = runServiceRoleClientGate({ root });
      expect(ok).toBe(false);
      expect(failures).toEqual(
        flaggedFiles.map((f) =>
          expect.stringMatching(
            new RegExp(`^NEW_SITE admin_client ${f}: .*\\(sites: ${f}:2\\)$`),
          ),
        ),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
