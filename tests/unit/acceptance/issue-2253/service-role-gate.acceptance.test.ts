/**
 * #2253 service-role client gate, addendum 1 §6 criteria 8-11 (replacing r1
 * §6 8-10). Black-box: each case runs the gate CLI in a throwaway repo that
 * holds a copy of the gate, an allowlist and fixture files; the real-tree cases
 * run it on this checkout. Owned by Acceptance.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { afterAll, describe, expect, it } from "vitest";

import {
  ALLOWLIST,
  FACTORY,
  GATE,
  KEY_RE,
  KINDS,
  TOTALS,
  type Entry,
  gate,
  names,
  read,
  removeTempDirs,
} from "./harness";

afterAll(removeTempDirs);

const K = "SUPABASE_SERVICE_ROLE_KEY";
const OP = 'import { withOperation } from "../shared/with-operation";';
const call = (n: number, fn = "getAdminClient") =>
  `import { ${fn} } from "${FACTORY}";\n${`${fn}();\n`.repeat(n)}`;
/** Each fixture is an unlisted file; [file, kind, text, site lines, non-site lines]. */
const SITES: [string, string, string, number[], number[]][] = [
  ["apps/web/lib/direct.ts", "admin_client", call(1), [2], []],
  [
    "packages/fx/aliased.ts",
    "admin_client",
    `import { createAdminClient as mk } from "${FACTORY}";\nmk();`,
    [2],
    [],
  ],
  [
    "packages/fx/namespace.tsx",
    "admin_client",
    `import * as a from "${FACTORY}";\na.getAdminClient();\na["createAdminClient"]();`,
    [2, 3],
    [],
  ],
  [
    "packages/fx/dynamic.ts",
    "admin_client",
    `export async function x() {\n  const { getAdminClient: g } = await import("${FACTORY}");\n  return g();\n}`,
    [3],
    [],
  ],
  [
    "scripts/fx/required.cjs",
    "admin_client",
    `const { createAdminClient } = require("${FACTORY}");\ncreateAdminClient();`,
    [2],
    [],
  ],
  [
    "packages/database/fx/relative.ts",
    "admin_client",
    'import { getAdminClient } from "../supabase/admin";\ngetAdminClient();',
    [2],
    [],
  ],
  [
    "tooling/fx/escape.ts",
    "admin_client",
    `import { getAdminClient } from "${FACTORY}";\nexport const f = getAdminClient;\ntype T = ReturnType<typeof getAdminClient>;`,
    [2],
    [3],
  ],
  [
    "scripts/fx/keys.mjs",
    "service_role_key",
    [
      `process.env.${K};`,
      `env["${K}"];`,
      `const o = { ${K}: 1 };`,
      `required("${K}");`,
      `const n = ["A", "${K}"];`,
      `const r = /${K}=/;`,
      `const t = \`\${x}${K}\`;`,
      `// ${K}`,
      "serverEnv.SERVICE_ROLE_KEY;",
      `process.env.${K}_FILE; X_${K}; DOCUMENT_CUTOVER_SUPABASE_READ_KEY;`,
    ].join("\n"),
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [10],
  ],
  [
    "packages/api/src/workflows/functions/fx.ts",
    "workflow_admin_wrapper",
    [
      'import { requireWorkflowAdminClient, requireWorkflowAdminClient as rw } from "../admin-client";',
      'import * as wa from "../admin-client";',
      'requireWorkflowAdminClient("a");',
      'rw("b");',
      'wa.requireWorkflowAdminClient("c");',
      "export const leak = requireWorkflowAdminClient;",
    ].join("\n"),
    [3, 4, 5, 6],
    [],
  ],
  [
    "packages/api/src/admin/fx.ts",
    "operation_admin_context",
    [
      OP,
      "export const a = withOperation(async ({ supabaseAdmin }) => supabaseAdmin);",
      "export const b = withOperation(async ({ supabaseAdmin: db }) => db);",
      "export const c = withOperation(async (ctx) => ctx.supabaseAdmin);",
      "export const d = withOperation(async ({ auth, ...rest }) => rest);",
      "export const e = withOperation(async (ctx) => other(ctx));",
      "export const f = withOperation(handler);",
      "export const g = withOperation(async ({ auth, request }) => auth);",
      "export const h = withOperation;",
      'export const i = withOperation(async (ctx) => ctx["supabaseAdmin"]);',
    ].join("\n"),
    [2, 3, 4, 5, 6, 7, 9, 10],
    [8],
  ],
];

