/**
 * #2258 static/unit acceptance, no database. Spec r2 (comment 6388953289) plus
 * pins addendum 1 (6419311427, approved 6419380148). Covers the S halves of
 * criteria 1-17 at acceptance level (c7 S is the spec's named content of this
 * file); Builder's own unit/compile-fail/poison suites live under
 * tests/unit/packages/api/principal/**. Opt-in criterion 11 (diff scope, the one
 * workflow run: line, base version): ACCEPTANCE_2258_SCOPE=1 (base: git
 * merge-base origin/develop HEAD) or ACCEPTANCE_2258_BASE=<ref>.
 * The principal modules are loaded with import() so each test fails on its own
 * while they are missing. R criteria are in current-user-assignments.realstack.
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import * as H from "./harness";
import {
  loadWorkflowDocument,
  workflowJobs,
} from "../../helpers/workflow-yaml";

const ver = (f: string) => f.slice(0, 14);
const forward = (fs: string[]) => fs.filter((f) => /^\d{14}_.+\.sql$/.test(f));
const sql = () => {
  expect(existsSync(H.MIGRATION), `${H.MIGRATION} must exist`).toBe(true);
  return H.read(H.MIGRATION);
};
const load = async <T>(m: keyof typeof H.MOD): Promise<T> => {
  const spec: string = H.MOD[m];
  return (await import(/* @vite-ignore */ spec)) as T;
};
const resolver = async () =>
  (await load<{ resolveActiveAssignment: H.Resolve }>("assignment"))
    .resolveActiveAssignment;
const CII = ".github/workflows/ci-integration.yml";
const STEP = "Verify tenant isolation (real stack)";

/* ---------- DI fakes ---------- */
const TA = randomUUID();
const TB = randomUUID();
const U1 = randomUUID();
const row = (
  tenant: string,
  role: string,
  staff: string | null = null,
  user = U1,
): H.Row => ({
  id: randomUUID(),
  user_id: user,
  tenant_id: tenant,
  role,
  staff_role: staff,
  updated_at: "2026-10-26T15:00:00.000000+00:00",
});
function fake(...pages: H.Row[][]) {
  const f = {
    calls: 0,
    async listActiveAssignments() {
      const p = pages[Math.min(f.calls, pages.length - 1)] ?? [];
      f.calls += 1;
      return p;
    },
  };
  return f;
}
const failing = () => ({
  calls: 0,
  async listActiveAssignments(): Promise<H.Row[]> {
    this.calls += 1;
    throw new Error("rpc down");
  },
});
const ok = (r: H.Row, selection: string) => ({
  ok: true,
  assignment: H.asAssignment(r),
  selection,
});

