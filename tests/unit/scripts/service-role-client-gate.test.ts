import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import {
  CALLER_MEDIA_STORE_ALLOWED_EXPORTS,
  CALLER_PRIVILEGED_IMPORT_EXCEPTIONS,
  CEILING,
  CEILING_ROWS,
  ceilingGrowth,
  evaluateServiceRoleClientGate,
  parseCeilingRows,
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

  it("pins CALLER_PRIVILEGED_IMPORT_EXCEPTIONS and CALLER_MEDIA_STORE_ALLOWED_EXPORTS", () => {
    expect(CALLER_PRIVILEGED_IMPORT_EXCEPTIONS).toEqual([
      "packages/api/src/storage/media-store",
    ]);
    expect(Object.isFrozen(CALLER_PRIVILEGED_IMPORT_EXCEPTIONS)).toBe(true);
    expect(CALLER_MEDIA_STORE_ALLOWED_EXPORTS).toEqual([
      "issueSignedUpload",
      "finalizeMediaUpload",
      "readMediaVariant",
    ]);
    expect(Object.isFrozen(CALLER_MEDIA_STORE_ALLOWED_EXPORTS)).toBe(true);
  });

  it("rejects withOperation imports of unlisted exports, namespace imports, or dynamic imports from media-store", () => {
    const cases: Array<[string, string]> = [
      [
        "unlisted named import",
        'import {withOperation} from "../../shared/with-operation";\nimport {unlistedHelper} from "../../storage/media-store";\nexport const POST = withOperation(async () => unlistedHelper());',
      ],
      [
        "aliased unlisted import",
        'import {withOperation} from "../../shared/with-operation";\nimport {unlistedHelper as helper} from "../../storage/media-store";\nexport const POST = withOperation(async () => helper());',
      ],
      [
        "namespace import",
        'import {withOperation} from "../../shared/with-operation";\nimport * as store from "../../storage/media-store";\nexport const POST = withOperation(async () => store.issueSignedUpload());',
      ],
      [
        "dynamic import",
        'import {withOperation} from "../../shared/with-operation";\nexport const POST = withOperation(async () => (await import("../../storage/media-store")).unlistedHelper());',
      ],
    ];
    for (const [label, badSource] of cases) {
      const root = mkdtempSync(path.join(tmpdir(), "caller-media-export-"));
      const files = {
        "packages/api/src/storage/media-store.ts": `import {getAdminClient} from "${FACTORY}"; const admin = () => getAdminClient(); export const issueSignedUpload = () => admin(); export const unlistedHelper = () => admin();`,
        "packages/api/src/cms/media/bad.ts": badSource,
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
        expect(result.failures, label).toContainEqual(
          expect.stringMatching(
            /^CALLER_PRIVILEGED_IMPORT packages\/api\/src\/cms\/media\/bad\.ts:/,
          ),
        );
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }
  });

  it("rejects re-exporting media-store or forwarding media-store transitively into a withOperation file", () => {
    const reexportCases: Array<[string, string]> = [
      [
        "named re-export",
        'export { finalizeMediaUpload } from "../storage/media-store";',
      ],
      ["star re-export", 'export * from "../storage/media-store";'],
      [
        "local re-export",
        'import { unlistedHelper } from "../storage/media-store";\nexport { unlistedHelper };',
      ],
    ];
    for (const [label, wrapperSource] of reexportCases) {
      const root = mkdtempSync(path.join(tmpdir(), "media-reexport-"));
      const files = {
        "packages/api/src/storage/media-store.ts": `import {getAdminClient} from "${FACTORY}"; const admin = () => getAdminClient(); export const finalizeMediaUpload = () => admin(); export const unlistedHelper = () => admin();`,
        "packages/api/src/cms/barrel.ts": wrapperSource,
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
        expect(result.failures, label).toContainEqual(
          expect.stringMatching(
            /^REEXPORT media_store packages\/api\/src\/cms\/barrel\.ts:/,
          ),
        );
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }

    const root = mkdtempSync(path.join(tmpdir(), "media-forward-"));
    const files = {
      "packages/api/src/storage/media-store.ts": `import {getAdminClient} from "${FACTORY}"; export const unlistedHelper = () => getAdminClient();`,
      "packages/api/src/cms/hop1.ts":
        'import { unlistedHelper } from "../storage/media-store";\nexport const runHop1 = () => unlistedHelper();',
      "packages/api/src/cms/hop2.ts":
        'import { runHop1 } from "./hop1";\nexport const runHop2 = () => runHop1();',
      "packages/api/src/cms/media/bad.ts":
        'import {withOperation} from "../../shared/with-operation";\nimport {runHop2} from "../hop2";\nexport const POST = withOperation(async () => runHop2());',
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
      expect(result.failures).toContainEqual(
        expect.stringMatching(
          /^CALLER_PRIVILEGED_IMPORT packages\/api\/src\/cms\/media\/bad\.ts:2/,
        ),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects unresolvable dynamic import or require in a caller-lane module (W6-R16)", () => {
    const cases: Array<[string, string]> = [
      [
        "identifier dynamic import",
        'import {withOperation} from "../../shared/with-operation";\nexport const POST = withOperation(async () => { const p = "../../storage/media-store"; return import(p); });',
      ],
      [
        "template expression dynamic import",
        'import {withOperation} from "../../shared/with-operation";\nexport const POST = withOperation(async () => { const mod = "media-store"; return import(`../../storage/${mod}`); });',
      ],
      [
        "concatenated dynamic import",
        'import {withOperation} from "../../shared/with-operation";\nexport const POST = withOperation(async () => import("../../storage/" + "media-store"));',
      ],
      [
        "dynamic require",
        'import {withOperation} from "../../shared/with-operation";\nexport const POST = withOperation(async () => { const p = "../../storage/media-store"; return require(p); });',
      ],
    ];
    for (const [label, badSource] of cases) {
      const root = mkdtempSync(path.join(tmpdir(), "caller-dyn-import-"));
      const files = {
        "packages/api/src/cms/media/bad.ts": badSource,
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
        const result = runServiceRoleClientGate({ root });
        expect(result.failures, label).toContainEqual(
          expect.stringMatching(
            /^CALLER_PRIVILEGED_IMPORT packages\/api\/src\/cms\/media\/bad\.ts:2/,
          ),
        );
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }
  });

  it("the ceiling parses strictly: rows sorted, keys unique, fields and tokens well formed (D-18: AL-2671 ruling-pin-tax Q1)", () => {
    expect(parseCeilingRows(CEILING_ROWS).problems).toEqual([]);
    expect(CEILING.size).toBe(parseCeilingRows(CEILING_ROWS).rows.length);
  });

  it("holds no CRM handler in the allowlist or the ceiling once note creation moves", () => {
    const crm = "packages/api/src/admin/crm/";
    const { entries } = JSON.parse(
      readFileSync("docs/security/service-role-client-allowlist.json", "utf8"),
    ) as { entries: { file: string }[] };
    expect(entries.filter((entry) => entry.file.startsWith(crm))).toEqual([]);
    expect([...CEILING.keys()].filter((key) => key.startsWith(crm))).toEqual(
      [],
    );
  });

  it("holds no Member Care handler or read module in the allowlist or the ceiling once WP4b part 1 moves", () => {
    const isCare = (file: string) =>
      file.startsWith("packages/api/src/admin/member-care/") ||
      file === "packages/api/src/reads/member-care.ts";
    const { entries } = JSON.parse(
      readFileSync("docs/security/service-role-client-allowlist.json", "utf8"),
    ) as { entries: { file: string }[] };
    expect(entries.filter((entry) => isCare(entry.file))).toEqual([]);
    expect(
      [...CEILING.keys()].filter((key) => isCare(key.split(" ")[0]!)),
    ).toEqual([]);
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

const ceilingRows = (text: string) => {
  const parsed = parseCeilingRows(text);
  expect(parsed.problems).toEqual([]);
  return parsed.rows;
};
const growth = (base: string, head: string) =>
  ceilingGrowth(ceilingRows(base), ceilingRows(head));
const A = "apps/a.ts admin_client";
const B = "packages/b.ts service_role_key";

describe("ceiling growth against the base (D-18: AL-2671 ruling-pin-tax Q1)", () => {
  it("fixture 1: an added row without a ruling token fails, naming file and kind", () => {
    expect(growth(`${A} 1`, `${A} 1\n${B} 2`)).toEqual([
      "CEILING_GROWTH packages/b.ts service_role_key: added at 2 without a ruling token",
    ]);
  });

  it("fixture 2: a raised count needs a ruling token other than the base row's", () => {
    expect(growth(`${A} 1`, `${A} 3`)).toEqual([
      "CEILING_GROWTH apps/a.ts admin_client: raised from 1 to 3 without a new ruling token",
    ]);
    expect(growth(`${A} 1 ruling:W8-R10`, `${A} 2 ruling:W8-R10`)).toEqual([
      "CEILING_GROWTH apps/a.ts admin_client: raised from 1 to 2 without a new ruling token",
    ]);
    expect(growth(`${A} 1 ruling:W8-R10`, `${A} 2`)).toEqual([
      "CEILING_GROWTH apps/a.ts admin_client: raised from 1 to 2 without a new ruling token",
    ]);
    expect(growth(`${A} 1 ruling:W8-R10`, `${A} 2 ruling:W8-R11`)).toEqual([]);
  });

  it("fixture 3: an added or raised row with a well-formed token passes; malformed tokens fail", () => {
    expect(growth(`${A} 1`, `${A} 1\n${B} 2 ruling:W8-R10`)).toEqual([]);
    expect(growth(`${A} 1`, `${A} 4 ruling:W8-R10`)).toEqual([]);
    expect(growth(`${A} 1`, `${A} 4 ruling:D-16-Q1`)).toEqual([]);
    for (const token of [
      "ruling:W8R10",
      "ruling:",
      "ruling:D-16-Q",
      "W8-R10",
    ]) {
      const { problems } = parseCeilingRows(`${A} 1 ${token}`);
      expect(problems, token).toHaveLength(1);
      expect(problems[0], token).toMatch(
        new RegExp(`^CEILING_MALFORMED ${A} 1 ${token}: `),
      );
    }
  });

  it("fixture 3: rows with the wrong shape fail CEILING_MALFORMED", () => {
    for (const row of [
      `${A}`,
      `${A}  1`,
      `${A} 0`,
      `${A} 01`,
      `${A} 1.5`,
      "apps/a.ts admin 1",
      `${A} 1 ruling:W8-R10 extra`,
      ` ${A} 1`,
      `\t${A} 1`,
      "apps/a\tb.ts admin_client 1",
    ]) {
      const { problems } = parseCeilingRows(row);
      expect(problems, row).toHaveLength(1);
      expect(problems[0], row).toMatch(/^CEILING_MALFORMED /);
    }
    expect(parseCeilingRows(`\r\n${A} 1\r\n${B} 2\r\n`)).toEqual({
      rows: [
        { file: "apps/a.ts", kind: "admin_client", count: 1, ruling: null },
        {
          file: "packages/b.ts",
          kind: "service_role_key",
          count: 2,
          ruling: null,
        },
      ],
      problems: [],
    });
  });

  it("fixture 4: a duplicate key fails CEILING_DUPLICATE", () => {
    expect(parseCeilingRows(`${A} 1\n${A} 2`).problems).toEqual([
      "CEILING_DUPLICATE apps/a.ts admin_client",
    ]);
  });

  it("fixture 5: two keys out of order fail CEILING_UNSORTED", () => {
    expect(parseCeilingRows(`${B} 1\n${A} 2`).problems).toEqual([
      `CEILING_UNSORTED apps/a.ts admin_client: after ${B}`,
    ]);
    expect(
      parseCeilingRows("apps/a.ts service_role_key 1\napps/a.ts admin_client 1")
        .problems,
    ).toEqual([
      "CEILING_UNSORTED apps/a.ts admin_client: after apps/a.ts service_role_key",
    ]);
  });

  it("fixture 6: a shrink, a deleted row and an unchanged list pass", () => {
    expect(growth(`${A} 3\n${B} 2`, `${A} 1\n${B} 2`)).toEqual([]);
    expect(growth(`${A} 3\n${B} 2`, `${B} 2`)).toEqual([]);
    expect(growth(`${A} 3 ruling:W8-R10\n${B} 2`, `${A} 3\n${B} 2`)).toEqual(
      [],
    );
    expect(growth(CEILING_ROWS, CEILING_ROWS)).toEqual([]);
  });
});

const GATE_FILE = "scripts/verify/service-role-client-gate.mjs";
const IDENTITY = [
  "-c",
  "user.name=Ceiling Gate",
  "-c",
  "user.email=ceiling-gate@example.org",
  "-c",
  "commit.gpgsign=false",
  "-c",
  "core.autocrlf=false",
];
const ceilingRepos: string[] = [];
const cleanEnv = () =>
  Object.fromEntries(
    Object.entries(process.env).filter(
      ([name]) =>
        !name.startsWith("GIT_") && !name.startsWith("SERVICE_ROLE_CEILING_"),
    ),
  ) as Record<string, string>;
const repoGit = (root: string, ...args: string[]) => {
  const r = spawnSync("git", [...IDENTITY, ...args], {
    cwd: root,
    encoding: "utf8",
    env: cleanEnv(),
  });
  expect(r.status, `git ${args.join(" ")}: ${r.stderr}`).toBe(0);
  return r.stdout.trim();
};
const gateRepo = () => {
  const root = mkdtempSync(path.join(tmpdir(), "ceiling-gate-"));
  ceilingRepos.push(root);
  mkdirSync(path.join(root, "scripts/verify"), { recursive: true });
  mkdirSync(path.join(root, "docs/security"), { recursive: true });
  writeFileSync(path.join(root, GATE_FILE), readFileSync(GATE_FILE, "utf8"));
  writeFileSync(
    path.join(root, "docs/security/service-role-client-allowlist.json"),
    JSON.stringify({ version: 1, entries: [] }),
  );
  symlinkSync(path.resolve("node_modules"), path.join(root, "node_modules"));
  writeFileSync(path.join(root, ".gitignore"), "node_modules\n");
  repoGit(root, "init", "--quiet", "--initial-branch=feature");
  repoGit(root, "add", "--all");
  repoGit(root, "commit", "--quiet", "--message=base");
  return root;
};
const addCeilingRow = (root: string, row: string) => {
  const file = path.join(root, GATE_FILE);
  writeFileSync(
    file,
    readFileSync(file, "utf8").replace(
      /(const CEILING_ROWS = `[\s\S]*?)`/,
      (_, rows: string) => `${rows}${row}\n\``,
    ),
  );
  repoGit(root, "commit", "--quiet", "--all", `--message=add ${row}`);
};
const runGate = (
  root: string,
  args: string[] = [],
  env: Record<string, string> = {},
) => {
  const r = spawnSync(process.execPath, [GATE_FILE, ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...cleanEnv(), ...env },
  });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
};

describe("ceiling gate CLI base resolution (D-18: AL-2671 ruling-pin-tax Q1)", () => {
  afterAll(() => {
    for (const root of ceilingRepos.splice(0))
      rmSync(root, { recursive: true, force: true });
  });

  it("fixture 7a: --require-base with no base exits 1 with CEILING_BASE_UNRESOLVED", () => {
    const r = runGate(gateRepo(), ["--require-base"]);
    expect(r.status, r.out).toBe(1);
    expect(r.out).toMatch(/^CEILING_BASE_UNRESOLVED origin\/develop: /m);
  });

  it("fixture 7b: no flag and no variables prints the not-checked line and exits 0", () => {
    const r = runGate(gateRepo());
    expect(r.status, r.out).toBe(0);
    expect(r.out).toContain(
      "service-role client gate: no base, so ceiling growth was not checked",
    );
  });

  it("fixture 7c: an unresolvable SERVICE_ROLE_CEILING_BASE fails with or without --require-base", () => {
    const root = gateRepo();
    for (const args of [[], ["--require-base"]]) {
      const r = runGate(root, args, {
        SERVICE_ROLE_CEILING_BASE: "origin/none",
      });
      expect(r.status, r.out).toBe(1);
      expect(r.out).toMatch(/^CEILING_BASE_UNRESOLVED origin\/none: /m);
    }
    const r = runGate(root, ["--base", "origin/none"]);
    expect(r.status, r.out).toBe(1);
    expect(r.out).toMatch(/^CEILING_BASE_UNRESOLVED origin\/none: /m);
  });

  it("fixture 7d: a missing, invalid or new-branch push revision with no earlier base exits 1", () => {
    const root = gateRepo();
    for (const value of ["1".repeat(40), "not-a-revision"]) {
      const r = runGate(root, [], { SERVICE_ROLE_CEILING_PUSHED_FROM: value });
      expect(r.status, `${value}: ${r.out}`).toBe(1);
      expect(r.out).toMatch(
        new RegExp(`^CEILING_BASE_UNRESOLVED ${value}: `, "m"),
      );
    }
    repoGit(root, "update-ref", "refs/remotes/origin/develop", "HEAD");
    const r = runGate(root, [], {
      SERVICE_ROLE_CEILING_PUSHED_FROM: "0".repeat(40),
    });
    expect(r.status, r.out).toBe(1);
    expect(r.out).toMatch(/^CEILING_BASE_UNRESOLVED 0{40}: /m);
  });

  it("fixture 7d (control): a push revision present in the checkout is the base", () => {
    const root = gateRepo();
    const before = repoGit(root, "rev-parse", "HEAD");
    addCeilingRow(root, "zzz/new.ts admin_client 1");
    const r = runGate(root, [], { SERVICE_ROLE_CEILING_PUSHED_FROM: before });
    expect(r.status, r.out).toBe(1);
    expect(r.out).toMatch(
      /^CEILING_GROWTH zzz\/new\.ts admin_client: added at 1 without a ruling token$/m,
    );
  });

  it("fixture 8: a base commit plus a token-less row fails CEILING_GROWTH only; a row with ruling:W8-R10 passes", () => {
    const root = gateRepo();
    addCeilingRow(root, "zzz/new.ts admin_client 1");
    const r = runGate(root, ["--base", "HEAD~1", "--require-base"]);
    expect(r.status, r.out).toBe(1);
    expect(r.out).toMatch(
      /^CEILING_GROWTH zzz\/new\.ts admin_client: added at 1 without a ruling token$/m,
    );
    expect(r.out).not.toMatch(
      /NEW_SITE|ALLOWLIST_GROWTH|CEILING_BASE_UNRESOLVED/,
    );

    const control = gateRepo();
    addCeilingRow(control, "zzz/new.ts admin_client 1 ruling:W8-R10");
    const ok = runGate(control, ["--base", "HEAD~1", "--require-base"]);
    expect(ok.status, ok.out).toBe(0);
    expect(ok.out).toContain("PASS: service-role client gate:");
  });
});