/** Files that are never sites (exempt paths, tests, build output), plus listed shrinks. */
const CLEAN: Record<string, string> = {
  "packages/database/supabase/admin.ts": `export function getAdminClient() { return process.env.${K}; }`,
  "packages/api/src/identity/guard.ts": `${call(1)}process.env.${K};`,
  "packages/api/src/workflows/admin-client.ts": `${call(1)}export function requireWorkflowAdminClient() {}`,
  "packages/api/src/shared/with-operation.ts": `${call(1)}export function withOperation(h) { return h; }`,
  "packages/api/src/posts/index.ts": call(1),
  "packages/api/src/profile/index.ts": call(2),
  "scripts/verify-money-units.ts": `process.env.${K};`,
  "packages/api/src/workflows/functions/stripe-event-processing.ts":
    'import { requireWorkflowAdminClient } from "../admin-client";\nrequireWorkflowAdminClient("x");',
  "packages/api/src/admin/crm/table-preferences/route.ts": `${OP.replace("../", "../../../")}\nexport const a = withOperation(async ({ supabaseAdmin }) => supabaseAdmin);`,
  "packages/api/src/admin/fx-neg.ts": `${OP}\nexport const g = withOperation(async ({ auth, request }) => auth);\nfunction getAdminClient() {}\ngetAdminClient();\nimport type { AdminSupabaseClient } from "${FACTORY}";`,
  ...Object.fromEntries(
    [
      "packages/fx/a.test.ts",
      "packages/fx/b.spec.tsx",
      "packages/fx/__tests__/c.ts",
      "apps/web/e2e/d.ts",
      "packages/fx/types.d.ts",
      "packages/fx/dist/e.js",
      "apps/web/.next/f.js",
      "packages/fx/node_modules/g.ts",
    ].map((f) => [f, `${call(1)}process.env.${K};`]),
  ),
};
const e = (
  file: string,
  kind: string,
  count: number,
  reason?: string,
): Entry => ({
  file,
  kind,
  count,
  ...(reason === undefined ? {} : { reason }),
});
const CLEAN_LIST: Entry[] = [
  e("packages/api/src/workflows/admin-client.ts", "admin_client", 1),
  e("packages/api/src/shared/with-operation.ts", "admin_client", 1),
  e("packages/api/src/posts/index.ts", "admin_client", 1),
  e("packages/api/src/profile/index.ts", "admin_client", 2),
  e("scripts/verify-money-units.ts", "service_role_key", 1),
  e(
    "packages/api/src/workflows/functions/stripe-event-processing.ts",
    "workflow_admin_wrapper",
    1,
  ),
  e(
    "packages/api/src/admin/crm/table-preferences/route.ts",
    "operation_admin_context",
    1,
  ),
];
const POSTS = "packages/api/src/posts/index.ts";
const posts = (calls: number, entries: Entry[]) =>
  gate({ ...CLEAN, [POSTS]: calls ? call(calls) : "export {};" }, [
    ...CLEAN_LIST.filter((x) => x.file !== POSTS),
    ...entries,
  ]);