describe("#2258 resolver (criteria 3, 4, 5, 9, 17 S; DI fakes, no vi.mock)", () => {
  const STAFF = row(TA, "staff", "finance");
  const DONOR_TB = row(TB, "donor");

  it("3: an owned proposal gives ok, selection 'proposed' (r2)", async () => {
    const res = await (
      await resolver()
    )({ userId: U1, proposedAssignmentId: STAFF.id }, fake([STAFF, DONOR_TB]));
    expect(res).toEqual(ok(STAFF, "proposed"));
  });
  it("3: a random UUID, another user's id, or an inactive id (absent from the reader output) gives not_owned_or_inactive", async () => {
    const r = await resolver();
    const other = row(TA, "donor", null, randomUUID()).id;
    const inactive = row(TB, "missionary").id;
    for (const p of [randomUUID(), other, inactive])
      expect(
        await r(
          { userId: U1, proposedAssignmentId: p },
          fake([STAFF, DONOR_TB]),
        ),
      ).toEqual({ ok: false, reason: "not_owned_or_inactive" });
  });
  it("3: a non-UUID proposal gives not_owned_or_inactive with 0 reader calls", async () => {
    const f = fake([STAFF]);
    expect(
      await (
        await resolver()
      )({ userId: U1, proposedAssignmentId: "1 or 1=1" }, f),
    ).toEqual({ ok: false, reason: "not_owned_or_inactive" });
    expect(f.calls).toBe(0);
  });
  it("3: a proposal whose tenant differs from expectedTenantId gives tenant_mismatch", async () => {
    expect(
      await (
        await resolver()
      )(
        { userId: U1, proposedAssignmentId: STAFF.id, expectedTenantId: TB },
        fake([STAFF, DONOR_TB]),
      ),
    ).toEqual({ ok: false, reason: "tenant_mismatch" });
  });
  it("3/4: 0 rows gives no_assignment with no tenantId key (super_admin profile, NULL tenant, no memberships)", async () => {
    const res = await (await resolver())({ userId: U1 }, fake([]));
    expect(res).toEqual({ ok: false, reason: "no_assignment" });
    expect(JSON.stringify(res)).not.toMatch(/tenantId/);
  });
  it("3: a reader rejection gives reader_error", async () => {
    expect(await (await resolver())({ userId: U1 }, failing())).toEqual({
      ok: false,
      reason: "reader_error",
    });
  });
  it("3: a non-UUID userId gives reader_error with 0 reader calls", async () => {
    const f = fake([STAFF]);
    expect(await (await resolver())({ userId: "u1" }, f)).toEqual({
      ok: false,
      reason: "reader_error",
    });
    expect(f.calls).toBe(0);
  });
  const MALFORMED: [string, (r: H.Row) => Record<string, unknown>][] = [
    ["non-UUID id", (r) => ({ ...r, id: "x" })],
    ["non-UUID tenant", (r) => ({ ...r, tenant_id: "x" })],
    [
      "user_id other than input.userId",
      (r) => ({ ...r, user_id: randomUUID() }),
    ],
    ["unknown role", (r) => ({ ...r, role: "admin", staff_role: null })],
    ["unknown staff role", (r) => ({ ...r, role: "staff", staff_role: "ceo" })],
    [
      "staff without staff_role",
      (r) => ({ ...r, role: "staff", staff_role: null }),
    ],
    [
      "staff_role on a non-staff row",
      (r) => ({ ...r, role: "donor", staff_role: "finance" }),
    ],
    [
      "missing updated_at",
      (r) =>
        Object.fromEntries(
          Object.entries(r).filter(([k]) => k !== "updated_at"),
        ),
    ],
  ];
  it.each(MALFORMED)(
    "3: a malformed row (%s) beside a valid one gives reader_error, with and without a proposal",
    async (_n, bad) => {
      const r = await resolver();
      const rows = [STAFF, bad(row(TA, "donor")) as H.Row];
      expect(
        await r({ userId: U1, proposedAssignmentId: STAFF.id }, fake(rows)),
      ).toEqual({ ok: false, reason: "reader_error" });
      expect(
        await r({ userId: U1, expectedTenantId: TA }, fake(rows.reverse())),
      ).toEqual({ ok: false, reason: "reader_error" });
    },
  );
  it("5: per request: a flipping fake gives ok, then not_owned_or_inactive, with 2 reader calls", async () => {
    const r = await resolver();
    const f = fake([STAFF], []);
    const input = { userId: U1, proposedAssignmentId: STAFF.id };
    expect((await r(input, f)).ok).toBe(true);
    expect(await r(input, f)).toEqual({
      ok: false,
      reason: "not_owned_or_inactive",
    });
    expect(f.calls).toBe(2);
  });
  it("9 (Gate 2): U1 proposing the TA row gets tenantId TA and exactly one assignment, never a tenant array", async () => {
    const res = await (
      await resolver()
    )({ userId: U1, proposedAssignmentId: STAFF.id }, fake([DONOR_TB, STAFF]));
    expect(res.ok && res.assignment.tenantId).toBe(TA);
    expect(Object.values(res).some(Array.isArray)).toBe(false);
    expect(res.ok && Object.values(res.assignment).some(Array.isArray)).toBe(
      false,
    );
  });

  // criterion 17 (S): default selection. "label | reader rows | input | expected ([row] selection, or reason)".
  const R: Record<string, H.Row> = {
    D: row(TA, "donor"),
    M: row(TA, "missionary"),
    S1: row(TA, "staff", "finance"),
    S2: row(TA, "staff", "member_care"),
    DB: row(TB, "donor"),
  };
  const CASES = `3/17: no proposal, one row → sole | D | - | D sole
3/17: expectedTenantId TA, rows in TA and TB → the TA row, sole | S1 DB | TA | S1 sole
3/17: rows in TA and TB, no expectedTenantId → ambiguous | D DB | - | ambiguous
17a: staff + donor, one tenant → the staff row, default_staff | S1 D | - | S1 default_staff
17b: staff + missionary → the staff row, default_staff | M S1 | - | S1 default_staff
17c: staff + donor + missionary → the staff row, default_staff | D S1 M | - | S1 default_staff
17d: case (a) in reverse reader order → the same row | D S1 | - | S1 default_staff
17e: two staff roles in one tenant → ambiguous | S1 S2 | - | ambiguous
17f: donor + missionary in one tenant → ambiguous | D M | - | ambiguous
17g: staff in TA + donor in TB, no expectedTenantId → ambiguous (5a) | S1 DB | - | ambiguous
17h: case (g) with expectedTenantId TB → the donor row, sole | S1 DB | TB | DB sole
17i: case (a) proposing the donor id → the donor row, proposed | S1 D | propose:D | D proposed`
    .split("\n")
    .map((l) => l.split(" | ") as [string, string, string, string]);
  it.each(CASES)("%s", async (_n, rows, input, want) => {
    const extra =
      input === "-"
        ? {}
        : input.startsWith("propose:")
          ? { proposedAssignmentId: R[input.slice(8)]!.id }
          : { expectedTenantId: input === "TA" ? TA : TB };
    const [k, sel] = want.split(" ");
    const res = await (
      await resolver()
    )({ userId: U1, ...extra }, fake(rows.split(" ").map((x) => R[x]!)));
    expect(res).toEqual(sel ? ok(R[k!]!, sel) : { ok: false, reason: k });
  });
});

