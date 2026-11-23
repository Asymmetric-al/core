import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  CALLER_PRIVILEGED_IMPORT_EXCEPTIONS,
  CEILING,
  ceilingDigest,
  evaluateServiceRoleClientGate,
  runServiceRoleClientGate,
  scanSource,
} from "../../../scripts/verify/service-role-client-gate.mjs";

const FACTORY = "@asym/database/supabase/admin";
const OP = 'import { withOperation } from "../shared/with-operation";\n';
const PLATFORM =
  'import { withPlatformOperation } from "../shared/with-operation";\n';
const FILE = "packages/api/src/posts/index.ts";
const lines = (text: string, file = "packages/api/src/admin/x.ts") =>
  scanSource(file, text).sites.map((s: { kind: string; line: number }) =>
    [s.kind, s.line].join(":"),
  );

describe("frozen ceiling", () => {
  it.each(["donor", "missionary"])(
    "counts the %s portal operation adapter",
    (portal) => {
      const helper =
        portal === "donor"
          ? "runDonorPortalOperation"
          : "runMissionaryPortalOperation";
      expect(
        lines(
          `import { ${helper} as run } from "../${portal}-portal/route-helpers";\nrun();`,
        ),
      ).toEqual(["operation_admin_context:2"]);
    },
  );

  it("rejects a direct privileged helper import in a caller operation", () => {
    const root = mkdtempSync(path.join(tmpdir(), "caller-lane-"));
    const files = {
      "packages/api/src/admin/member-care/mutations.ts": `import {getAdminClient} from "${FACTORY}"; export const helper = () => getAdminClient();`,
      "packages/api/src/admin/example.ts":
        'import {withOperation as caller} from "../shared/with-operation";\nimport {helper} from "./member-care/mutations"; export const GET = caller(helper);',
      "docs/security/service-role-client-allowlist.json": JSON.stringify({
        version: 1,
        entries: [
          {
            file: "packages/api/src/admin/member-care/mutations.ts",
            kind: "admin_client",
            count: 1,
            lines: [1],
            reason: "fixture",
            path_ref: "fixture",
            follow_up: "fixture",
          },
        ],
      }),
    };
    try {
      for (const [file, content] of Object.entries(files)) {
        mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
        writeFileSync(path.join(root, file), content);
      }
      spawnSync("git", ["init", "-q"], { cwd: root });
      expect(runServiceRoleClientGate({ root }).failures).toContainEqual(
        expect.stringMatching(/^CALLER_PRIVILEGED_IMPORT .*example.ts:2/),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("allows a withOperation file to import packages/api/src/storage/media-store (W6-R3 amended)", () => {
    const root = mkdtempSync(path.join(tmpdir(), "caller-media-ok-"));
    const files = {
      "packages/api/src/storage/media-store.ts": `import {getAdminClient} from "${FACTORY}"; export const issueSignedUpload = () => getAdminClient();`,
      "packages/api/src/cms/media/start.ts":
        'import {withOperation} from "../../shared/with-operation";\nimport {issueSignedUpload} from "../../storage/media-store";\nexport const POST = withOperation(async () => issueSignedUpload());',
      "packages/api/src/cms/media/finalize.ts":
        'import {withOperation} from "../../shared/with-operation";\nimport {issueSignedUpload} from "@asym/api/storage/media-store";\nexport const POST = withOperation(async () => issueSignedUpload());',
      "docs/security/service-role-client-allowlist.json": JSON.stringify({
        version: 1,
        entries: [
          {
            file: "packages/api/src/storage/media-store.ts",
            kind: "admin_client",
            count: 1,
            lines: [1],
            reason: "W6-R3 amended fixture",
            path_ref: "P media storage",
            follow_up: "#2679",
          },
        ],
      }),
    };
    try {
      for (const [file, content] of Object.entries(files)) {
        mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
        writeFileSync(path.join(root, file), content);
      }
      spawnSync("git", ["init", "-q"], { cwd: root });
      const result = runServiceRoleClientGate({ root });
      expect(result.failures).toEqual([]);
      expect(result.ok).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("still rejects a withOperation file importing any other admin-client module beside media-store", () => {
    const root = mkdtempSync(path.join(tmpdir(), "caller-media-deny-"));
    const files = {
      "packages/api/src/storage/other-store.ts": `import {getAdminClient} from "${FACTORY}"; export const readOther = () => getAdminClient();`,
      "packages/api/src/cms/media/bad.ts":
        'import {withOperation} from "../../shared/with-operation";\nimport {readOther} from "../../storage/other-store";\nexport const POST = withOperation(async () => readOther());',
      "docs/security/service-role-client-allowlist.json": JSON.stringify({
        version: 1,
        entries: [],
      }),
    };
    try {
      for (const [file, content] of Object.entries(files)) {
        mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
        writeFileSync(path.join(root, file), content);
      }
      spawnSync("git", ["init", "-q"], { cwd: root });
      expect(runServiceRoleClientGate({ root }).failures).toContainEqual(
        expect.stringMatching(
          /^CALLER_PRIVILEGED_IMPORT packages\/api\/src\/cms\/media\/bad\.ts:2/,
        ),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("pins CALLER_PRIVILEGED_IMPORT_EXCEPTIONS to the single reviewed media-store path", () => {
    expect(CALLER_PRIVILEGED_IMPORT_EXCEPTIONS).toEqual([
      "packages/api/src/storage/media-store",
    ]);
    expect(Object.isFrozen(CALLER_PRIVILEGED_IMPORT_EXCEPTIONS)).toBe(true);
  });
  // D-18: the ceiling falls with the allowlist. Raised by the 21 November 2026 ruling (F3, F4:
  // eight uncounted platform-wrapper sites for WP4b) and the 23 November 2026 ruling W6-R3 amended
  // (one admin_client site for packages/api/src/storage/media-store.ts). Any other growth needs a new ruling.
  it("pins the 122 entries, including the media-store platform-lane site under W6-R3 amended", () => {
    expect(ceilingDigest()).toBe(
      "3328c4a09c7a15c900804e148cf8e1c4aaf620bc8f9971d2c2ead30b24481069",
    );
    const totals: Record<string, number> = {};
    for (const [key, count] of CEILING) {
      const kind = key.split(" ")[1]!;
      totals[kind] = (totals[kind] ?? 0) + count;
    }
    expect(totals).toEqual({
      admin_client: 79,
      service_role_key: 27,
      workflow_admin_wrapper: 8,
      operation_admin_context: 73,
    });
    expect(CEILING.size).toBe(122);
    expect(
      new Set([...CEILING.keys()].map((key) => key.split(" ")[0])).size,
    ).toBe(116);
  });
});

describe("scanSource binding forms beyond the acceptance fixtures", () => {
  it("counts the platform wrapper, not the caller wrapper, even for an opaque handler", () => {
    const code = [
      'import { withOperation, withPlatformOperation } from "../shared/with-operation";',
      "withOperation(callback);",
      "withPlatformOperation(callback);",
    ].join("\n");
    expect(lines(code)).toEqual(["operation_admin_context:3"]);
  });

  it("rejects an unlisted direct factory reference in a caller-lane handler", () => {
    const file = "packages/api/src/admin/plant.ts";
    const code = `${OP}import { getAdminClient } from "${FACTORY}";\nwithOperation(() => getAdminClient());`;
    const { sites } = scanSource(file, code);
    const result = evaluateServiceRoleClientGate(
      { sites: sites.map((site) => ({ ...site, file })), reexports: [] },
      { entries: [] },
    );
    expect(result.failures).toContainEqual(
      expect.stringContaining(`NEW_SITE admin_client ${file}`),
    );
  });
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
      `${PLATFORM}withPlatformOperation(async (ctx) => { const { supabaseAdmin } = ctx; return supabaseAdmin; });`,
      ["operation_admin_context:2"],
    ],
    [
      "a context destructured in the body without the client",
      `${PLATFORM}withPlatformOperation(async (ctx) => { const { auth } = ctx; return ctx.request ?? auth; });`,
      ["operation_admin_context:2"],
    ],
    [
      "a computed context key",
      `${PLATFORM}withPlatformOperation(async (ctx) => ctx[key]);`,
      ["operation_admin_context:2"],
    ],
    [
      "a handler without parameters, and withOperation called with none",
      `${PLATFORM}withPlatformOperation(async () => ok());\nwithPlatformOperation();`,
      ["operation_admin_context:2", "operation_admin_context:3"],
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

  it("rejects restoring the retired follower-request sites even with their old allowlist entry", () => {
    const file = "packages/api/src/follower-requests/request.ts";
    const result = evaluate(sites(2, file), [entry({ file, count: 2 })]);
    expect(result.ok).toBe(false);
    expect(result.failures).toEqual([
      expect.stringContaining(`ALLOWLIST_GROWTH admin_client ${file}:`),
    ]);
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

describe("type-only re-exports are not sites (review F3)", () => {
  it.each<[string, number]>([
    [`export type { getAdminClient } from "${FACTORY}";`, 0],
    [`export { type getAdminClient } from "${FACTORY}";`, 0],
    [`export { type getAdminClient, createAdminClient } from "${FACTORY}";`, 1],
    [
      `import { getAdminClient } from "${FACTORY}";\nexport type { getAdminClient };`,
      0,
    ],
    [
      `import { getAdminClient } from "${FACTORY}";\nexport { type getAdminClient };`,
      0,
    ],
  ])("%s -> %i re-export(s)", (text, count) => {
    expect(scanSource("packages/api/src/x.ts", text).reexports).toHaveLength(
      count,
    );
  });
});