describe("#2253 service-role gate on fixtures (8, 9, 10)", () => {
  it("9: exempt paths, tests, build output, definitions, non-sites and shrunk entries of every kind pass", () => {
    const r = gate(CLEAN, CLEAN_LIST);
    expect(r.status, r.out).toBe(0);
  });

  it("8, 10: every binding form, value escape, key spelling and handler shape is a site, named with kind and :line", () => {
    const r = gate(
      { ...CLEAN, ...Object.fromEntries(SITES.map(([f, , t]) => [f, t])) },
      CLEAN_LIST,
    );
    expect(r.status).not.toBe(0);
    for (const [file, kind, , lines, not] of SITES) {
      for (const n of lines)
        expect(
          names(r.out, file, kind, [n]),
          `${file}:${n} ${kind}\n${r.out}`,
        ).toBe(true);
      for (const n of not)
        expect(
          names(r.out, file, kind, [n]),
          `${file}:${n} is not a site`,
        ).toBe(false);
    }
    expect(r.out).not.toMatch(
      /fx-neg|a\.test|b\.spec|__tests__|e2e\/d|types\.d|dist\/e|\.next\/f|node_modules\/g|identity\/guard/,
    );
  });

  it("8: re-exporting the factory, requireWorkflowAdminClient or withOperation fails even when allowlisted", () => {
    const fx: [string, string, string][] = [
      [
        "packages/api/src/donate/index.ts",
        "admin_client",
        `export { getAdminClient } from "${FACTORY}";\n${call(1, "createAdminClient")}`,
      ],
      [
        "packages/api/src/workflows/functions/donation-saga-recovery.ts",
        "workflow_admin_wrapper",
        'export { requireWorkflowAdminClient } from "../admin-client";\nimport { requireWorkflowAdminClient } from "../admin-client";\nrequireWorkflowAdminClient("x");',
      ],
      [
        "packages/api/src/admin/users.ts",
        "operation_admin_context",
        `export { withOperation as w } from "../shared/with-operation";\n${OP}\nexport const a = withOperation(async ({ supabaseAdmin }) => supabaseAdmin);`,
      ],
    ];
    const r = gate(
      { ...CLEAN, ...Object.fromEntries(fx.map(([f, , t]) => [f, t])) },
      [...CLEAN_LIST, ...fx.map(([f, k]) => e(f, k, 1))],
    );
    expect(r.status).not.toBe(0);
    for (const [file] of fx)
      expect(
        r.out.split("\n").some((l) => l.includes(file) && /:1(?!\d)/.test(l)),
        `${file}:1 re-export\n${r.out}`,
      ).toBe(true);
  });

  it.each<[string, number, Entry[], number[]]>([
    ["a count above the allowlist", 2, [e(POSTS, "admin_client", 1)], [2, 3]],
    [
      "a count above the frozen ceiling (2)",
      3,
      [e(POSTS, "admin_client", 3)],
      [],
    ],
    [
      "an allowlist count above the real count",
      1,
      [e(POSTS, "admin_client", 2)],
      [],
    ],
    [
      "an entry whose file has no site left",
      0,
      [e(POSTS, "admin_client", 1)],
      [],
    ],
    ["an empty reason", 2, [e(POSTS, "admin_client", 2, "")], []],
  ])("9: %s fails and names the entry", (_name, calls, entries, lines) => {
    const r = posts(calls, entries);
    expect(r.status, r.out).not.toBe(0);
    expect(names(r.out, POSTS, "admin_client", lines), r.out).toBe(true);
  });

  it("8: the gate never counts itself, by an exact exemption only: unlisted sites beside it, under a gate-prefixed name or in a nested copy of its name still fail", () => {
    const dir = GATE.slice(0, GATE.lastIndexOf("/"));
    const fx = [
      `${dir}/acc2253-sibling.mjs`,
      GATE.replace(/\.mjs$/, "-helper.mjs"),
      `${dir}/nested/${GATE.slice(dir.length + 1)}`,
    ];
    const r = gate(
      {
        ...CLEAN,
        ...Object.fromEntries(fx.map((f) => [f, `process.env.${K};`])),
      },
      CLEAN_LIST,
    );
    expect(r.status, r.out).not.toBe(0);
    for (const f of fx)
      expect(names(r.out, f, "service_role_key", [1]), `${f}:1\n${r.out}`).toBe(
        true,
      );
  });

  it("9: an allowlist entry that is not in the frozen ceiling fails (growth)", () => {
    const f = "packages/fx/new-site.ts";
    const r = gate({ ...CLEAN, [f]: call(1) }, [
      ...CLEAN_LIST,
      e(f, "admin_client", 1),
    ]);
    expect(r.status, r.out).not.toBe(0);
    expect(names(r.out, f, "admin_client"), r.out).toBe(true);
  });
});