describe("#2258 mapper and reader (criteria 2, 7 S)", () => {
  it("2: toHumanProjectionAssignment maps exactly (revision = currentRevision = a.revision)", async () => {
    const { toHumanProjectionAssignment } = await load<{
      toHumanProjectionAssignment: (a: unknown) => unknown;
    }>("projection");
    const a = H.asAssignment(row(TA, "staff", "finance"));
    expect(toHumanProjectionAssignment(a)).toEqual({
      id: a.assignmentId,
      revision: a.revision,
      currentRevision: a.revision,
      principalId: a.userId,
      tenantId: a.tenantId,
    });
  });
  type MkReader = { createRpcAssignmentReader: (c: unknown) => H.Reader };
  const client = (res: { data: unknown; error: unknown }) => {
    const calls: unknown[][] = [];
    return { calls, rpc: async (...a: unknown[]) => (calls.push(a), res) };
  };
  it("7 (Reader): calls rpc('current_user_assignments') with no args and returns rows unchanged", async () => {
    const { createRpcAssignmentReader } = await load<MkReader>("reader");
    const rows = [row(TA, "donor"), row(TB, "staff", "hr")];
    const c = client({ data: rows, error: null });
    const out = await createRpcAssignmentReader(c).listActiveAssignments();
    expect(c.calls).toEqual([["current_user_assignments"]]);
    expect(out).toEqual(rows);
    out.forEach((r, i) => expect(r).toBe(rows[i]));
  });
  it.each([
    ["{ error }", { data: null, error: { message: "boom", code: "42501" } }],
    ["non-array data (object)", { data: { id: "x" }, error: null }],
    ["non-array data (null)", { data: null, error: null }],
  ])("7 (Reader): throws on %s", async (_n, res) => {
    const { createRpcAssignmentReader } = await load<MkReader>("reader");
    await expect(
      createRpcAssignmentReader(client(res)).listActiveAssignments(),
    ).rejects.toThrow();
  });
  it("7 (Reader): reader.ts imports no admin module and reads no service-role key", () => {
    const src = H.read(`${H.PRINCIPAL_DIR}/reader.ts`);
    expect(src, "reader.ts must exist").not.toBe("");
    expect(src).not.toMatch(
      /supabase\/admin|getAdminClient|SERVICE_ROLE|service[_-]role/i,
    );
  });
});