type Allow = {
  version: number;
  ruling: string;
  frozen_at: string;
  entries: (Entry & {
    lines: unknown;
    path_ref: unknown;
    follow_up: unknown;
  })[];
};
const doc = () => JSON.parse(read(ALLOWLIST) || "null") as Allow | null;

describe("#2253 service-role gate on the real tree (9, 11)", () => {
  it("9: the allowlist is the frozen 117-entry list: 188 sites in 111 files, per-kind totals as specced", () => {
    const d = doc();
    expect(d, `${ALLOWLIST} exists and is JSON`).not.toBeNull();
    expect([d!.version, d!.ruling, d!.frozen_at]).toEqual([
      1,
      "Samson Q4, Oct 24, 2026",
      "c541b84b",
    ]);
    const keys = d!.entries.map((x) => `${x.file}\0${x.kind}`);
    expect(keys).toEqual([...new Set(keys)].sort());
    for (const x of d!.entries) {
      expect(KINDS, x.file).toContain(x.kind);
      expect(Number.isInteger(x.count) && x.count > 0, x.file).toBe(true);
      expect(String(x.reason ?? "").trim(), `${x.file} reason`).not.toBe("");
      for (const k of ["lines", "path_ref", "follow_up"] as const)
        expect(x, x.file).toHaveProperty(k);
    }
    const got = Object.fromEntries(
      KINDS.map((k) => {
        const xs = d!.entries.filter((x) => x.kind === k);
        return [k, [xs.reduce((a, x) => a + x.count, 0), xs.length]];
      }),
    );
    expect(got).toEqual(TOTALS);
    expect([
      d!.entries.length,
      new Set(d!.entries.map((x) => x.file)).size,
    ]).toEqual([117, 111]);
  });

  it("9 (non-vacuous): service_role_key entries equal an independent key-name count over the scanned tree, the gate itself excluded", () => {
    const files = spawnSync(
      "git",
      ["ls-files", "-z", "apps", "packages", "scripts", "tooling"],
      { encoding: "utf8" },
    )
      .stdout.split("\0")
      .filter(
        (f) =>
          /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/.test(f) &&
          !/\.d\.ts$|\.(test|spec)\.|(^|\/)(__tests__|e2e|tests|node_modules|\.next|dist)\//.test(
            f,
          ),
      )
      .filter(
        (f) =>
          f !== GATE &&
          f !== "packages/database/supabase/admin.ts" &&
          !f.startsWith("packages/api/src/identity/"),
      );
    expect(files.length).toBeGreaterThan(1000);
    const counted = Object.fromEntries(
      files
        .map((f) => [f, readFileSync(f, "utf8").match(KEY_RE)?.length ?? 0])
        .filter(([, n]) => n),
    );
    const listed = Object.fromEntries(
      (doc()?.entries ?? [])
        .filter((x) => x.kind === "service_role_key")
        .map((x) => [x.file, x.count]),
    );
    expect(listed).toEqual(counted);
  });

  it("11: the gate passes on this checkout without counting itself (stale detection means every listed site was found)", () => {
    const r = spawnSync(process.execPath, [GATE], { encoding: "utf8" });
    expect(r.status, `${r.stdout}${r.stderr}`).toBe(0);
    expect(
      JSON.parse(read("package.json")).scripts["verify:service-role-clients"],
    ).toContain(GATE);
  });
});