describe("#2258 migration and rollback text (criteria 6, 7 S, 12, 16)", () => {
  it(`7: the forward file is exactly ${H.MIGRATION_NAME} (addendum 1 item 1); 12: version unique and > develop ${H.DEVELOP_LATEST}`, () => {
    sql();
    const all = forward(readdirSync(H.MIG));
    expect(
      all.filter((f) => /_current_user_assignments_rpc\.sql$/.test(f)),
    ).toEqual([H.MIGRATION_NAME]);
    expect(all.filter((f) => ver(f) === ver(H.MIGRATION_NAME))).toHaveLength(1);
    expect(ver(H.MIGRATION_NAME) > H.DEVELOP_LATEST).toBe(true);
  });
  it.each([
    String.raw`CREATE OR REPLACE FUNCTION public\.current_user_assignments\(\)`,
    "SECURITY INVOKER",
    "SET search_path = ''",
    String.raw`m\.user_id = auth\.uid\(\)`,
    String.raw`m\.is_active = true`,
    String.raw`FROM authz\.memberships`,
    String.raw`REVOKE ALL ON FUNCTION public\.current_user_assignments\(\) FROM PUBLIC, anon, authenticated, service_role`,
    String.raw`GRANT EXECUTE ON FUNCTION public\.current_user_assignments\(\) TO authenticated`,
    String.raw`pg_notify\('pgrst', 'reload schema'\)`,
  ])("7: the migration matches /%s/", (re) =>
    expect(sql()).toMatch(new RegExp(re)),
  );
  it.each([
    ["SECURITY DEFINER", /SECURITY\s+DEFINER/i],
    ["a uuid parameter", /current_user_assignments\s*\(\s*[^)\s]/i],
    ["app_metadata (r2)", /app_metadata/i],
    ["current_tenant_id (r2)", /current_tenant_id/i],
  ])("7: the migration does not match %s", (_n, re) =>
    expect(sql()).not.toMatch(re),
  );
  it("7: the rollback exists and drops exactly this function", () => {
    expect(existsSync(H.ROLLBACK), H.ROLLBACK).toBe(true);
    const body = H.code(H.read(H.ROLLBACK));
    expect(body).toMatch(
      /DROP\s+FUNCTION\s+(IF\s+EXISTS\s+)?public\.current_user_assignments\s*\(\s*\)/i,
    );
    expect(body.match(/\bDROP\b/gi)).toHaveLength(1);
    expect(body).not.toMatch(
      /\b(CREATE|ALTER|GRANT|REVOKE|INSERT|UPDATE|DELETE)\b/i,
    );
  });
  it("6: exactly one CREATE ... FUNCTION; no CREATE TABLE, ALTER TABLE, ADD COLUMN, CREATE POLICY, set_config or tenant_guard", () => {
    const body = H.code(sql());
    expect(body.match(/CREATE\s+(OR\s+REPLACE\s+)?FUNCTION/gi)).toHaveLength(1);
    expect(body).not.toMatch(
      /CREATE\s+TABLE|ALTER\s+TABLE|ADD\s+COLUMN|CREATE\s+POLICY|set_config|tenant_guard/i,
    );
  });
  it("16: the migration has no INSERT/UPDATE/DELETE and names neither person_id nor missionaries", () => {
    const body = H.code(sql());
    expect(body).not.toMatch(/\b(INSERT\s+INTO|UPDATE\s+\w|DELETE\s+FROM)\b/i);
    expect(sql()).not.toMatch(/person_id|missionaries/i);
  });
});

/** Gate 4 (c10): names-never-authorize scan. Returns findings for one file's text. */
function gate4(file: string, text: string): string[] {
  const out: string[] = [];
  const lines = text.split("\n");
  lines.forEach((l, i) => {
    if (/\/\/ authz-exempt: display-only\s*$/.test(l)) return;
    if (/\/\/ authz-exempt: default-selection\s*$/.test(l)) {
      if (!file.endsWith("/assignment.ts"))
        out.push(`${file}:${i + 1} default-selection outside assignment.ts`);
      if (
        /staffRole|staff_role/.test(l) ||
        !/membershipRole\s*===\s*"staff"/.test(l)
      )
        out.push(
          `${file}:${i + 1} default-selection must compare only membershipRole to "staff"`,
        );
      return;
    }
    if (
      /role\s*===|role\s*!==|\.role\)|profileRole|hasRole\(|is_super_admin|"super_admin"/.test(
        l,
      )
    )
      out.push(`${file}:${i + 1} ${l.trim()}`);
  });
  if (
    lines.filter((l) => /\/\/ authz-exempt: default-selection\s*$/.test(l))
      .length > 1
  )
    out.push(`${file}: more than one default-selection marker`);
  return out;
}

describe("#2258 principal/** scans (criteria 1, 4, 5, 8, 10, 15, 17 S)", () => {
  const src = () => {
    const files = H.principalSources();
    expect(
      files.map((f) => f.split("/").pop()).sort(),
      "In 1-4: principal/{types,projection,reader,assignment,index}.ts",
    ).toEqual(
      expect.arrayContaining([
        "assignment.ts",
        "index.ts",
        "projection.ts",
        "reader.ts",
        "types.ts",
      ]),
    );
    return files.map((f) => [f, H.read(f)] as const);
  };
  it("1: types.ts declares the four principal kinds", () => {
    const t = H.read(`${H.PRINCIPAL_DIR}/types.ts`);
    for (const k of [
      "human",
      "external",
      "service_account",
      "platform_operator",
    ])
      expect(t).toMatch(new RegExp(`kind\\s*:\\s*"${k}"`));
  });
  it.each([
    "profiles",
    "profileRole",
    "DEMO_TENANT_ID",
    "DEFAULT_TENANT_ID",
    "getAuthContext",
    "@asym/auth",
    "app_metadata",
    "current_tenant_id",
  ])("4: no principal/** source names %s", (w) =>
    expect(
      src()
        .filter(([, s]) => s.includes(w))
        .map(([f]) => f),
    ).toEqual([]),
  );
  it("5: no top-level let, new Map or new Set in principal/**", () =>
    expect(
      src().flatMap(([f, s]) =>
        s
          .split("\n")
          .filter((l) =>
            /^(export\s+)?let\s|^(export\s+)?(const|let|var)\s[^=]*=\s*new\s+(Map|Set)\b/.test(
              l,
            ),
          )
          .map((l) => `${f}: ${l}`),
      ),
    ).toEqual([]));
  it("8: no toAssignmentRef or revalidateAssignmentAtFireTime in principal/**", () =>
    expect(
      src()
        .filter(([, s]) =>
          /toAssignmentRef|revalidateAssignmentAtFireTime/.test(s),
        )
        .map(([f]) => f),
    ).toEqual([]));
  it("10: the Gate 4 scan passes principal/**, with exactly one default-selection line, in pickDefaultAssignment", () => {
    const files = src();
    expect(files.flatMap(([f, s]) => gate4(f, s))).toEqual([]);
    const a = H.read(`${H.PRINCIPAL_DIR}/assignment.ts`);
    const markers = a
      .split("\n")
      .filter((l) => /\/\/ authz-exempt: default-selection\s*$/.test(l));
    expect(markers).toHaveLength(1);
    const fn =
      /function\s+pickDefaultAssignment\s*\(([^)]*)\)[^{]*\{([\s\S]*?)\n\}/.exec(
        a,
      );
    expect(fn, "pickDefaultAssignment in assignment.ts").not.toBeNull();
    expect(fn![2]).toContain(markers[0]!.trim());
  });
  it.each([
    [
      "poison-gate4",
      'if (x.profileRole === "super_admin") return { ok: true };',
    ],
    [
      "poison-gate4-default",
      'if (c.staffRole === "finance") return c; // authz-exempt: default-selection',
    ],
  ])("10: the Gate 4 scan reports %s", (_n, poison) =>
    expect(
      gate4(`${H.PRINCIPAL_DIR}/assignment.ts`, `${poison}\n`),
    ).not.toEqual([]),
  );
  it("10: a second default-selection marker, or one in another file, is reported", () => {
    const l =
      'return m.membershipRole === "staff"; // authz-exempt: default-selection';
    expect(
      gate4(`${H.PRINCIPAL_DIR}/assignment.ts`, `${l}\n${l}\n`),
    ).not.toEqual([]);
    expect(gate4(`${H.PRINCIPAL_DIR}/reader.ts`, `${l}\n`)).not.toEqual([]);
    expect(gate4(`${H.PRINCIPAL_DIR}/assignment.ts`, `${l}\n`)).toEqual([]);
  });
  it("17: pickDefaultAssignment is pure: no expectedTenantId, reader, await or I/O in it", () => {
    const a = H.read(`${H.PRINCIPAL_DIR}/assignment.ts`);
    const fn =
      /function\s+pickDefaultAssignment\s*\(([^)]*)\)[^{]*\{([\s\S]*?)\n\}/.exec(
        a,
      );
    expect(fn, "pickDefaultAssignment").not.toBeNull();
    expect(fn![0]).not.toMatch(
      /expectedTenantId|reader|listActiveAssignments|\bawait\b|\basync\b|\brpc\(/,
    );
  });
  it("15 (C1): outside principal/** and tests/**, nothing imports the principal module or calls current_user_assignments", () => {
    const r = spawnSync(
      "git",
      [
        "grep",
        "-n",
        "--untracked",
        "-E",
        String.raw`@asym/api/principal|from ['"][^'"]*/principal(/[^'"]*)?['"]|current_user_assignments`,
        "--",
        "*.ts",
        "*.tsx",
        "*.mts",
        "*.js",
        "*.mjs",
        "*.sql",
        ":!tests/**",
        `:!${H.PRINCIPAL_DIR}/**`,
        `:!${H.MIGRATION}`,
        `:!${H.ROLLBACK}`,
      ],
      { encoding: "utf8" },
    );
    expect([0, 1], `git grep: ${r.stderr}`).toContain(r.status);
    expect(r.stdout.trim()).toBe("");
  });
});

describe("#2258 pins (criteria 12, 13)", () => {
  it.each(Object.entries(H.UNEDITED))(
    "12/2: %s is unedited (git blob at develop 88eefbd9)",
    (f, blob) => {
      expect(existsSync(f), f).toBe(true);
      expect(H.blobId(f)).toBe(blob);
    },
  );
  it("12 (addendum 1 item 3): tests/unit/acceptance/issue-2270/ holds exactly its three develop files", () =>
    expect(readdirSync("tests/unit/acceptance/issue-2270").sort()).toEqual([
      "authz-execute-grants.realstack.acceptance.test.ts",
      "harness.ts",
      "static.acceptance.test.ts",
    ]));
  it('In 8/addendum 1 item 4: packages/api/package.json exports "./principal" right after "./projection"', () => {
    const keys = Object.keys(
      (
        JSON.parse(H.read("packages/api/package.json")) as {
          exports: Record<string, string>;
        }
      ).exports,
    );
    expect(keys[keys.indexOf("./projection") + 1]).toBe("./principal");
    expect(
      (
        JSON.parse(H.read("packages/api/package.json")) as {
          exports: Record<string, string>;
        }
      ).exports["./principal"],
    ).toBe("./src/principal/index.ts");
  });
  it(`addendum 1 item 4: '${STEP}' runs ${H.REALSTACK}`, () => {
    const step = (
      workflowJobs(loadWorkflowDocument(CII)).migrate?.steps ?? []
    ).find((s) => s.name === STEP);
    expect(step, STEP).toBeDefined();
    expect(String(step!.run).split(/\s+/)).toContain(H.REALSTACK);
  });
  it("13: the In 7 section sits before '## Key files' and names the required phrases; one Key-files line", () => {
    const doc = H.read(H.DOC);
    const start = doc.search(
      /^##+ Principal and active assignment \(preparation, unwired\)/m,
    );
    const keyFiles = doc.indexOf("\n## Key files");
    expect(start, "section heading").toBeGreaterThan(-1);
    expect(start).toBeLessThan(keyFiles);
    const section = doc.slice(start, keyFiles);
    for (const p of [
      "preparation, unwired",
      "#2259",
      "#668 item 4",
      "SECURITY INVOKER",
      "withTenant",
      "default_staff",
    ])
      expect(section).toContain(p);
    expect(doc.slice(keyFiles)).toMatch(/principal/);
  });
  it("13: docs/ci.md is byte-identical to develop (40,058 bytes, sha256 f636ef0f…)", () => {
    const b = readFileSync("docs/ci.md");
    expect([b.length, createHash("sha256").update(b).digest("hex")]).toEqual([
      40058,
      "f636ef0f0127f1159db711fb005a212aaf0cb3c9ceb9fe64bb308305c55d4e4b",
    ]);
  });
  it.todo(
    "14: PR body has `Closes #2258` and `Refs #669`, base develop (review check; not visible in the tree)",
  );
  it.todo(
    "12: `bun run typecheck`, `test:unit` and `test:acceptance` pass (CI result, not assertable from inside a test)",
  );
});

const BASE = process.env.ACCEPTANCE_2258_BASE?.trim() ?? "";
const ON = process.env.ACCEPTANCE_2258_SCOPE?.trim() === "1" || BASE !== "";
const git = (...args: string[]) => {
  const r = spawnSync("git", args, { encoding: "utf8" });
  expect(r.status, `git ${args.join(" ")}: ${r.stderr}`).toBe(0);
  return r.stdout.trim();
};
/** §6 paths plus addendum 1 item 4's CI edits and fingerprint appends. */
const DECLARED = [
  H.MIGRATION,
  H.ROLLBACK,
  "packages/api/package.json",
  H.DOC,
  CII,
].concat(
  `helpers/workflow-yaml.ts acceptance/issue-2250/static.acceptance.test.ts
  acceptance/issue-2155/postgres-ecr-gates.acceptance.test.ts acceptance/issue-2201/merge-group.acceptance.test.ts`
    .split(/\s+/)
    .map((p) => `tests/unit/${p}`),
);
const PREFIXES = [
  `${H.PRINCIPAL_DIR}/`,
  "tests/unit/packages/api/principal/",
  "tests/unit/acceptance/issue-2258/",
];

describe.skipIf(!ON)(
  "#2258 opt-in (PR base; ACCEPTANCE_2258_SCOPE=1 or ACCEPTANCE_2258_BASE)",
  () => {
    const base = () => BASE || git("merge-base", "origin/develop", "HEAD");
    const changed = () =>
      [
        ...git("diff", "--name-only", "--no-renames", base()).split("\n"),
        ...git("ls-files", "--others", "--exclude-standard").split("\n"),
      ].filter(Boolean);
    it("11: the PR diff touches only §6 paths and addendum 1 item 4's files", () => {
      const outside = changed().filter(
        (f) => !DECLARED.includes(f) && !PREFIXES.some((p) => f.startsWith(p)),
      );
      expect(outside, `diff against ${base()}`).toEqual([]);
    });
    it("11/16: no line the PR adds to a non-test file (workflow excluded) contains set_config, CREATE POLICY, tenant_guard, person_id or missionaries", () => {
      const untracked = git("ls-files", "--others", "--exclude-standard");
      const added = (f: string) =>
        untracked.split("\n").includes(f)
          ? readFileSync(f, "utf8")
          : git("diff", "-U0", "--no-color", "--no-renames", base(), "--", f)
              .split("\n")
              .filter((l) => /^\+(?!\+\+ (b\/|\/dev\/null))/.test(l))
              .join("\n");
      const bad =
        /^.*(?:set_config|CREATE\s+POLICY|tenant_guard|person_id|missionaries).*$/gim;
      const hits = changed()
        .filter((f) => !f.startsWith("tests/") && f !== CII && existsSync(f))
        .flatMap((f) =>
          (added(f).match(bad) ?? []).map((l) => `${f}: ${l.trim()}`),
        );
      expect(hits).toEqual([]);
    });
    it(`11 (addendum 1 item 4): in ${CII} only the '${STEP}' run: line changes, by appending ${H.REALSTACK}`, () => {
      const diff = git("diff", "-U0", "--no-color", base(), "--", CII)
        .split("\n")
        .filter((l) => /^[-+](?![-+]{2} )/.test(l));
      if (diff.length === 0) return;
      const minus = diff.filter((l) => l.startsWith("-"));
      const plus = diff.filter((l) => l.startsWith("+"));
      expect([minus.length, plus.length]).toEqual([1, 1]);
      const words = (l: string) => l.slice(1).trim().split(/\s+/);
      expect(words(minus[0]!).slice(0, 4)).toEqual([
        "run:",
        "bun",
        "x",
        "vitest",
      ]);
      expect(words(plus[0]!)).toEqual([...words(minus[0]!), H.REALSTACK]);
    });
    it("12 (OQ9): the version is greater than every migration on the PR base", () => {
      const onBase = forward(
        git("ls-tree", "--name-only", `${base()}:${H.MIG}`).split("\n"),
      );
      expect(
        onBase.filter((f) => ver(f) >= ver(H.MIGRATION_NAME)),
        `base ${base()}`,
      ).toEqual([]);
    });
  },
);
