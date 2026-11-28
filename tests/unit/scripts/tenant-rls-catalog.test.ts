import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import keyExceptions from "../../../docs/security/tenant-key-exceptions.json";
import { CAPABILITY_REGISTRY } from "../../../packages/auth/capabilities/registry";
import { EXCLUDED_SCHEMA_PATTERN } from "../../../scripts/release/schema-fingerprint.mjs";
import keys from "../../../scripts/verify/command-capabilities.json";
import {
  ownMinistryEntries,
  ownMinistryExceptions,
  WORKER_WRAPPER_ANCHOR_LOOKUPS,
  preMembershipEntries,
  reviewedOwnMinistry,
  reviewedPreMembership,
  preMembershipExceptions,
} from "../../../scripts/verify/command-entry-boundaries.mjs";

it("allows the reviewed CMS tenant-key debt to shrink, never to grow", () => {
  const original = new Set([
    "cms.cms_users",
    "cms.media",
    "cms.ministry_updates",
    "cms.missionary_giving_pages",
    "cms.missionary_profiles",
    "cms.navigation",
    "cms.page_templates",
    "cms.pages",
    "cms.project_pages",
  ]);
  expect(keyExceptions.reason.trim()).not.toBe("");
  expect(new Set(keyExceptions.tables).size).toBe(keyExceptions.tables.length);
  expect(keyExceptions.tables.filter((name) => !original.has(name))).toEqual(
    [],
  );
});

import {
  PARENT_SCOPED_TABLES,
  TENANT_RLS_CATALOG_SQL,
  evaluateTenantRlsCatalog,
  formatTenantRlsCatalogSummary,
  perRowLookups,
  splitTopLevel,
  laneCheckProblem,
  stripParens,
  tenantBound,
} from "../../../scripts/verify/tenant-rls-catalog.mjs";
import {
  OWN_MINISTRY_HELPERS,
  ownMinistryCommandRows,
  ownMinistryHelperRows,
} from "../../fixtures/own-ministry-commands";
import { preMembershipCommandRows } from "../../fixtures/pre-membership-commands";

const table = (name: string, over: Record<string, unknown> = {}) => ({
  ...{ table: name, tenant: true, rls: true, force: true, policies: 1 },
  ...{ owner: "postgres", owner_bypass: true, ...over },
});
/** A compliant SECURITY DEFINER row: fixed empty search path, no PUBLIC or anon EXECUTE. */
const definer = (
  fn: string,
  owner = "postgres",
  bypass = true,
  over: Record<string, unknown> = {},
) => ({
  ...{ function: fn, schema: fn.split(".")[0], owner, owner_bypass: bypass },
  ...{ search_path: '""', volatility: "v" },
  ...{ public_execute: false, anon_execute: false, ...over },
});
/** The body of a human entry point that follows the convention. */
const HUMAN_BODY = `
DECLARE
  v_ctx tenant_guard.command_context;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'people.manage_members');
  RETURN NULL;
END;
`;
/** The body of a platform command that follows the convention. */
const PLATFORM_BODY = `
DECLARE
  v_operator uuid := platform.require_operator();
BEGIN
  RETURN pg_catalog.jsonb_build_object('operator', v_operator);
END;
`;
/** A command-schema function row; compliant worker entry point by default. */
const command = (fn: string, over: Record<string, unknown> = {}) => ({
  ...{ function: fn, schema: fn.split(".")[0], owner: "tenant_guard" },
  ...{ definer: true, authenticated: false, service_role: true },
  ...{ anon: false, public_execute: false, language: "plpgsql" },
  ...{ body: "BEGIN PERFORM tenant_guard.enter(p_tenant_id); END;", ...over },
});
/** A compliant human entry point row. */
const human = (fn: string, over: Record<string, unknown> = {}) =>
  command(fn, {
    authenticated: true,
    service_role: false,
    body: HUMAN_BODY,
    ...over,
  });
/** A compliant platform command row. */
const platformCommand = (fn: string, over: Record<string, unknown> = {}) =>
  command(fn, {
    owner: "postgres",
    authenticated: true,
    service_role: false,
    body: PLATFORM_BODY,
    ...over,
  });
/** A function outside the command schemas whose body calls into them; compliant service-key wrapper by default. */
const wrapper = (
  fn: string,
  body: string,
  over: Record<string, unknown> = {},
) => ({
  ...{ function: fn, schema: fn.split(".")[0], definer: false },
  ...{ search_path: '""', body, authenticated: false, anon: false },
  ...{ public_execute: false, service_role: false, ...over },
});
/** A table or column grant row as the catalog query reports one that no policy admits. */
const grant = (
  relation: string,
  grantee: string,
  privilege: string,
  over: { kind?: string; column?: string | null } = {},
) => ({ relation, column: null, kind: "r", grantee, privilege, ...over });
const listed = (...tables: string[]) => ({
  entries: tables.map((t) => ({ table: t, outcome: "deny_by_default" })),
});
const allow = (...fns: string[]) => ({
  entries: fns.map((f) => ({
    function: f,
    reason: "fixture",
    reviewed_by: "x",
  })),
});

describe("WP4 command boundaries", () => {
  it("pins the complete pre-membership list and its independent review", () => {
    expect(preMembershipEntries.map((entry) => entry.function)).toEqual([
      "tenant_guard.accept_membership_invitation(p_selector text, p_verifier text)",
      "tenant_guard.start_account_claim(p_tenant_id uuid)",
      "tenant_guard.redeem_account_claim(p_tenant_id uuid, p_token text)",
    ]);
    expect(
      Object.fromEntries(
        Object.entries(reviewedPreMembership).map(([name, pin]) => [
          name,
          pin.digest,
        ]),
      ),
    ).toEqual({
      "tenant_guard.accept_membership_invitation(p_selector text, p_verifier text)":
        "8e1cd0bb1438913861f3dfda3f72866e20c6ccbe0abb1513e489e41cf9f9cbb2",
      "tenant_guard.start_account_claim(p_tenant_id uuid)":
        "bca3eaeb1cf4059144d502daf37a9050eee2918085fd8494438651d7b064544c",
      "tenant_guard.redeem_account_claim(p_tenant_id uuid, p_token text)":
        "2301f4352670a831c860d15f197bfef5faffcab71dc61af8395ac9e3d37c0bed",
    });
    expect(
      reviewedPreMembership[
        "tenant_guard.accept_membership_invitation(p_selector text, p_verifier text)"
      ]?.reason,
    ).toBe(
      "AL-2676 WP3c R1/R14/R15: invitation acceptance admits a non-operator caller who holds no membership yet after refusing platform operators and issuer self-acceptance and verifying selector, constant-time verifier digest, live status, expiry, and confirmed non-deleted email via private.resolve_invitation_for_caller before tenant_guard.enter or any lock",
    );
    for (const entry of preMembershipEntries)
      expect(reviewedPreMembership[entry.function]?.reason).toBe(entry.reason);
  });
  it("fails the gate when an unreviewed pre-membership entry is planted", () => {
    const plantedName = "tenant_guard.unreviewed_pre_member(p_token text)";
    const plantedRow = human(plantedName, {
      body: "BEGIN PERFORM tenant_guard.enter(p_tenant_id); RETURN NULL; END;",
    });
    const plantedEntry = {
      function: plantedName,
      reason: "planted unreviewed entry",
    };
    const res = preMembershipExceptions(
      [plantedRow],
      [...preMembershipEntries, plantedEntry],
      reviewedPreMembership,
    );
    expect(res.allowed.has(plantedName)).toBe(false);
    expect(
      res.failures.some(
        (f) =>
          f.code === "COMMAND_EXCEPTION_UNREVIEWED" &&
          f.function === plantedName,
      ),
    ).toBe(true);
    expect(
      codes(
        evaluateTenantRlsCatalog(
          {
            tables: [],
            definers: [],
            commands: [plantedRow],
            wrappers: [],
            grants: [],
            policies: [],
            published: [],
          },
          listed(),
          allow(),
          { entries: [] },
          undefined,
          undefined,
          [],
        ),
      ),
    ).toContain(`COMMAND_HUMAN_NO_PREAMBLE ${plantedName}`);
  });
  it("uses exactly the capability registry's sorted keys", () =>
    expect(keys).toEqual(Object.keys(CAPABILITY_REGISTRY).sort()));
  it("admits only reviewed exceptions with matching names, reasons, bodies and lane", () => {
    const name = "tenant_guard.example(p_tenant_id uuid)";
    const row = human(name);
    const entry = { function: name, reason: "fixture: no prior membership" };
    const reviewed = {
      [name]: {
        reason: entry.reason,
        digest: createHash("sha256").update(HUMAN_BODY.trim()).digest("hex"),
      },
    };
    expect(preMembershipExceptions([row], [entry]).allowed.size).toBe(0);
    expect(
      preMembershipExceptions([row], [entry], reviewed).allowed.has(name),
    ).toBe(true);
    for (const invalid of [
      preMembershipExceptions([], [entry], reviewed),
      preMembershipExceptions(
        [row],
        [{ ...entry, reason: "different" }],
        reviewed,
      ),
      preMembershipExceptions(
        [{ ...row, body: "BEGIN RETURN; END;" }],
        [entry],
        reviewed,
      ),
      preMembershipExceptions(
        [{ ...row, service_role: true }],
        [entry],
        reviewed,
      ),
      preMembershipExceptions([row], [entry, entry], reviewed),
    ])
      expect(invalid.failures).toHaveLength(1);
  });
  it("does not exempt a changed assignment reader by name alone", () => {
    const name = "tenant_guard.resolve_command_assignment(p_tenant_id uuid)";
    expect(
      codes(
        evaluate(
          [],
          listed(),
          [],
          [
            human(name, {
              body: "BEGIN PERFORM tenant_guard.begin_human_command(p_tenant_id); RETURN; END;",
            }),
          ],
        ),
      ),
    ).toContain(`COMMAND_CAPABILITY ${name}`);
  });
  it.each([
    "p_tenant_id",
    "p_tenant_id, 'missing.key'",
    "p_tenant_id, p_capability",
  ])("requires a registered literal before a membership write (%s)", (args) => {
    const body = `BEGIN PERFORM tenant_guard.begin_human_command(${args}); UPDATE authz.memberships SET updated_at=now() WHERE false; END;`;
    expect(
      codes(
        evaluate(
          [],
          listed(),
          [],
          [human("tenant_guard.edit(uuid)", { body })],
        ),
      ),
    ).toContain("COMMAND_CAPABILITY tenant_guard.edit(uuid)");
  });
  it.each([
    { owner: "postgres" },
    { definer: false },
    { body: "BEGIN RETURN; END;" },
    {
      body: "DECLARE v uuid := private.load(); BEGIN PERFORM tenant_guard.enter(p_tenant_id); END;",
    },
  ])("rejects a service-callable helper without protected entry %j", (over) => {
    expect(
      codes(
        evaluate(
          [],
          listed(),
          [],
          [command("tenant_guard.helper(uuid)", over)],
        ),
      ),
    ).toContain("COMMAND_HELPER_EXPOSED tenant_guard.helper(uuid)");
  });
  it("rejects service EXECUTE on a wrapper of human commands alone", () => {
    expect(
      codes(
        evaluate(
          [],
          listed(),
          [],
          [human("tenant_guard.edit(uuid)")],
          allow(),
          {
            wrappers: [
              wrapper("public.edit(uuid)", "SELECT tenant_guard.edit(p)", {
                service_role: true,
              }),
            ],
          },
        ),
      ),
    ).toContain("WRAPPER_GRANTS_HUMAN public.edit(uuid)");
  });
  // Fix check G5: every signed-in command is a human target, a platform
  // command as much as a tenant_guard one, alone or beside a worker.
  it.each([
    ["alone", "SELECT platform.block(p)"],
    [
      "beside a worker",
      "SELECT platform.block(p); SELECT tenant_guard.work(p)",
    ],
  ])(
    "rejects service EXECUTE on a wrapper of a signed-in platform command %s",
    (_name, body) => {
      expect(
        codes(
          evaluate(
            [],
            listed(),
            [],
            [
              platformCommand("platform.block(uuid)"),
              command("tenant_guard.work(uuid)"),
            ],
            allow(),
            {
              wrappers: [
                wrapper("public.block(uuid)", body, { service_role: true }),
              ],
            },
          ),
        ),
      ).toContain("WRAPPER_GRANTS_HUMAN public.block(uuid)");
    },
  );
  it("judges the repository's reviewed pre-membership list unless told otherwise (D-18, AL-2678: the list is no longer empty, so the synthetic catalogs of this file judge an empty one, and this case judges the real one; AL-2680 fix round C3: with the own-ministry lane's two pinned helpers)", () => {
    const empty = {
      tables: [],
      definers: [],
      wrappers: [],
      grants: [],
      policies: [],
      published: [],
    };
    expect(
      codes(
        evaluateTenantRlsCatalog(
          { ...empty, commands: [] },
          listed(),
          undefined,
          undefined,
          undefined,
          undefined,
          [],
        ),
      ).sort(),
    ).toEqual(
      [
        ...preMembershipEntries.map((entry) => entry.function),
        ...ownMinistryEntries.map((entry) => entry.function),
        ...OWN_MINISTRY_HELPERS,
      ]
        .map((fn) => `COMMAND_EXCEPTION_UNREVIEWED ${fn}`)
        .sort(),
    );
    expect(
      evaluateTenantRlsCatalog(
        {
          ...empty,
          commands: [
            ...preMembershipCommandRows(),
            ...ownMinistryCommandRows(),
            ...ownMinistryHelperRows(),
          ],
        },
        listed(),
        undefined,
        undefined,
        undefined,
        undefined,
        [],
      ).failures,
    ).toEqual([]);
    expect(codes(evaluate([]))).toEqual([]);
  });
});
const evaluate = (
  tables: object[],
  exceptions: unknown = listed(),
  definers: object[] = [],
  commands: object[] = [],
  anonAllowlist: unknown = allow(),
  more: {
    wrappers?: object[];
    grants?: object[];
    policies?: object[];
    tenant_helpers?: object[];
    published?: string[];
    policyExceptions?: unknown;
    serviceRole?: object[];
    serviceRoleSchemas?: string[];
    serviceRoleExceptions?: unknown;
    ownMinistry?: unknown;
  } = {},
) =>
  evaluateTenantRlsCatalog(
    {
      tables,
      definers,
      commands,
      wrappers: more.wrappers ?? [],
      grants: more.grants ?? [],
      policies: more.policies ?? [],
      tenant_helpers: more.tenant_helpers,
      published: more.published ?? [],
      service_role_grants: more.serviceRole ?? [],
      service_role_schemas: more.serviceRoleSchemas ?? [],
    },
    exceptions,
    anonAllowlist,
    more.policyExceptions ?? { entries: [] },
    [],
    more.serviceRoleExceptions ?? { entries: [] },
    [],
    more.ownMinistry ?? { entries: [], reviewed: {} },
  );
const codes = (result: ReturnType<typeof evaluate>) =>
  result.failures.map(
    (f: { code: string; table?: string; function?: string }) =>
      `${f.code} ${f.table ?? f.function ?? "-"}`,
  );

describe("evaluateTenantRlsCatalog", () => {
  it("passes a forced table with a policy and a listed zero-policy table, and counts them", () => {
    const plain = { tenant: false, rls: false, force: false, policies: 0 };
    const result = evaluate(
      [
        table("donors"),
        table("audit_backup", { policies: 0 }),
        table("plain", { ...plain, owner_bypass: false }),
      ],
      listed("audit_backup"),
      [definer("public.f()")],
      [human("tenant_guard.cmd(uuid)"), command("tenant_guard.work(uuid)")],
      allow(),
      {
        wrappers: [
          wrapper("public.cmd(uuid)", "SELECT tenant_guard.cmd(p_tenant_id);", {
            authenticated: true,
          }),
          wrapper("public.work(uuid)", "SELECT tenant_guard.work(p);"),
          // Mentions the schema but calls nothing in it: not counted as a
          // wrapper. Amended by council round 3 (lens 1 I2 (b); record D-18):
          // it was a definer with no search path, which passed because no
          // call parsed. A function that names a command schema is now held
          // to the wrapper rules whether or not a call parses, so this one is
          // an invoker with a fixed search path; the definer is failed in
          // "council round 3 (lens 1 I2)" below.
          wrapper("public.reads()", "SELECT kind FROM platform.environment;"),
        ],
      },
    );
    expect(result.failures).toEqual([]);
    // AL-2675 (WP2b, second release; record D-18): the counts gain the
    // signed-in policies of tenant tables and their reviewed exceptions, and
    // the summary line says what the new rules hold. Every count asserted
    // before is still asserted, with the same value.
    expect(result.counts).toEqual({
      ...{ tenant: 2, withPolicy: 1, listed: 1, stale: 0, definers: 1 },
      ...{ anonAllowed: 0, humanEntryPoints: 1, platformCommands: 0 },
      ...{ wrappers: 2, tenantPolicies: 0, policyExceptions: 0 },
    });
    expect(formatTenantRlsCatalogSummary(result)).toBe(
      "PASS: tenant RLS catalog gate: 2 tenant tables enabled and forced (1 with policies, 1 listed deny-by-default, 0 stale), 1 SECURITY DEFINER functions with RLS-bypassing owners, a fixed search path and no PUBLIC EXECUTE (0 anon-allowlisted); command lanes: 1 human entry points, 0 platform commands, 2 wrappers; no table grant in public outside a policy; 0 signed-in policies of tenant tables carry the request's tenant with each lookup once a statement (0 reviewed exceptions), none reads the token claim, no signed-in write policy stands without the grant for its command, and no tenant table is published.",
    );
  });

  it("names a forced zero-policy tenant table whose entry is removed from the real exceptions file (D-18: AL-2671 ruling-pin-tax Q2: the unlisted check replaces the list's floor)", () => {
    const real = JSON.parse(
      readFileSync("docs/security/rls-deny-by-default-exceptions.json", "utf8"),
    ) as { entries: { table: string }[] };
    const removed = real.entries[0]!.table;
    const result = evaluate(
      real.entries.map((entry) => table(entry.table, { policies: 0 })),
      { ...real, entries: real.entries.slice(1) },
    );
    expect(codes(result)).toContain(`NO_POLICY_UNLISTED ${removed}`);
  });

  it("reports every violated rule of one table with its own code", () => {
    const bad = { rls: false, force: false, policies: 0, owner: "app" };
    const result = evaluate([table("t", { ...bad, owner_bypass: false })]);
    expect(result.ok).toBe(false);
    expect(codes(result)).toEqual([
      "RLS_DISABLED t",
      "FORCE_MISSING t",
      "NO_POLICY_UNLISTED t",
      "OWNER_NO_BYPASS t",
    ]);
  });

  it("flags each kind of stale exception and counts them", () => {
    const result = evaluate(
      [table("has_policy"), table("not_tenant", { tenant: false })],
      listed("has_policy", "not_tenant", "dropped"),
    );
    expect(codes(result)).toEqual([
      "STALE_HAS_POLICY has_policy",
      "STALE_NOT_TENANT not_tenant",
      "STALE_MISSING_TABLE dropped",
    ]);
    expect(result.counts.stale).toBe(3);
  });

  it("exempts tenant_guard-owned definers in the tenant_guard schema only, and no other non-bypass owner", () => {
    const result = evaluate([], listed(), [
      definer("tenant_guard.owned()", "tenant_guard", false),
      definer("authz.f(uuid)", "app", false),
      definer("private.g()"),
      // AL-2674 council round 1 (A1): the exemption is bound to the schema.
      definer("public.guard_owned(uuid)", "tenant_guard", false),
    ]);
    expect(codes(result)).toEqual([
      "DEFINER_OWNER_NO_BYPASS authz.f(uuid)",
      "DEFINER_OWNER_NO_BYPASS public.guard_owned(uuid)",
    ]);
  });

  it.each<[string, unknown, string[]]>([
    ["an unreadable list", new Error("ENOENT"), ["EXCEPTIONS_MALFORMED -"]],
    ["a list without entries", {}, ["EXCEPTIONS_MALFORMED -"]],
    [
      "an entry without table",
      { entries: [{ outcome: "x" }] },
      ["EXCEPTIONS_MALFORMED -", "NO_POLICY_UNLISTED t"],
    ],
    [
      "a duplicate table",
      { entries: [{ table: "t" }, { table: "t" }] },
      ["EXCEPTIONS_MALFORMED t"],
    ],
  ])(
    "fails on %s, never guessing what is listed",
    (_, exceptions, expected) => {
      const result = evaluate([table("t", { policies: 0 })], exceptions);
      expect(codes(result)).toEqual(expected);
    },
  );
});

describe("evaluateTenantRlsCatalog: SECURITY DEFINER hygiene (AL-2674, plan 5.4)", () => {
  it("fails a definer with no fixed search path, in any app schema, the guard's included", () => {
    const result = evaluate([], listed(), [
      definer("public.a()", "postgres", true, { search_path: null }),
      definer("tenant_guard.b()", "tenant_guard", false, { search_path: null }),
      definer("platform.c()", "postgres", true, { search_path: null }),
    ]);
    expect(codes(result)).toEqual([
      "DEFINER_SEARCH_PATH_UNSET public.a()",
      "DEFINER_SEARCH_PATH_UNSET tenant_guard.b()",
      "DEFINER_SEARCH_PATH_UNSET platform.c()",
    ]);
  });

  it("requires the empty search path in tenant_guard and platform, and a path without $user elsewhere (A3)", () => {
    const at = (fn: string, path: string, owner = "postgres") =>
      definer(fn, owner, owner === "postgres", { search_path: path });
    const result = evaluate([], listed(), [
      at("tenant_guard.a()", '""', "tenant_guard"),
      at("tenant_guard.b()", "public", "tenant_guard"),
      at("platform.c()", '""'),
      at("platform.d()", "public, pg_temp"),
      at("public.e()", "public, pg_temp"),
      at("public.f()", "public"),
      at("authz.g()", "authz"),
      at("private.h()", "public, private"),
      at("public.i()", '"$user", public'),
      at("private.j()", 'public, "$user"'),
    ]);
    expect(codes(result)).toEqual([
      "DEFINER_SEARCH_PATH_UNSAFE tenant_guard.b()",
      "DEFINER_SEARCH_PATH_UNSAFE platform.d()",
      "DEFINER_SEARCH_PATH_UNSAFE public.i()",
      "DEFINER_SEARCH_PATH_UNSAFE private.j()",
    ]);
  });

  it("fails a definer that PUBLIC may execute, and anon with it", () => {
    const result = evaluate([], listed(), [
      definer("public.handle_new_user()", "postgres", true, {
        public_execute: true,
        anon_execute: true,
      }),
    ]);
    expect(codes(result)).toEqual([
      "DEFINER_PUBLIC_EXECUTE public.handle_new_user()",
      "DEFINER_ANON_EXECUTE public.handle_new_user()",
    ]);
  });

  it("fails a definer granted to anon by name unless it is allowlisted", () => {
    const granted = definer("public.read_x(uuid)", "postgres", true, {
      anon_execute: true,
      volatility: "s",
    });
    expect(codes(evaluate([], listed(), [granted]))).toEqual([
      "DEFINER_ANON_EXECUTE public.read_x(uuid)",
    ]);
    const result = evaluate(
      [],
      listed(),
      [granted],
      [],
      allow("public.read_x(uuid)"),
    );
    expect(result.failures).toEqual([]);
    expect(result.counts.anonAllowed).toBe(1);
  });

  it("fails an allowlisted function that is volatile or has a non-empty search path", () => {
    const result = evaluate(
      [],
      listed(),
      [
        definer("public.writes()", "postgres", true, { anon_execute: true }),
        definer("public.loose()", "postgres", true, {
          anon_execute: true,
          volatility: "s",
          search_path: "public",
        }),
      ],
      [],
      allow("public.writes()", "public.loose()"),
    );
    expect(codes(result)).toEqual([
      "ANON_ALLOWLISTED_UNSAFE public.writes()",
      "ANON_ALLOWLISTED_UNSAFE public.loose()",
    ]);
  });

  it("fails an allowlist entry whose function is gone or is not a definer", () => {
    const result = evaluate([], listed(), [], [], allow("public.dropped()"));
    expect(codes(result)).toEqual(["ANON_ALLOWLIST_STALE public.dropped()"]);
  });

  it.each<[string, unknown, string[]]>([
    ["an unreadable list", new Error("ENOENT"), ["ANON_ALLOWLIST_MALFORMED -"]],
    ["a list without entries", {}, ["ANON_ALLOWLIST_MALFORMED -"]],
    [
      "an entry without function",
      { entries: [{ reason: "r" }] },
      ["ANON_ALLOWLIST_MALFORMED -"],
    ],
    [
      "an entry without reason",
      { entries: [{ function: "public.f()" }] },
      ["ANON_ALLOWLIST_MALFORMED public.f()"],
    ],
    [
      "a duplicate function",
      {
        entries: [
          { function: "public.f()", reason: "r" },
          { function: "public.f()", reason: "r" },
        ],
      },
      ["ANON_ALLOWLIST_MALFORMED public.f()"],
    ],
  ])("fails on an anon allowlist with %s", (_, list, expected) => {
    const ok = definer("public.f()", "postgres", true, {
      volatility: "s",
      anon_execute: false,
    });
    expect(codes(evaluate([], listed(), [ok], [], list))).toEqual(expected);
  });
});

describe("evaluateTenantRlsCatalog: command lanes (AL-2674, plan 5.4)", () => {
  it("fails a tenant_guard function that both lanes may execute", () => {
    const result = evaluate(
      [],
      listed(),
      [],
      [human("tenant_guard.both(uuid)", { service_role: true })],
    );
    expect(codes(result)).toEqual([
      "COMMAND_LANE_MIXED tenant_guard.both(uuid)",
    ]);
  });

  it("fails a tenant_guard function signed-in users may execute without the human preamble", () => {
    const result = evaluate(
      [],
      listed(),
      [],
      [
        human("tenant_guard.no_preamble(uuid)", {
          body: "BEGIN RETURN NULL; END;",
        }),
        human("tenant_guard.enter(uuid)", {
          definer: false,
          owner: "postgres",
          body: "BEGIN PERFORM pg_catalog.set_config('x', '', true); END;",
        }),
        human("tenant_guard.wrong_owner(uuid)", { owner: "postgres" }),
        human("tenant_guard.ok(uuid)"),
        human("tenant_guard.perform(uuid)", {
          body: "BEGIN\n  PERFORM tenant_guard.begin_human_command(p_tenant_id, 'people.manage_members');\n  RETURN 1;\nEND;",
        }),
      ],
    );
    expect(codes(result)).toEqual([
      "COMMAND_HUMAN_NO_PREAMBLE tenant_guard.no_preamble(uuid)",
      "COMMAND_HUMAN_NO_PREAMBLE tenant_guard.enter(uuid)",
      "COMMAND_HUMAN_NO_PREAMBLE tenant_guard.wrong_owner(uuid)",
    ]);
    expect(result.counts.humanEntryPoints).toBe(5);
  });

  it("fails a platform function signed-in users may execute without the shared operator check", () => {
    const result = evaluate(
      [],
      listed(),
      [],
      [
        platformCommand("platform.unchecked(uuid)", {
          body: "BEGIN RETURN NULL; END;",
        }),
        platformCommand("platform.invoker(uuid)", { definer: false }),
        platformCommand("platform.provision(text)"),
        command("platform.health()", { owner: "postgres", definer: true }),
      ],
    );
    expect(codes(result)).toEqual([
      "PLATFORM_COMMAND_NO_OPERATOR_CHECK platform.unchecked(uuid)",
      "PLATFORM_COMMAND_NO_OPERATOR_CHECK platform.invoker(uuid)",
    ]);
    expect(result.counts.platformCommands).toBe(3);
  });

  it("fails any command-schema function PUBLIC or anon may execute, definer or not", () => {
    const result = evaluate(
      [],
      listed(),
      [],
      [
        command("tenant_guard.helper()", {
          definer: false,
          owner: "postgres",
          service_role: false,
          public_execute: true,
          anon: true,
          body: HUMAN_BODY,
        }),
        command("platform.read()", {
          owner: "postgres",
          service_role: false,
          anon: true,
        }),
      ],
    );
    expect(codes(result)).toEqual([
      "COMMAND_PUBLIC_EXECUTE tenant_guard.helper()",
      "COMMAND_PUBLIC_EXECUTE platform.read()",
    ]);
  });
});

describe("evaluateTenantRlsCatalog: the guard owner and the platform owner (AL-2674 council round 1, A1)", () => {
  it("fails a function owned by tenant_guard outside the tenant_guard schema, definer or invoker, in any schema", () => {
    const result = evaluate(
      [],
      listed(),
      [definer("public.act_as_guard(uuid)", "tenant_guard", false)],
      [
        // The council's case: a definer in public, owned by the guard, with a
        // fixed path, EXECUTE for authenticated and a body that enters a tenant.
        human("public.act_as_guard(uuid)", {
          body: "BEGIN PERFORM tenant_guard.enter(p_tenant_id); END;",
        }),
        command("private.helper()", { definer: false, service_role: false }),
        command("cms.elsewhere()", { authenticated: false }),
        human("tenant_guard.ok(uuid)"),
      ],
    );
    expect(codes(result)).toEqual([
      "DEFINER_OWNER_NO_BYPASS public.act_as_guard(uuid)",
      "GUARD_OWNED_OUTSIDE_SCHEMA public.act_as_guard(uuid)",
      "GUARD_OWNED_OUTSIDE_SCHEMA private.helper()",
      "GUARD_OWNED_OUTSIDE_SCHEMA cms.elsewhere()",
    ]);
    // A guard-owned function outside the schema is not counted as an entry point.
    expect(result.counts.humanEntryPoints).toBe(1);
  });

  it("fails a platform definer that postgres does not own, even one owned by a bypass role (plan 7.2)", () => {
    const result = evaluate([], listed(), [
      definer("platform.ok()", "postgres", true),
      definer("platform.guard()", "tenant_guard", false),
      definer("platform.admin()", "supabase_admin", true),
      definer("platform.app()", "app", false),
      // Outside platform, any owner that bypasses RLS may own a definer.
      definer("public.other()", "supabase_admin", true),
    ]);
    expect(codes(result)).toEqual([
      "DEFINER_OWNER_NO_BYPASS platform.guard()",
      "PLATFORM_DEFINER_OWNER platform.guard()",
      "PLATFORM_DEFINER_OWNER platform.admin()",
      "DEFINER_OWNER_NO_BYPASS platform.app()",
      "PLATFORM_DEFINER_OWNER platform.app()",
    ]);
  });
});

describe("evaluateTenantRlsCatalog: wrappers of the command lanes (AL-2674 council round 1, A2)", () => {
  const lanes = [
    human("tenant_guard.resolve(uuid)"),
    command("tenant_guard.acquire_claim(uuid)"),
    platformCommand("platform.provision(text)"),
    command("platform.health()", { owner: "postgres" }),
  ];
  const judge = (wrappers: object[]) =>
    evaluate([], listed(), [], lanes, allow(), { wrappers });

  it("passes invoker wrappers with a fixed path, granted to the lane their target belongs to", () => {
    const result = judge([
      wrapper("public.resolve(uuid)", "SELECT tenant_guard.resolve(p);", {
        authenticated: true,
      }),
      wrapper(
        "public.acquire_claim(uuid)",
        "SELECT tenant_guard.acquire_claim(p);",
      ),
      wrapper("public.provision(text)", "SELECT platform.provision(p);", {
        authenticated: true,
        search_path: "public",
      }),
      wrapper("public.platform_health()", "SELECT platform.health();"),
    ]);
    expect(result.failures).toEqual([]);
    expect(result.counts.wrappers).toBe(4);
  });

  it("fails the council's case: a postgres-owned definer wrapper that hands a worker entry point to signed-in users", () => {
    const result = judge([
      wrapper(
        "public.claim_for_anyone(uuid)",
        "SELECT tenant_guard.acquire_claim(p);",
        { definer: true, authenticated: true },
      ),
    ]);
    expect(codes(result)).toEqual([
      "WRAPPER_DEFINER public.claim_for_anyone(uuid)",
      "WRAPPER_GRANTS_WORKER public.claim_for_anyone(uuid)",
    ]);
  });

  it("fails a wrapper with no fixed path or one naming $user, and one PUBLIC or anon may execute", () => {
    const result = judge([
      wrapper("public.a(uuid)", "SELECT tenant_guard.resolve(p);", {
        search_path: null,
      }),
      wrapper("public.b(uuid)", "SELECT tenant_guard.resolve(p);", {
        search_path: '"$user", public',
      }),
      wrapper("public.c(uuid)", "SELECT tenant_guard.resolve(p);", {
        public_execute: true,
      }),
      wrapper("public.d()", "SELECT platform.health();", { anon: true }),
    ]);
    expect(codes(result)).toEqual([
      "WRAPPER_SEARCH_PATH public.a(uuid)",
      "WRAPPER_SEARCH_PATH public.b(uuid)",
      "WRAPPER_PUBLIC_EXECUTE public.c(uuid)",
      "WRAPPER_PUBLIC_EXECUTE public.d()",
    ]);
  });

  it("lets signed-in users execute a wrapper only when every target is a human entry point or a platform command", () => {
    const result = judge([
      wrapper("public.health_for_all()", "SELECT platform.health();", {
        authenticated: true,
      }),
      wrapper(
        "public.enter_any(uuid)",
        "BEGIN PERFORM tenant_guard.enter(p); END;",
        { authenticated: true },
      ),
      wrapper(
        "public.two(uuid)",
        'SELECT tenant_guard.resolve(p), "tenant_guard"."acquire_claim"(p);',
        { authenticated: true },
      ),
    ]);
    expect(codes(result)).toEqual([
      "WRAPPER_GRANTS_WORKER public.health_for_all()",
      "WRAPPER_GRANTS_WORKER public.enter_any(uuid)",
      "WRAPPER_GRANTS_WORKER public.two(uuid)",
    ]);
  });

  it("counts a call made through dynamic SQL, and ignores one that appears only in a comment", () => {
    const result = judge([
      wrapper(
        "public.dynamic(uuid)",
        "BEGIN EXECUTE 'SELECT tenant_guard.acquire_claim($1)' USING p; END;",
        { definer: true },
      ),
      wrapper(
        "public.commented()",
        "-- calls tenant_guard.acquire_claim(p) in a later release\n/* platform.health() */ SELECT 1;",
        { definer: true },
      ),
    ]);
    expect(codes(result)).toEqual(["WRAPPER_DEFINER public.dynamic(uuid)"]);
    expect(result.counts.wrappers).toBe(1);
  });
});

describe("evaluateTenantRlsCatalog: the preamble is the real first step (AL-2674 council round 1, A4)", () => {
  const humanWith = (body: string) =>
    evaluate([], listed(), [], [human("tenant_guard.cmd(uuid)", { body })]);
  const platformWith = (body: string) =>
    evaluate(
      [],
      listed(),
      [],
      [platformCommand("platform.cmd(uuid)", { body })],
    );
  const HUMAN_FAIL = ["COMMAND_HUMAN_NO_PREAMBLE tenant_guard.cmd(uuid)"];
  const PLATFORM_FAIL = [
    "PLATFORM_COMMAND_NO_OPERATOR_CHECK platform.cmd(uuid)",
  ];

  it.each<[string, string]>([
    [
      "a preamble whose refusal an EXCEPTION clause swallows",
      "BEGIN PERFORM tenant_guard.begin_human_command(p); EXCEPTION WHEN OTHERS THEN NULL; END;",
    ],
    [
      "the same, with the handler after a nested block and a CASE",
      `BEGIN
         v := tenant_guard.begin_human_command(p);
         BEGIN x := 1; EXCEPTION WHEN unique_violation THEN x := 2; END;
         y := CASE WHEN x = 1 THEN 'a' ELSE 'b' END;
         IF x = 1 THEN y := 'c'; END IF;
       EXCEPTION WHEN insufficient_privilege THEN RETURN NULL;
       END;`,
    ],
    [
      "a preamble that appears only in a comment",
      "BEGIN\n  -- v := tenant_guard.begin_human_command(p);\n  RETURN NULL;\nEND;",
    ],
    [
      "a preamble inside a block comment",
      "BEGIN /* PERFORM tenant_guard.begin_human_command(p); */ RETURN NULL; END;",
    ],
    [
      "a preamble that is not the first statement",
      "BEGIN PERFORM public.write_something(); PERFORM tenant_guard.begin_human_command(p); END;",
    ],
    [
      "a preamble inside a string",
      "BEGIN PERFORM 'tenant_guard.begin_human_command(p)'; END;",
    ],
    [
      "an EXCEPTION clause hidden from a naive comment strip by a string",
      "BEGIN PERFORM tenant_guard.begin_human_command(p); x := '/*'; EXCEPTION WHEN OTHERS THEN NULL; x := '*/'; END;",
    ],
  ])("fails a human entry point with %s", (_name, body) => {
    expect(codes(humanWith(body))).toEqual(HUMAN_FAIL);
  });

  it("fails a human entry point or a platform command written in SQL, not PL/pgSQL", () => {
    const result = evaluate(
      [],
      listed(),
      [],
      [
        human("tenant_guard.cmd(uuid)", {
          language: "sql",
          body: "SELECT tenant_guard.begin_human_command(p)",
        }),
        platformCommand("platform.cmd(uuid)", {
          language: "sql",
          body: "SELECT platform.require_operator()",
        }),
      ],
    );
    expect(codes(result)).toEqual([...HUMAN_FAIL, ...PLATFORM_FAIL]);
  });

  it.each<[string, string]>([
    ["the convention's form", HUMAN_BODY],
    [
      "PERFORM, comments and a nested handler that does not enclose the preamble",
      `-- resolve the assignment first
       DECLARE v_x int; /* a note */
       BEGIN
         PERFORM tenant_guard.begin_human_command(p_tenant_id, 'people.manage_members'); -- refuses
         BEGIN
           INSERT INTO public.t VALUES (1);
         EXCEPTION WHEN unique_violation THEN
           RAISE EXCEPTION 'tenant_guard: duplicate';
         END;
         v_x := CASE WHEN true THEN 1 END;
         FOR i IN 1..2 LOOP v_x := v_x + 1; END LOOP;
         RETURN v_x;
       END;`,
    ],
    [
      "a label, quoted words and a string that holds comment markers",
      `<<outer>>
       DECLARE v_note text;
       BEGIN
         v := tenant_guard.begin_human_command(p, 'people.manage_members');
         v_note := 'it''s -- not a comment';
         RAISE NOTICE E'\\' EXCEPTION WHEN OTHERS';
         RETURN $q$ EXCEPTION WHEN OTHERS THEN $q$;
       END outer;`,
    ],
  ])("passes a human entry point with %s", (_name, body) => {
    expect(humanWith(body).failures).toEqual([]);
  });

  it.each<[string, string]>([
    [
      "an operator check whose refusal an EXCEPTION clause swallows",
      "BEGIN PERFORM platform.require_operator(); EXCEPTION WHEN OTHERS THEN NULL; END;",
    ],
    [
      "an operator check in the body instead of the DECLARE section",
      "DECLARE v uuid; BEGIN v := platform.require_operator(); RETURN v; END;",
    ],
    [
      "an operator check that appears only in a comment",
      "DECLARE v uuid; -- := platform.require_operator();\nBEGIN RETURN v; END;",
    ],
    [
      "an operator check wrapped in another call",
      "DECLARE v uuid := coalesce(platform.require_operator(), NULL); BEGIN RETURN v; END;",
    ],
    [
      "an operator check in a nested block's DECLARE",
      "BEGIN DECLARE v uuid := platform.require_operator(); BEGIN NULL; END; EXCEPTION WHEN OTHERS THEN NULL; END;",
    ],
  ])("fails a platform command with %s", (_name, body) => {
    expect(codes(platformWith(body))).toEqual(PLATFORM_FAIL);
  });

  it.each<[string, string]>([
    ["the convention's form", PLATFORM_BODY],
    [
      "DEFAULT, more declarations and a handler (a declaration's error is outside its block's handler)",
      `DECLARE
         v_reason text := p_reason;
         v_operator uuid DEFAULT platform.require_operator();
       BEGIN
         RETURN v_operator;
       EXCEPTION WHEN unique_violation THEN RETURN NULL;
       END;`,
    ],
  ])("passes a platform command with %s", (_name, body) => {
    expect(platformWith(body).failures).toEqual([]);
  });
});

describe("evaluateTenantRlsCatalog: table grants in public (AL-2674 council round 1, A5)", () => {
  it("fails each kind of grant the default-privileges migration closed, naming the relation", () => {
    const result = evaluate([], listed(), [], [], allow(), {
      grants: [
        grant("donors", "PUBLIC", "SELECT"),
        grant("donors", "anon", "TRUNCATE"),
        grant("donor_view", "authenticated", "REFERENCES"),
        grant("funds", "authenticated", "TRIGGER"),
        grant("funds", "anon", "MAINTAIN"),
        grant("donations", "anon", "SELECT"),
        grant("donations", "authenticated", "DELETE"),
      ],
    });
    expect(codes(result)).toEqual([
      "GRANT_TO_PUBLIC donors",
      "GRANT_UNSAFE_PRIVILEGE donors",
      "GRANT_UNSAFE_PRIVILEGE donor_view",
      "GRANT_UNSAFE_PRIVILEGE funds",
      "GRANT_UNSAFE_PRIVILEGE funds",
      "GRANT_WITHOUT_POLICY donations",
      "GRANT_WITHOUT_POLICY donations",
    ]);
    expect(result.failures[5]).toMatchObject({
      detail: expect.stringContaining("anon holds SELECT"),
    });
  });
});

describe("evaluateTenantRlsCatalog: service_role's table privileges and schema CREATE (issue 2841, amending D-111)", () => {
  const holding = (
    relation: string,
    privilege: string,
    over: { kind?: string; column?: string | null } = {},
  ) => ({ relation, column: null, kind: "r", privilege, ...over });
  const reviewed = (entry: Record<string, unknown>) => ({
    reason: "fixture",
    reviewed_by: "x",
    ...entry,
  });

  it("fails each of TRUNCATE, REFERENCES, TRIGGER and MAINTAIN that service_role holds on a relation in public or on a column of one, and CREATE on a schema of the chain, naming each", () => {
    const result = evaluate([], listed(), [], [], allow(), {
      serviceRole: [
        holding("staged_gifts", "TRUNCATE"),
        holding("staged_gift_allocations", "TRIGGER"),
        holding("donations", "REFERENCES", { column: "amount" }),
        holding("donor_view", "MAINTAIN", { kind: "v" }),
      ],
      serviceRoleSchemas: ["authz"],
    });
    expect(codes(result)).toEqual([
      "SERVICE_ROLE_UNSAFE_PRIVILEGE staged_gifts",
      "SERVICE_ROLE_UNSAFE_PRIVILEGE staged_gift_allocations",
      "SERVICE_ROLE_UNSAFE_PRIVILEGE donations",
      "SERVICE_ROLE_UNSAFE_PRIVILEGE donor_view",
      "SERVICE_ROLE_SCHEMA_CREATE authz",
    ]);
    expect(result.failures[0]).toMatchObject({
      detail: expect.stringContaining("service_role holds TRUNCATE:"),
    });
    expect(result.failures[2]).toMatchObject({
      detail: expect.stringContaining(
        "service_role holds REFERENCES on column amount",
      ),
    });
    expect(result.failures[4]).toMatchObject({
      detail: expect.stringContaining("service_role holds CREATE on schema"),
    });
    expect(result.ok).toBe(false);
  });

  it("passes a holding a reviewed exception names, and fails an exception that is stale, has no reason or reviewer, or names another privilege", () => {
    const result = evaluate([], listed(), [], [], allow(), {
      serviceRole: [
        holding("donations", "TRIGGER"),
        holding("funds", "REFERENCES", { column: "name" }),
      ],
      serviceRoleSchemas: ["authz"],
      serviceRoleExceptions: {
        entries: [
          reviewed({ relation: "donations", privilege: "TRIGGER" }),
          reviewed({
            relation: "funds",
            column: "name",
            privilege: "REFERENCES",
          }),
          reviewed({ schema: "authz", privilege: "CREATE" }),
          reviewed({ relation: "tenants", privilege: "TRUNCATE" }),
          { relation: "profiles", privilege: "TRIGGER", reviewed_by: "x" },
          { schema: "platform", privilege: "CREATE", reason: "fixture" },
          reviewed({ relation: "missionaries", privilege: "SELECT" }),
          reviewed({ schema: "private", privilege: "USAGE" }),
        ],
      },
    });
    expect(codes(result)).toEqual([
      "SERVICE_ROLE_EXCEPTIONS_MALFORMED profiles",
      "SERVICE_ROLE_EXCEPTIONS_MALFORMED platform",
      "SERVICE_ROLE_EXCEPTIONS_MALFORMED missionaries",
      "SERVICE_ROLE_EXCEPTIONS_MALFORMED private",
      "SERVICE_ROLE_EXCEPTION_STALE tenants",
    ]);
  });

  it("fails a malformed exception list, and an exception for one column that a table-wide holding does not match", () => {
    expect(
      codes(
        evaluate([], listed(), [], [], allow(), {
          serviceRoleExceptions: { entries: "none" },
        }),
      ),
    ).toEqual(["SERVICE_ROLE_EXCEPTIONS_MALFORMED -"]);
    expect(
      codes(
        evaluate([], listed(), [], [], allow(), {
          serviceRole: [holding("funds", "REFERENCES")],
          serviceRoleExceptions: {
            entries: [
              reviewed({
                relation: "funds",
                column: "name",
                privilege: "REFERENCES",
              }),
            ],
          },
        }),
      ),
    ).toEqual([
      "SERVICE_ROLE_UNSAFE_PRIVILEGE funds",
      "SERVICE_ROLE_EXCEPTION_STALE funds",
    ]);
  });

  it("reads what service_role holds in public, as Postgres decides it (a grant to it, to PUBLIC or to a role it belongs to), on a table or a column, and its CREATE on every schema the release fingerprint covers", () => {
    expect(TENANT_RLS_CATALOG_SQL).toContain("'service_role_grants'");
    expect(TENANT_RLS_CATALOG_SQL).toContain("'service_role_schemas'");
    expect(TENANT_RLS_CATALOG_SQL).toContain(EXCLUDED_SCHEMA_PATTERN);
  });

  it("R4: fails an exception entry that is null, a number, a string or an array as malformed, and does not throw", () => {
    expect(
      codes(
        evaluate([], listed(), [], [], allow(), {
          serviceRoleExceptions: { entries: [null, 7, "authz", []] },
        }),
      ),
    ).toEqual([
      "SERVICE_ROLE_EXCEPTIONS_MALFORMED -",
      "SERVICE_ROLE_EXCEPTIONS_MALFORMED -",
      "SERVICE_ROLE_EXCEPTIONS_MALFORMED -",
      "SERVICE_ROLE_EXCEPTIONS_MALFORMED -",
    ]);
  });

  it("R2: reads every role service_role can use or SET ROLE to, not only what it inherits, for its table, column and schema privileges", () => {
    expect(TENANT_RLS_CATALOG_SQL).toContain(
      "pg_has_role('service_role', r.oid, 'USAGE') or pg_has_role('service_role', r.oid, 'SET')",
    );
    expect(TENANT_RLS_CATALOG_SQL).toContain(
      "has_table_privilege(r.oid, c.oid, p.privilege)",
    );
    expect(TENANT_RLS_CATALOG_SQL).toContain(
      "has_column_privilege(r.oid, c.oid, att.attnum, 'REFERENCES')",
    );
    expect(TENANT_RLS_CATALOG_SQL).toContain(
      "has_schema_privilege(r.oid, n.oid, 'CREATE')",
    );
  });
});

describe("evaluateTenantRlsCatalog: council round 2 (A3)", () => {
  const lanes = [
    human("tenant_guard.resolve(uuid)"),
    command("tenant_guard.acquire_claim(uuid)"),
  ];
  const judge = (wrappers: object[]) =>
    evaluate([], listed(), [], lanes, allow(), { wrappers });

  it("reads a SQL-standard body as the catalog deparses it: a definer wrapper that hands a worker to signed-in users fails", () => {
    const result = judge([
      wrapper(
        "public.atomic_claim(uuid)",
        "\nBEGIN ATOMIC\n SELECT tenant_guard.acquire_claim(atomic_claim.p);\nEND",
        { definer: true, authenticated: true },
      ),
    ]);
    expect(codes(result)).toEqual([
      "WRAPPER_DEFINER public.atomic_claim(uuid)",
      "WRAPPER_GRANTS_WORKER public.atomic_claim(uuid)",
    ]);
  });

  it.each<[string, string]>([
    ["the guard schema alone", "tenant_guard"],
    ["the platform schema quoted, among others", '"platform", public'],
    ["the guard schema after pg_catalog", "pg_catalog, tenant_guard"],
  ])(
    "fails a function outside the command schemas whose search path names %s, whatever its body",
    (_name, searchPath) => {
      const result = judge([
        wrapper("public.unqualified(uuid)", "SELECT acquire_claim(p);", {
          definer: true,
          authenticated: true,
          search_path: searchPath,
        }),
      ]);
      expect(codes(result)).toEqual([
        "COMMAND_SCHEMA_ON_SEARCH_PATH public.unqualified(uuid)",
      ]);
    },
  );

  it.each<[string, string]>([
    ["an empty path", '""'],
    ["a path of ordinary schemas", "pg_catalog, public"],
    ["a schema whose name only contains a command schema's", "tenant_guard_x"],
    ["a quoted name that differs in case", '"Platform"'],
  ])("passes a function whose search path is %s", (_name, searchPath) => {
    const result = judge([
      wrapper("public.plain()", "SELECT 1;", { search_path: searchPath }),
    ]);
    expect(result.failures).toEqual([]);
  });

  const humanWith = (body: string) =>
    evaluate([], listed(), [], [human("tenant_guard.cmd(uuid)", { body })]);
  const platformWith = (body: string) =>
    evaluate(
      [],
      listed(),
      [],
      [platformCommand("platform.cmd(uuid)", { body })],
    );

  it.each<[string, string]>([
    [
      "PERFORM ... WHERE false, which never calls it",
      "BEGIN PERFORM tenant_guard.begin_human_command(p) WHERE false; RETURN 1; END;",
    ],
    [
      "a call inside a larger expression",
      "BEGIN v := tenant_guard.begin_human_command(p) IS NULL AND false; RETURN 1; END;",
    ],
    [
      "PERFORM ... FROM an empty set",
      "BEGIN PERFORM tenant_guard.begin_human_command(p) FROM pg_catalog.generate_series(1, 0); END;",
    ],
    [
      "a call that is never closed",
      "BEGIN PERFORM tenant_guard.begin_human_command(p; END;",
    ],
  ])("fails a human entry point whose first statement is %s", (_n, body) => {
    expect(codes(humanWith(body))).toEqual([
      "COMMAND_HUMAN_NO_PREAMBLE tenant_guard.cmd(uuid)",
    ]);
  });

  it.each<[string, string]>([
    [
      "nested parentheses in its arguments",
      "BEGIN v := tenant_guard.begin_human_command(coalesce(p, (NULL)::uuid), 'x)'); RETURN v; END;",
    ],
    [
      "a quoted identifier that holds a parenthesis",
      'BEGIN PERFORM tenant_guard.begin_human_command(p."odd)name" ) ; END;',
    ],
  ])("parses %s but does not admit an unregistered argument", (_n, body) => {
    expect(
      laneCheckProblem({ schema: "tenant_guard", language: "plpgsql", body }),
    ).toBeNull();
    expect(codes(humanWith(body))).toEqual([
      "COMMAND_CAPABILITY tenant_guard.cmd(uuid)",
    ]);
  });

  it("fails a platform command whose operator check is part of a larger initialiser", () => {
    expect(
      codes(
        platformWith(
          "DECLARE v boolean := platform.require_operator() IS NULL AND false; BEGIN RETURN v; END;",
        ),
      ),
    ).toEqual(["PLATFORM_COMMAND_NO_OPERATOR_CHECK platform.cmd(uuid)"]);
  });

  it("fails a grant to a Data API role on a view, a materialized view or a foreign table, and a column grant no policy admits", () => {
    const result = evaluate([], listed(), [], [], allow(), {
      grants: [
        grant("donor_view", "authenticated", "SELECT", { kind: "v" }),
        grant("donor_totals", "anon", "SELECT", { kind: "m" }),
        grant("donor_view", "authenticated", "UPDATE", {
          kind: "v",
          column: "name",
        }),
        grant("donations", "authenticated", "SELECT", { column: "amount" }),
        grant("donations", "anon", "REFERENCES", { column: "id" }),
      ],
    });
    expect(codes(result)).toEqual([
      "GRANT_ON_VIEW donor_view",
      "GRANT_ON_VIEW donor_totals",
      "GRANT_ON_VIEW donor_view",
      "GRANT_WITHOUT_POLICY donations",
      "GRANT_UNSAFE_PRIVILEGE donations",
    ]);
    expect(result.failures[3]).toMatchObject({
      detail: expect.stringContaining(
        "authenticated holds SELECT on column amount",
      ),
    });
  });
});

// Council round 3, lens 1 I2: the defeats of the scanner that were cheap to
// close. (b) a call no parser reads still makes a wrapper; (c) comments are
// ignored where the gate decides what is a wrapper; (e) a quoted identifier
// cannot hide or fake a keyword in the lane check.
describe("evaluateTenantRlsCatalog: council round 3 (lens 1 I2)", () => {
  const lanes = [
    human("tenant_guard.resolve(uuid)"),
    command("tenant_guard.acquire_claim(uuid)"),
  ];
  const judge = (wrappers: object[]) =>
    evaluate([], listed(), [], lanes, allow(), { wrappers });
  const DYNAMIC =
    "DECLARE r jsonb; BEGIN EXECUTE 'select tenant_guard.' || 'acquire_claim($1)' INTO r USING p; RETURN r; END;";

  it.each<[string, Record<string, unknown>, string]>([
    ["is SECURITY DEFINER", { definer: true }, "WRAPPER_DEFINER"],
    ["has no fixed search path", { search_path: null }, "WRAPPER_SEARCH_PATH"],
    [
      "lets PUBLIC execute it",
      { public_execute: true },
      "WRAPPER_PUBLIC_EXECUTE",
    ],
  ])(
    "(b) fails a function whose call into a command schema no parser reads, when it %s",
    (_name, over, code) => {
      expect(
        codes(judge([wrapper("public.dynamic(uuid)", DYNAMIC, over)])),
      ).toEqual([`${code} public.dynamic(uuid)`]);
    },
  );

  it("holds a definer that names a command schema without calling into it to the wrapper rules", () => {
    expect(
      codes(
        judge([
          wrapper("public.reads()", "SELECT kind FROM platform.environment;", {
            definer: true,
            search_path: null,
          }),
        ]),
      ),
    ).toEqual([
      "WRAPPER_DEFINER public.reads()",
      "WRAPPER_SEARCH_PATH public.reads()",
    ]);
  });

  it("(c) reads a call that has a comment between the schema and its dot", () => {
    expect(
      codes(
        judge([
          wrapper(
            "public.comment_dot(uuid)",
            "SELECT tenant_guard/**/.acquire_claim(p);",
            { definer: true, authenticated: true },
          ),
        ]),
      ),
    ).toEqual([
      "WRAPPER_DEFINER public.comment_dot(uuid)",
      "WRAPPER_GRANTS_WORKER public.comment_dot(uuid)",
    ]);
  });

  it("passes a definer that names a command schema only in a comment", () => {
    expect(
      judge([
        wrapper(
          "public.comment_only()",
          "-- tenant_guard.acquire_claim(p) is not called here\n/* nor platform.health() */ SELECT 1;",
          { definer: true, authenticated: true },
        ),
      ]).failures,
    ).toEqual([]);
  });

  const humanWith = (body: string) =>
    evaluate([], listed(), [], [human("tenant_guard.cmd(uuid)", { body })]);

  it.each<[string, string]>([
    [
      '(e) a quoted "end" that hides the outer EXCEPTION section',
      'DECLARE "end" int := 0; BEGIN PERFORM tenant_guard.begin_human_command(p); "end" := 1; RETURN 1; EXCEPTION WHEN others THEN RETURN 0; END;',
    ],
    [
      '(e) a quoted "case" that hides it',
      'DECLARE "case" int := 0; BEGIN PERFORM tenant_guard.begin_human_command(p); "case" := 1; RETURN 1; EXCEPTION WHEN others THEN RETURN 0; END;',
    ],
    [
      "a quoted identifier that holds a BEGIN and a fake preamble (the old recorded limit 1)",
      'DECLARE "begin perform tenant_guard.begin_human_command(p);" int; BEGIN RETURN 1; END;',
    ],
  ])("fails a human entry point with %s", (_name, body) => {
    expect(codes(humanWith(body))).toEqual([
      "COMMAND_HUMAN_NO_PREAMBLE tenant_guard.cmd(uuid)",
    ]);
  });

  it('passes a human entry point whose quoted identifiers are only names: v."end", "case"', () => {
    expect(
      humanWith(
        'DECLARE "case" int; BEGIN v_ctx := tenant_guard.begin_human_command(p, \'people.manage_members\'); "case" := v."end"; RETURN v_ctx; END;',
      ).failures,
    ).toEqual([]);
  });
});

// AL-2674 A9 (plan 15.2): on Supabase's own image the guard cannot be granted
// anything on `auth`, so no function in a command schema may name it.
describe("evaluateTenantRlsCatalog: command schemas never use auth (A9)", () => {
  const helper = (fn: string, body: string, language = "sql") =>
    command(fn, {
      owner: "postgres",
      definer: false,
      service_role: false,
      language,
      body,
    });

  it.each<[string, object]>([
    [
      "a guard helper that calls auth.uid()",
      helper("tenant_guard.caller_id()", "SELECT auth.uid();"),
    ],
    [
      "a platform check that reads auth.jwt()",
      helper(
        "platform.require_operator()",
        "DECLARE v uuid; BEGIN IF auth.jwt() ->> 'aal' <> 'aal2' THEN RAISE EXCEPTION 'x'; END IF; RETURN v; END;",
        "plpgsql",
      ),
    ],
    [
      "a quoted schema name with spaces",
      helper("tenant_guard.who()", 'SELECT "auth" . uid();'),
    ],
    [
      "a SQL-standard body as the catalog deparses it",
      helper(
        "tenant_guard.who()",
        "\nBEGIN ATOMIC\n SELECT auth.uid() AS uid;\nEND",
      ),
    ],
    [
      "dynamic SQL",
      helper(
        "tenant_guard.who()",
        "BEGIN EXECUTE 'select auth.uid()'; END;",
        "plpgsql",
      ),
    ],
    [
      "a human entry point",
      human("tenant_guard.cmd(uuid)", {
        body: HUMAN_BODY.replace("RETURN NULL;", "RETURN auth.uid();"),
      }),
    ],
  ])("fails %s", (_name, row) => {
    const result = evaluate([], listed(), [], [row]);
    expect(
      codes(result).filter((code: string) =>
        code.startsWith("COMMAND_READS_AUTH"),
      ),
    ).toHaveLength(1);
  });

  it.each<[string, string]>([
    [
      "the claims settings",
      "SELECT pg_catalog.current_setting('request.jwt.claims', true)::jsonb ->> 'sub';",
    ],
    ["authz", "SELECT m.id FROM authz.memberships AS m;"],
    [
      "a comment that names auth.uid()",
      "-- not auth.uid(): the claims setting\nSELECT tenant_guard.caller_id();",
    ],
    [
      "a name that only ends in auth",
      "SELECT tenant_guard.request_auth_x(), v_auth.id FROM x AS v_auth;",
    ],
  ])("passes a body that reads %s", (_name, body) => {
    const result = evaluate(
      [],
      listed(),
      [],
      [helper("tenant_guard.ok()", body)],
    );
    expect(result.failures).toEqual([]);
  });
});

describe("TENANT_RLS_CATALOG_SQL", () => {
  it("reads SQL-standard bodies and search paths that name a command schema, and checks column grants", () => {
    // Commands and wrappers both read the deparsed SQL-standard body, and
    // since AL-2675 so do the request-tenant helpers (record D-18: one more
    // reader of the same body, none fewer).
    expect(
      TENANT_RLS_CATALOG_SQL.match(/pg_get_function_sqlbody\(p\.oid\)/g),
    ).toHaveLength(4);
    expect(TENANT_RLS_CATALOG_SQL).toMatch(
      /search_path=%' limit 1\) ~\* '\(tenant_guard\|platform\)'/,
    );
    expect(TENANT_RLS_CATALOG_SQL).toContain("aclexplode(att.attacl)");
    expect(TENANT_RLS_CATALOG_SQL).toContain("or c.relkind not in ('r', 'p')");
  });

  it("selects command rows by schema or by the guard owner, the wrappers outside the command schemas, and the unadmitted table grants", () => {
    expect(TENANT_RLS_CATALOG_SQL).toMatch(
      /n\.nspname in \('tenant_guard', 'platform'\)\s+or r\.rolname = 'tenant_guard'/,
    );
    expect(TENANT_RLS_CATALOG_SQL).toContain("'wrappers'");
    expect(TENANT_RLS_CATALOG_SQL).toContain("'grants'");
    expect(TENANT_RLS_CATALOG_SQL).toContain(
      "a.privilege_type in ('TRUNCATE', 'REFERENCES', 'TRIGGER', 'MAINTAIN')",
    );
  });
});

/**
 * AL-2675 (WP2b, second release; plan 12, WP2 exit; record D-25): the tenant
 * condition on every signed-in policy of a tenant table, each lookup once for
 * a statement, no token claim, no published tenant table, and the reviewed
 * exceptions pinned to their text (docs/security/tenant-policy-exceptions.json).
 * Policy text below is as Postgres deparses it.
 */
describe("evaluateTenantRlsCatalog: the request's tenant on every signed-in policy (AL-2675)", () => {
  const T =
    "(tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id))";
  const STAFF =
    "( SELECT authz.assignment_is('staff'::authz.membership_role) AS assignment_is)";
  const DONOR_OWN =
    "(( SELECT authz.assignment_is('donor'::authz.membership_role) AS assignment_is) AND (profile_id IN ( SELECT authz.caller_profile_ids() AS caller_profile_ids)))";
  const SUPER = "( SELECT authz.is_super_admin() AS is_super_admin)";
  const HELPER = "( SELECT authz.staff_read() AS staff_read)";
  const policy = (
    tableName: string,
    using: string | null,
    over: Record<string, unknown> = {},
  ) => ({
    ...{ table: tableName, policy: `${tableName} read`, cmd: "SELECT" },
    ...{ roles: ["authenticated"], using, check: null, granted: true },
    ...{ permissive: true, writable: true },
    ...over,
  });
  const HELPERS = [
    "authz.current_tenant_id()",
    "authz.request_tenant_id()",
    "authz.request_assignment_id()",
    "authz.request_assignment()",
  ].map((fn) => ({
    function: fn,
    body: "SELECT a.tenant_id FROM authz.request_assignment() AS a",
    // Amended by fixcheck F4 (record D-18): the gate now reads each helper's
    // search path, which the migrated helpers fix empty.
    search_path: '""',
    root: true,
  }));
  /** What the helpers call: auth.uid(), which reads the token's subject only. */
  const UID = {
    function: "auth.uid()",
    body: "SELECT COALESCE( NULLIF(current_setting('request.jwt.claim.sub', true), ''), (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub') )::uuid",
    root: false,
  };
  const TABLES = [
    table("donors"),
    table("posts"),
    table("post_comments"),
    table("currency_metadata", { tenant: false }),
  ];
  const run = (
    policies: object[],
    more: {
      tenant_helpers?: object[];
      published?: string[];
      policyExceptions?: unknown;
    } = {},
  ) =>
    evaluate(TABLES, listed(), [], [], allow(), {
      policies,
      tenant_helpers: more.tenant_helpers ?? HELPERS,
      published: more.published,
      policyExceptions: more.policyExceptions,
    });
  // Council R3: a pin freezes the command, the sorted roles and whether the
  // policy is permissive, beside its text.
  const pin = (p: {
    table: string;
    policy: string;
    using: string | null;
    cmd?: string;
    roles?: string[];
  }) => ({
    entries: [
      {
        ...{ table: p.table, policy: p.policy, using: p.using, check: null },
        ...{ cmd: p.cmd ?? "SELECT", roles: p.roles ?? ["authenticated"] },
        ...{ permissive: true, reason: "fixture", ends: "WP7" },
      },
    ],
  });

  it("reads deparsed text: strips enclosing parentheses and splits at the top level, outside quotes", () => {
    expect(stripParens("((a = 1))")).toBe("a = 1");
    expect(stripParens("(a = 1) AND (b = 2)")).toBe("(a = 1) AND (b = 2)");
    expect(splitTopLevel(`(${T} AND ${STAFF})`, "AND")).toEqual([T, STAFF]);
    expect(splitTopLevel(`((name = ' OR x') AND ${T})`, "OR")).toHaveLength(1);
  });

  it("passes the tenant condition with a class term and a deny-all policy, and fails a super-admin branch beside it and the branch alone (D-18: council R2: the branch alone fails; AL-2675, WP2c rest B: the branch beside the tenant condition fails too, and the read's class term is the staff-read helper)", () => {
    const result = run([
      policy("donors", `(${T} AND ${HELPER})`),
      policy("donors", `(${T} AND (${HELPER} OR ${DONOR_OWN}))`, {
        policy: "own",
      }),
      policy("donors", "false", { policy: "deny", cmd: "ALL", check: "false" }),
    ]);
    expect(result.failures).toEqual([]);
    expect(result.counts.tenantPolicies).toBe(3);
    expect(
      codes(
        run([
          policy(
            "donors",
            `(${SUPER} OR (${T} AND (${HELPER} OR ${DONOR_OWN})))`,
            {
              policy: "own",
            },
          ),
        ]),
      ),
    ).toEqual([
      "TENANT_CONDITION_MISSING donors",
      "POLICY_SUPER_ADMIN_BRANCH donors",
    ]);
    for (const alone of [SUPER, `(${SUPER})`])
      expect(
        codes(run([policy("donors", alone, { policy: "super" })])),
        alone,
      ).toEqual([
        "TENANT_CONDITION_MISSING donors",
        "POLICY_SUPER_ADMIN_BRANCH donors",
      ]);
  });

  // Council R2: Postgres reads a missing USING as true for every row, and a
  // missing WITH CHECK as the USING; the gate judges what each command
  // effectively admits, not only the text that is there.
  it("judges each command's effective predicate: a missing USING admits every row, a missing WITH CHECK is the USING (D-18, AL-2675: the read stands on the staff-read helper, the writes keep the bare staff check)", () => {
    const T_STAFF = `(${T} AND ${STAFF})`;
    for (const [cmd, using, check] of [
      ["SELECT", null, null],
      ["DELETE", null, null],
      ["UPDATE", null, T_STAFF],
      ["ALL", null, T_STAFF],
      ["ALL", null, null],
      ["INSERT", null, null],
    ] as const) {
      const open = policy("donors", using, { policy: "open", cmd, check });
      expect(codes(run([open])), `${cmd} ${using} ${check}`).toContain(
        "TENANT_CONDITION_MISSING donors",
      );
    }
    for (const [cmd, using, check] of [
      ["UPDATE", T_STAFF, null],
      ["ALL", T_STAFF, null],
      ["INSERT", null, T_STAFF],
      ["SELECT", `(${T} AND ${HELPER})`, null],
    ] as const)
      expect(
        run([policy("donors", using, { policy: "bound", cmd, check })])
          .failures,
        `${cmd} ${using} ${check}`,
      ).toEqual([]);
  });

  it("fails a policy that admits a row without the tenant condition, naming it", () => {
    for (const using of [
      // Membership alone, today's form (NR-01).
      "authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])",
      // An own-row branch beside the tenant-bound one.
      `((${T} AND ${STAFF}) OR (profile_id IN ( SELECT authz.caller_profile_ids() AS caller_profile_ids)))`,
      // The global rows of a table are not the tenant condition.
      `((tenant_id IS NULL) OR ${T})`,
    ]) {
      const result = run([policy("donors", using)]);
      expect(codes(result), using).toContain("TENANT_CONDITION_MISSING donors");
    }
  });

  it("Q6, since WP2c's rest: accepts no super-admin disjunct beside the tenant condition and fails any other disjunct (D-18, AL-2675: Q6's one super-admin disjunct no longer passes)", () => {
    expect(tenantBound(`(${SUPER} OR (${T} AND ${HELPER}))`)).toBe(false);
    expect(tenantBound(`(${SUPER} OR ${SUPER} OR (${T} AND ${HELPER}))`)).toBe(
      false,
    );
    expect(tenantBound(`((${T} AND ${HELPER}) OR (${T} AND ${STAFF}))`)).toBe(
      true,
    );
    for (const other of [
      "( SELECT authz.has_membership(( SELECT authz.current_tenant_id() AS current_tenant_id)) AS has_membership)",
      "(( SELECT auth.uid() AS uid) IS NOT NULL)",
      "authz.is_super_admin()",
      SUPER,
    ]) {
      const result = run([
        policy("donors", `(${other} OR (${T} AND ${HELPER}))`),
      ]);
      expect(codes(result), other).toContain("TENANT_CONDITION_MISSING donors");
    }
  });

  it("fails a lookup that runs once for every row: a bare call, a call that takes a column, and the constant-argument form TP1 measured", () => {
    expect(perRowLookups(`(${T} AND ${STAFF})`)).toEqual([]);
    // A cast to an authz type is not a call.
    expect(perRowLookups("(role = 'staff'::authz.membership_role)")).toEqual(
      [],
    );
    for (const using of [
      `(${T} AND authz.assignment_is('staff'::authz.membership_role))`,
      `(${T} AND ( SELECT authz.has_staff_membership(donors.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))`,
      `(${T} AND authz.has_staff_membership(( SELECT authz.current_tenant_id() AS current_tenant_id), NULL::authz.staff_role[]))`,
    ]) {
      const result = run([policy("donors", using)]);
      expect(codes(result), using).toContain("POLICY_LOOKUP_PER_ROW donors");
    }
  });

  it("fails a policy anywhere in public, and a tenant helper, that reads the token claim", () => {
    const claim =
      "(tenant_id = (((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))::uuid)";
    expect(codes(run([policy("post_comments", claim)]))).toContain(
      "POLICY_READS_TOKEN_CLAIM post_comments",
    );
    const helper = run([], {
      tenant_helpers: [
        ...HELPERS.slice(1),
        {
          function: "authz.current_tenant_id()",
          body: "SELECT ((auth.jwt() -> 'app_metadata') ->> 'tenant_id')::uuid",
        },
      ],
    });
    expect(codes(helper)).toContain(
      "TENANT_HELPER_READS_CLAIM authz.current_tenant_id()",
    );
    // A comment that mentions the claim is not a read of it.
    const commented = run([], {
      tenant_helpers: HELPERS.map((h) => ({
        ...h,
        body: `-- no longer reads app_metadata\n${h.body}`,
      })),
    });
    expect(commented.failures).toEqual([]);
    expect(codes(run([], { tenant_helpers: HELPERS.slice(1) }))).toContain(
      "TENANT_HELPER_MISSING authz.current_tenant_id",
    );
  });

  // Council R12 (a): the helpers' bodies are not all they run. The gate
  // reads every overload of each helper, keyed by signature so that one
  // cannot hide another, and every function they call: none may read the
  // tenant from the token, and a function they call may read its subject only.
  it("fails an overload of a helper and a function a helper calls that reads the token claim, and passes auth.uid()'s read of the subject", () => {
    expect(run([], { tenant_helpers: [...HELPERS, UID] }).failures).toEqual([]);
    const overload = {
      function: "authz.current_tenant_id(uuid)",
      body: "SELECT ((auth.jwt() -> 'app_metadata') ->> 'tenant_id')::uuid",
      // Amended by fixcheck F4 (record D-18): an empty search path, so the
      // case judges the claim read alone.
      search_path: '""',
      root: true,
    };
    for (const order of [
      [...HELPERS, overload],
      [overload, ...HELPERS],
    ])
      expect(codes(run([], { tenant_helpers: order }))).toEqual([
        "TENANT_HELPER_READS_CLAIM authz.current_tenant_id(uuid)",
      ]);
    for (const body of [
      "SELECT ((auth.jwt() -> 'app_metadata') ->> 'tenant_id')::uuid",
      "SELECT (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid",
      "SELECT current_setting('request.jwt.claim.app_metadata', true)",
    ]) {
      const called = {
        function: "private.tenant_of_token()",
        body,
        root: false,
      };
      expect(
        codes(run([], { tenant_helpers: [...HELPERS, UID, called] })),
        body,
      ).toEqual(["TENANT_HELPER_READS_CLAIM private.tenant_of_token()"]);
    }
    // The helpers themselves may not read the subject from the claims either.
    expect(
      codes(
        run([], {
          tenant_helpers: [
            ...HELPERS.slice(1),
            { ...HELPERS[0], body: UID.body },
          ],
        }),
      ),
    ).toEqual(["TENANT_HELPER_READS_CLAIM authz.current_tenant_id()"]);
  });

  // Council R12 (b): a row compared with a bare auth.uid() runs it once for
  // every row; the rule saw only authz calls.
  it("fails a bare auth.uid() in a policy as a per-row lookup, and passes it as a whole sub-select", () => {
    const bare = `(${T} AND (author_id = auth.uid()))`;
    expect(perRowLookups(bare)).toEqual(["auth.uid()"]);
    expect(codes(run([policy("donors", bare)]))).toEqual([
      "POLICY_LOOKUP_PER_ROW donors",
    ]);
    const wrapped = `(${T} AND (author_id = ( SELECT auth.uid() AS uid)))`;
    expect(perRowLookups(wrapped)).toEqual([]);
    expect(run([policy("donors", wrapped)]).failures).toEqual([]);
  });

  it("Q3, Q4: pins a reviewed exception to its text, on a tenant table or not, and fails it when the text changes or the policy is gone", () => {
    const posts = policy(
      "posts",
      "((status = 'published'::text) AND (visibility = 'public'::text))",
      { policy: "tanstack browser read" },
    );
    const comments = policy(
      "post_comments",
      "(EXISTS ( SELECT 1 FROM posts p WHERE (p.id = post_comments.post_id)))",
      { policy: "tanstack browser read" },
    );
    expect(run([posts], { policyExceptions: pin(posts) }).failures).toEqual([]);
    expect(
      run([comments], { policyExceptions: pin(comments) }).failures,
    ).toEqual([]);
    expect(codes(run([posts]))).toContain("TENANT_CONDITION_MISSING posts");
    const widened = { ...posts, using: "(status = 'published'::text)" };
    expect(codes(run([widened], { policyExceptions: pin(posts) }))).toEqual([
      "POLICY_EXCEPTION_CHANGED posts",
    ]);
    const opened = { ...comments, using: "true" };
    expect(codes(run([opened], { policyExceptions: pin(comments) }))).toEqual([
      "POLICY_EXCEPTION_CHANGED post_comments",
    ]);
    expect(codes(run([], { policyExceptions: pin(posts) }))).toEqual([
      "POLICY_EXCEPTION_STALE posts",
    ]);
    const malformed = {
      entries: [{ table: "posts", policy: "x", using: null, check: null }],
    };
    expect(codes(run([], { policyExceptions: malformed }))).toEqual([
      "POLICY_EXCEPTIONS_MALFORMED posts",
    ]);
  });

  // Council R3: a pin freezes what was reviewed, not only the text. The same
  // text recreated FOR ALL, for other roles, or restrictive, is another policy.
  it("fails a pinned exception recreated for another command, other roles or as restrictive, and an entry that does not pin them", () => {
    const roles = ["anon", "authenticated"];
    const posts = policy(
      "posts",
      "((status = 'published'::text) AND (visibility = 'public'::text))",
      { policy: "tanstack browser read", roles },
    );
    const pinned = pin({ ...posts, roles });
    expect(run([posts], { policyExceptions: pinned }).failures).toEqual([]);
    // Roles are compared sorted.
    expect(
      run([{ ...posts, roles: ["authenticated", "anon"] }], {
        policyExceptions: pinned,
      }).failures,
    ).toEqual([]);
    for (const changed of [
      { ...posts, cmd: "ALL" },
      { ...posts, roles: ["public"] },
      { ...posts, roles: ["authenticated"] },
      { ...posts, permissive: false },
    ])
      expect(
        codes(run([changed], { policyExceptions: pinned })),
        JSON.stringify(changed),
      ).toEqual(["POLICY_EXCEPTION_CHANGED posts"]);
    for (const field of ["cmd", "roles", "permissive"]) {
      const entry: Record<string, unknown> = { ...pinned.entries[0] };
      delete entry[field];
      expect(
        codes(run([posts], { policyExceptions: { entries: [entry] } })),
        field,
      ).toContain("POLICY_EXCEPTIONS_MALFORMED posts");
    }
  });

  it("leaves no table on the parent-scoped list once the four post tables carry their own tenant (WP7 pull request 1, AL-2680): post_comments is judged as a tenant table, its signed-in read needs the request's tenant, and its anonymous read stands only as a pinned exception", () => {
    expect(PARENT_SCOPED_TABLES).toEqual([]);
    const parent =
      "(EXISTS ( SELECT 1 FROM posts parent_post WHERE (parent_post.id = post_comments.post_id)))";
    const signedIn = policy("post_comments", `(${T} AND ${parent})`, {
      policy: "post_comments tenant read",
    });
    expect(run([signedIn]).failures).toEqual([]);
    const unbound = policy("post_comments", parent, {
      policy: "post_comments tenant read",
    });
    expect(codes(run([unbound]))).toEqual([
      "TENANT_CONDITION_MISSING post_comments",
    ]);
    const anonymous = policy("post_comments", parent, {
      policy: "post_comments anonymous read",
      roles: ["anon"],
    });
    expect(codes(run([signedIn, anonymous]))).toEqual([
      "TENANT_CONDITION_MISSING post_comments",
    ]);
    expect(
      run([signedIn, anonymous], {
        policyExceptions: pin({ ...anonymous, roles: ["anon"] }),
      }).failures,
    ).toEqual([]);
    expect(run([policy("currency_metadata", "true")]).failures).toEqual([]);
  });

  // Council R3: a FOR ALL policy also writes. Where signed-in users hold no
  // write grant, only a plain deny may stand.
  it("fails a FOR ALL policy that is not a plain deny where no signed-in role holds a write privilege", () => {
    const T_STAFF = `(${T} AND ${STAFF})`;
    const all = (over: Record<string, unknown>) =>
      policy("donors", T_STAFF, { policy: "all", cmd: "ALL", ...over });
    expect(codes(run([all({ check: T_STAFF, writable: false })]))).toEqual([
      "WRITE_POLICY_WITHOUT_GRANT donors",
    ]);
    expect(run([all({ check: T_STAFF, writable: true })]).failures).toEqual([]);
    for (const check of ["false", null])
      expect(
        run([all({ using: "false", check, writable: false })]).failures,
        String(check),
      ).toEqual([]);
  });

  // The coordinator's follow-up on activation review Q7: no signed-in write
  // policy on a table where signed-in users hold no write grant, so a grant
  // that comes back by accident fails CI instead of being admitted.
  it("fails an INSERT, UPDATE or DELETE policy whose command no signed-in role holds a privilege for (D-18, AL-2675: the staff-wide read beside it calls the staff-read helper)", () => {
    const T_STAFF = `(${T} AND ${STAFF})`;
    for (const cmd of ["INSERT", "UPDATE", "DELETE"]) {
      const write = policy("donors", cmd === "INSERT" ? null : T_STAFF, {
        policy: `donors ${cmd.toLowerCase()}`,
        cmd,
        check: cmd === "DELETE" ? null : T_STAFF,
        granted: false,
      });
      expect(codes(run([write])), cmd).toEqual([
        "WRITE_POLICY_WITHOUT_GRANT donors",
      ]);
      expect(run([{ ...write, granted: true }]).failures, cmd).toEqual([]);
    }
    // A FOR ALL policy also governs reads, as the finance tables' deny-all
    // policies do beside their SELECT grant; a read policy is not a write.
    expect(
      run([
        policy("donors", "false", {
          cmd: "ALL",
          check: "false",
          granted: false,
        }),
        policy("donors", `(${T} AND ${HELPER})`, {
          policy: "read",
          granted: false,
        }),
      ]).failures,
    ).toEqual([]);
  });

  it("fails a tenant table in a publication, the post tables among them since WP7 pull request 1 (AL-2680), and passes a published table with no tenant", () => {
    expect(codes(run([], { published: ["donors"] }))).toEqual([
      "TENANT_TABLE_PUBLISHED donors",
    ]);
    expect(codes(run([], { published: ["post_comments"] }))).toEqual([
      "TENANT_TABLE_PUBLISHED post_comments",
    ]);
    expect(run([], { published: ["currency_metadata"] }).failures).toEqual([]);
  });

  // Fixcheck F4: a request-tenant helper sets an empty search path, so a call
  // it makes without a schema resolves in pg_catalog only; a function it calls
  // is read for what it reads, as before.
  it("fails a request-tenant helper without an empty search path, and passes a function it calls without one", () => {
    for (const search_path of [null, "public", '"$user", public'])
      expect(
        codes(
          run([], {
            tenant_helpers: [
              { ...HELPERS[0], search_path },
              ...HELPERS.slice(1),
            ],
          }),
        ),
        String(search_path),
      ).toEqual(["TENANT_HELPER_SEARCH_PATH authz.current_tenant_id()"]);
    expect(
      run([], { tenant_helpers: [...HELPERS, { ...UID, search_path: null }] })
        .failures,
    ).toEqual([]);
  });

  it("selects every signed-in policy of public, the request-tenant helpers and the published tables (D-18, AL-2675, record D-109 (g): a role reaches a policy as Postgres applies it, by USAGE; issue 2675's real-stack gate case plants a role held WITH INHERIT FALSE)", () => {
    expect(TENANT_RLS_CATALOG_SQL).toContain("'policies'");
    // Amended by fixcheck F4 (record D-18): the selection named PUBLIC and
    // authenticated only; it is now every policy that names PUBLIC or a role
    // that authenticated or anon holds by membership, which the real-stack
    // cases of issue 2675 plant ("the catalog gate").
    expect(TENANT_RLS_CATALOG_SQL).not.toContain(
      "p.polroles && array[0::oid, 'authenticated'::regrole::oid]",
    );
    expect(TENANT_RLS_CATALOG_SQL).toContain(
      "unnest(array['authenticated', 'anon']) g(r)",
    );
    expect(TENANT_RLS_CATALOG_SQL).toContain(
      "pg_has_role(g.r, x.rid, 'USAGE')",
    );
    expect(TENANT_RLS_CATALOG_SQL).toContain("'search_path', (select substr");
    expect(TENANT_RLS_CATALOG_SQL).toMatch(
      /p\.proname in \('current_tenant_id', 'request_tenant_id', 'request_assignment_id', 'request_assignment'\)/,
    );
    expect(TENANT_RLS_CATALOG_SQL).toContain("from pg_publication_tables t");
    // The privilege each write policy's command needs, for authenticated,
    // and for anon as well when the policy is TO public.
    expect(TENANT_RLS_CATALOG_SQL).toContain("'granted'");
    expect(TENANT_RLS_CATALOG_SQL).toContain(
      "has_any_column_privilege(g.r, c.oid, 'INSERT')",
    );
    expect(TENANT_RLS_CATALOG_SQL).toContain(
      "has_table_privilege(g.r, c.oid, 'DELETE')",
    );
    // Council R3: whether the policy is permissive, and whether a signed-in
    // role holds any write privilege (for FOR ALL policies).
    expect(TENANT_RLS_CATALOG_SQL).toContain("'permissive', p.polpermissive");
    expect(TENANT_RLS_CATALOG_SQL).toContain("'writable'");
    // Council R12 (a): every function the helpers reach, marked root or not.
    expect(TENANT_RLS_CATALOG_SQL).toContain("with recursive reach");
    expect(TENANT_RLS_CATALOG_SQL).toContain("'root'");
  });
});

describe("tenant keys", () => {
  const judge = (
    tenant_keys: { table: string; keyed: boolean }[],
    payload_installed: boolean,
  ) =>
    codes(
      evaluateTenantRlsCatalog(
        {
          tables: [],
          definers: [],
          commands: [],
          wrappers: [],
          grants: [],
          policies: [],
          published: [],
          tenant_delete_violations: [],
          tenant_update_violations: [],
          tenant_keys,
          payload_installed,
        },
        listed(),
        allow(),
        { entries: [] },
        [],
        undefined,
        [],
        { entries: [], reviewed: {} },
      ),
    );
  const cms = (keyed: (table: string) => boolean) =>
    keyExceptions.tables.map((table) => ({ table, keyed: keyed(table) }));

  it("admits the listed CMS selectors and fails an unlisted table without a key", () => {
    expect(
      judge(
        cms(() => false),
        true,
      ),
    ).toEqual([]);
    expect(
      judge(
        [...cms(() => false), { table: "public.planted", keyed: false }],
        true,
      ),
    ).toEqual(["TENANT_KEY_MISSING public.planted"]);
  });

  it("lists no CMS tenant selector any more, so an unkeyed cms tenant_id table fails as any other (D-18: WP6 part 2b drops the prototype's tenant_id tables and empties the list)", () => {
    expect(keyExceptions.tables).toEqual([]);
    expect(judge([{ table: "cms.pages", keyed: false }], true)).toEqual([
      "TENANT_KEY_MISSING cms.pages",
    ]);
    expect(judge([], false)).toEqual([]);
  });
});

describe("WP8a worker wrapper rules (TP2 section 11)", () => {
  const lanes = [
    command(
      "tenant_guard.apply_account_event(p_tenant_id uuid, p_event_id uuid, p_attempt integer)",
    ),
    command(
      "tenant_guard.acquire_workflow_work_claim(p_tenant_id uuid, p_subject_type text, p_subject_id text, p_claimed_by text, p_ttl_seconds integer)",
    ),
    command(
      "tenant_guard.release_workflow_work_claim(p_tenant_id uuid, p_claim_id uuid, p_status text)",
    ),
  ];
  const judge = (wrappers: object[]) =>
    evaluate([], listed(), [], lanes, allow(), { wrappers });

  it("passes a compliant worker wrapper that derives the tenant from a stored anchor and performs no writes (D-18, R1b, #2776's third item: the anchor is one whole single-table read; the JOIN this fixture read through fails now, as E4 shows)", () => {
    const body = `
      DECLARE v_tenant uuid;
      BEGIN
        SELECT e.tenant_id INTO v_tenant
          FROM public.stripe_connect_events AS e
         WHERE e.id = p_event_id;
        IF v_tenant IS NULL THEN
          RETURN pg_catalog.jsonb_build_object('event_id', p_event_id, 'outcome', 'unknown_anchor');
        END IF;
        RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, p_attempt);
      END;
    `;
    const result = judge([
      wrapper(
        "public.apply_account_event(p_event_id uuid, p_attempt integer)",
        body,
        { service_role: true },
      ),
    ]);
    expect(result.failures).toEqual([]);
  });

  it("allows only the listed P1 workflow claim wrappers to pass a tenant argument", () => {
    const result = judge([
      wrapper(
        "public.acquire_workflow_work_claim(p_tenant_id uuid, p_subject_type text, p_subject_id text, p_claimed_by text, p_ttl_seconds integer)",
        "BEGIN RETURN tenant_guard.acquire_workflow_work_claim(p_tenant_id, p_subject_type, p_subject_id, p_claimed_by, p_ttl_seconds); END;",
        { service_role: true },
      ),
      wrapper(
        "public.release_workflow_work_claim(p_tenant_id uuid, p_claim_id uuid, p_status text)",
        "BEGIN RETURN tenant_guard.release_workflow_work_claim(p_tenant_id, p_claim_id, p_status); END;",
        { service_role: true },
      ),
    ]);
    expect(result.failures).toEqual([]);
  });

  it.each<[string, string, string]>([
    [
      "passes a named p_tenant_id parameter as first argument",
      "public.bad_named(p_tenant_id uuid, p_event_id uuid, p_attempt integer)",
      "BEGIN RETURN tenant_guard.apply_account_event(p_tenant_id, p_event_id, p_attempt); END;",
    ],
    [
      "passes a differently named parameter as first argument",
      "public.bad_alias(p_org uuid, p_event_id uuid, p_attempt integer)",
      "BEGIN RETURN tenant_guard.apply_account_event(p_org, p_event_id, p_attempt); END;",
    ],
    [
      "passes positional parameter $1 as first argument",
      "public.bad_positional(uuid, uuid, integer)",
      "SELECT tenant_guard.apply_account_event($1, $2, $3);",
    ],
    [
      "declares a tenant parameter copied through a local variable",
      "public.bad_copy(p_tenant_id uuid, p_event_id uuid, p_attempt integer)",
      "DECLARE v_t uuid; BEGIN v_t := p_tenant_id; RETURN tenant_guard.apply_account_event(v_t, p_event_id, p_attempt); END;",
    ],
    [
      "mimics workflow claim under another wrapper name",
      "public.bad_claim_copy(p_tenant_id uuid)",
      "SELECT tenant_guard.acquire_workflow_work_claim(p_tenant_id, 'a', 'b', 'c', 60);",
    ],
  ])(
    "fails WORKER_WRAPPER_TENANT_ARGUMENT when wrapper %s",
    (_label, fn, body) => {
      const result = judge([wrapper(fn, body, { service_role: true })]);
      expect(codes(result)).toEqual([`WORKER_WRAPPER_TENANT_ARGUMENT ${fn}`]);
    },
  );

  it.each<[string, string]>([
    [
      "INSERT INTO",
      "DECLARE v_tenant uuid; BEGIN SELECT e.tenant_id INTO v_tenant FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; INSERT INTO public.audit_logs(tenant_id) VALUES (v_tenant); RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, p_attempt); END;",
    ],
    [
      "UPDATE ... SET",
      "DECLARE v_tenant uuid; BEGIN SELECT e.tenant_id INTO v_tenant FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; UPDATE public.stripe_raw_events SET processing_status = 'processing' WHERE id = p_event_id; RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, p_attempt); END;",
    ],
    [
      "DELETE FROM",
      "DECLARE v_tenant uuid; BEGIN SELECT e.tenant_id INTO v_tenant FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; DELETE FROM public.stripe_raw_events WHERE id = p_event_id; RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, p_attempt); END;",
    ],
    [
      "MERGE INTO",
      "DECLARE v_tenant uuid; BEGIN SELECT e.tenant_id INTO v_tenant FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; MERGE INTO public.stripe_raw_events t USING (SELECT p_event_id id) s ON t.id = s.id WHEN MATCHED THEN DO NOTHING; RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, p_attempt); END;",
    ],
    [
      "dynamic EXECUTE UPDATE",
      "DECLARE v_tenant uuid; BEGIN SELECT e.tenant_id INTO v_tenant FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; EXECUTE 'UPDATE public.stripe_raw_events SET processing_status = ''x'' WHERE id = $1' USING p_event_id; RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, p_attempt); END;",
    ],
  ])("fails WORKER_WRAPPER_WRITES when wrapper contains %s", (_label, body) => {
    const fn = "public.writing_wrapper(p_event_id uuid, p_attempt integer)";
    const result = judge([wrapper(fn, body, { service_role: true })]);
    expect(codes(result)).toEqual([`WORKER_WRAPPER_WRITES ${fn}`]);
  });

  it("does not false-positive WORKER_WRAPPER_WRITES on FOR NO KEY UPDATE or prose error literals (D-18, R1b, #2776's third item: a single-table read, since a JOIN no longer passes the anchor rule)", () => {
    const fn =
      "public.readonly_lock_wrapper(p_event_id uuid, p_attempt integer)";
    const body = `
      DECLARE v_tenant uuid;
      BEGIN
        SELECT e.tenant_id INTO v_tenant
          FROM public.stripe_connect_events AS e
         WHERE e.id = p_event_id
           FOR NO KEY UPDATE;
        IF v_tenant IS NULL THEN
          RAISE EXCEPTION 'cannot update or delete unknown anchor';
        END IF;
        RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, p_attempt);
      END;
    `;
    const result = judge([wrapper(fn, body, { service_role: true })]);
    expect(result.failures).toEqual([]);
  });
  it.each<[string, string, string]>([
    [
      "passes a caller value through a SELECT that reads no stored row",
      "public.bad_select(p_owner uuid, p_event_id uuid, p_attempt integer)",
      "SELECT tenant_guard.apply_account_event((SELECT p_owner), p_event_id, p_attempt);",
    ],
    [
      "copies a caller value into the variable it passes",
      "public.bad_assign(p_owner uuid, p_event_id uuid, p_attempt integer)",
      "DECLARE v_t uuid; BEGIN v_t := p_owner; RETURN tenant_guard.apply_account_event(v_t, p_event_id, p_attempt); END;",
    ],
    [
      "selects a caller value into the variable without reading a table",
      "public.bad_select_into(p_owner uuid, p_event_id uuid, p_attempt integer)",
      "DECLARE v_t uuid; BEGIN SELECT p_owner INTO v_t; RETURN tenant_guard.apply_account_event(v_t, p_event_id, p_attempt); END;",
    ],
    [
      "overwrites the stored read with a caller value",
      "public.bad_overwrite(p_owner uuid, p_event_id uuid, p_attempt integer)",
      "DECLARE v_t uuid; BEGIN SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; v_t := p_owner; RETURN tenant_guard.apply_account_event(v_t, p_event_id, p_attempt); END;",
    ],
    [
      "reads the tenant through a function the gate cannot see into",
      "public.bad_lookup(p_owner uuid, p_event_id uuid, p_attempt integer)",
      "SELECT tenant_guard.apply_account_event((SELECT public.lookup_owner(p_owner)), p_event_id, p_attempt);",
    ],
  ])(
    "fails WORKER_WRAPPER_TENANT_ARGUMENT when the first argument is not a verifiable read of a stored anchor: %s",
    (_label, fn, body) => {
      const result = judge([wrapper(fn, body, { service_role: true })]);
      expect(codes(result)).toContain(`WORKER_WRAPPER_TENANT_ARGUMENT ${fn}`);
    },
  );

  it("accepts the stored-anchor read as a scalar subquery and through a variable read once from a table", () => {
    const result = judge([
      wrapper(
        "public.scalar_anchor(p_event_id uuid, p_attempt integer)",
        "SELECT tenant_guard.apply_account_event((SELECT e.tenant_id FROM public.stripe_connect_events AS e WHERE e.id = p_event_id), p_event_id, p_attempt);",
        { service_role: true, language: "sql" },
      ),
      wrapper(
        "public.variable_anchor(p_event_id uuid, p_attempt integer)",
        "DECLARE v_tenant uuid; BEGIN SELECT e.tenant_id INTO v_tenant FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; IF v_tenant IS NULL THEN RETURN pg_catalog.jsonb_build_object('outcome', 'unknown_anchor'); END IF; RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, p_attempt); END;",
        { service_role: true, language: "plpgsql" },
      ),
    ]);
    expect(result.failures).toEqual([]);
  });

  it.each<[string, string, string | undefined]>([
    [
      "TRUNCATE",
      "DECLARE v_tenant uuid; BEGIN SELECT e.tenant_id INTO v_tenant FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; TRUNCATE public.fixture_rows; RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, p_attempt); END;",
      "plpgsql",
    ],
    [
      "a call to a function that may write",
      "DECLARE v_tenant uuid; BEGIN SELECT e.tenant_id INTO v_tenant FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; PERFORM public.rebuild_fixture(p_event_id); RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, p_attempt); END;",
      "plpgsql",
    ],
    [
      "a session setting change",
      "DECLARE v_tenant uuid; BEGIN SELECT e.tenant_id INTO v_tenant FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; PERFORM pg_catalog.set_config('app.flag', 'on', true); RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, p_attempt); END;",
      "plpgsql",
    ],
    [
      "dynamic SQL whose text the gate cannot read",
      "DECLARE v_tenant uuid; BEGIN SELECT e.tenant_id INTO v_tenant FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; EXECUTE pg_catalog.format('SELECT %s', 1); RETURN tenant_guard.apply_account_event(v_tenant, p_event_id, p_attempt); END;",
      "plpgsql",
    ],
    [
      "a SQL-language SELECT INTO, which creates a table",
      "SELECT e.* INTO public.event_copy FROM public.stripe_connect_events AS e; SELECT tenant_guard.apply_account_event((SELECT e.tenant_id FROM public.stripe_connect_events AS e WHERE e.id = p_event_id), p_event_id, p_attempt);",
      "sql",
    ],
  ])(
    "fails WORKER_WRAPPER_WRITES on a write the detector does not model: %s",
    (_label, body, language) => {
      const fn =
        "public.unmodelled_wrapper(p_event_id uuid, p_attempt integer)";
      const result = judge([
        wrapper(fn, body, { service_role: true, language }),
      ]);
      expect(codes(result)).toContain(`WORKER_WRAPPER_WRITES ${fn}`);
    },
  );

  const forward =
    "RETURN tenant_guard.apply_account_event(v_t, p_event_id, p_attempt);";
  it.each<[string, string, string, string]>([
    [
      "E1: the scalar form followed by UNION SELECT p_owner",
      "public.e1_union(p_owner uuid, p_event_id uuid, p_attempt integer)",
      "SELECT tenant_guard.apply_account_event((SELECT e.tenant_id FROM public.stripe_connect_events AS e WHERE e.id = p_event_id UNION SELECT p_owner), p_event_id, p_attempt);",
      "sql",
    ],
    [
      "E2: the INTO form reading through CROSS JOIN (SELECT p_owner AS tenant_id) x",
      "public.e2_cross(p_owner uuid, p_event_id uuid, p_attempt integer)",
      `DECLARE v_t uuid; BEGIN SELECT x.tenant_id INTO v_t FROM public.stripe_connect_events AS e CROSS JOIN (SELECT p_owner AS tenant_id) x WHERE e.id = p_event_id; ${forward} END;`,
      "plpgsql",
    ],
    [
      "E3: a comma source",
      "public.e3_comma(p_owner uuid, p_event_id uuid, p_attempt integer)",
      `DECLARE v_t uuid; BEGIN SELECT o.tenant_id INTO v_t FROM public.stripe_connect_events AS e, (SELECT p_owner AS tenant_id) AS o WHERE e.id = p_event_id; ${forward} END;`,
      "plpgsql",
    ],
    [
      "E4: a JOIN public.payment_provider_accounts",
      "public.e4_join(p_event_id uuid, p_attempt integer)",
      `DECLARE v_t uuid; BEGIN SELECT a.tenant_id INTO v_t FROM public.stripe_raw_events AS e JOIN public.payment_provider_accounts AS a ON a.provider_account_id = e.stripe_account AND a.livemode = e.livemode WHERE e.id = p_event_id; ${forward} END;`,
      "plpgsql",
    ],
    [
      "E5: a subquery in the predicate",
      "public.e5_subquery(p_owner uuid, p_event_id uuid, p_attempt integer)",
      `DECLARE v_t uuid; BEGIN SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id OR e.tenant_id = (SELECT p_owner); ${forward} END;`,
      "plpgsql",
    ],
    [
      "E5: a trailing LIMIT 1",
      "public.e5_limit(p_event_id uuid, p_attempt integer)",
      `DECLARE v_t uuid; BEGIN SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id LIMIT 1; ${forward} END;`,
      "plpgsql",
    ],
    [
      "E5: the scalar form with a trailing ORDER BY",
      "public.e5_order(p_event_id uuid, p_attempt integer)",
      "SELECT tenant_guard.apply_account_event((SELECT e.tenant_id FROM public.stripe_connect_events AS e WHERE e.id = p_event_id ORDER BY e.created_at), p_event_id, p_attempt);",
      "sql",
    ],
    [
      "E8: a leading WITH",
      "public.e8_with(p_owner uuid, p_event_id uuid, p_attempt integer)",
      `DECLARE v_t uuid; BEGIN WITH o AS (SELECT p_owner AS id) SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; ${forward} END;`,
      "plpgsql",
    ],
    [
      "E8: an alias spelled join",
      "public.e8_alias(p_event_id uuid, p_attempt integer)",
      `DECLARE v_t uuid; BEGIN SELECT join.tenant_id INTO v_t FROM public.stripe_connect_events join WHERE join.id = p_event_id; ${forward} END;`,
      "plpgsql",
    ],
    [
      "E8: a lower-case join after the relation",
      "public.e8_lower_join(p_event_id uuid, p_attempt integer)",
      `DECLARE v_t uuid; BEGIN SELECT a.tenant_id INTO v_t FROM public.stripe_raw_events join public.payment_provider_accounts AS a ON a.provider_account_id = public.stripe_raw_events.stripe_account WHERE public.stripe_raw_events.id = p_event_id; ${forward} END;`,
      "plpgsql",
    ],
  ])(
    "fails WORKER_WRAPPER_TENANT_ARGUMENT unless the anchor read is one whole statement of one schema-qualified relation (#2776's third item, R1b): %s",
    (_label, fn, body, language) => {
      const result = judge([
        wrapper(fn, body, { service_role: true, language }),
      ]);
      expect(codes(result)).toEqual([`WORKER_WRAPPER_TENANT_ARGUMENT ${fn}`]);
    },
  );

  const lowerBody = (call: string) =>
    `DECLARE v_t uuid; v_label text; BEGIN SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; v_label := ${call}('A'); ${forward} END;`;

  it.each<[string, string | undefined]>([
    ["search_path public", "public"],
    ["no search_path", undefined],
  ])(
    "E6: an unqualified read-only built-in under %s fails WORKER_WRAPPER_WRITES (#2776's third item, R1b: only an empty path resolves it in pg_catalog alone)",
    (_label, searchPath) => {
      const fn = "public.e6_lower(p_event_id uuid, p_attempt integer)";
      const result = judge([
        wrapper(fn, lowerBody("lower"), {
          service_role: true,
          language: "plpgsql",
          search_path: searchPath,
        }),
      ]);
      expect(codes(result)).toContain(`WORKER_WRAPPER_WRITES ${fn}`);
    },
  );

  const definitionBody = (text: string, name: string) => {
    const at = text.search(
      new RegExp(
        `^CREATE\\s+(?:OR\\s+REPLACE\\s+)?FUNCTION\\s+${name.replace(".", "\\.")}\\(`,
        "m",
      ),
    );
    if (at < 0) throw new Error(`no definition of ${name}`);
    const next = text
      .slice(at + 1)
      .search(/\bCREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\b/i);
    const definition =
      next < 0 ? text.slice(at) : text.slice(at, at + 1 + next);
    const opening = /\bAS\s+(\$[A-Za-z_]*\$)/.exec(definition);
    if (!opening) throw new Error(`no opening delimiter in ${name}`);
    const tag = opening[1]!;
    const start = opening.index + opening[0].length;
    const end = definition.indexOf(tag, start);
    if (end < 0) throw new Error(`no closing ${tag} in ${name}`);
    return definition.slice(start, end);
  };

  const migrationBody = (file: string, name: string) =>
    definitionBody(
      readFileSync(
        new URL(`../../../supabase/migrations/${file}`, import.meta.url),
        "utf8",
      ),
      name,
    );

  it("G4 (bot round): the fixture reader takes the named definition's own delimiters, never a mention in a comment, fails when either is missing, and each migration fixture reaches the worker-wrapper check", () => {
    const text = [
      "--   DROP FUNCTION public.second(uuid),",
      "CREATE FUNCTION public.first(p_id uuid) RETURNS jsonb LANGUAGE plpgsql AS $$ BEGIN RETURN tenant_guard.apply_account_event(NULL, p_id, 1); END; $$;",
      "CREATE FUNCTION public.second(p_id uuid) RETURNS jsonb LANGUAGE plpgsql AS $fn$ BEGIN RETURN NULL; END; $fn$;",
      "CREATE FUNCTION public.third(p_id uuid) RETURNS jsonb LANGUAGE sql RETURN NULL;",
      "CREATE FUNCTION public.fifth(p_id uuid) RETURNS jsonb LANGUAGE plpgsql AS $x$ BEGIN RETURN NULL; END;",
    ].join("\n");
    expect(definitionBody(text, "public.first")).toBe(
      " BEGIN RETURN tenant_guard.apply_account_event(NULL, p_id, 1); END; ",
    );
    expect(definitionBody(text, "public.second")).toBe(
      " BEGIN RETURN NULL; END; ",
    );
    expect(() => definitionBody(text, "public.fifth")).toThrow(
      "no closing $x$ in public.fifth",
    );
    expect(() => definitionBody(text, "public.third")).toThrow(
      "no opening delimiter in public.third",
    );
    expect(() => definitionBody(text, "public.fourth")).toThrow(
      "no definition of public.fourth",
    );
    const r1a = "20261126020200_wp8a2_provider_operation_commands.sql";
    const part1 = "20261123030300_wp8a_task_guard_and_event_leases.sql";
    for (const [fn, file, name] of [
      [
        "public.claim_provider_operation(p_operation_id uuid, p_lease_seconds integer)",
        r1a,
        "public.claim_provider_operation",
      ],
      [
        "public.record_provider_operation_result(p_operation_id uuid, p_attempt integer, p_result jsonb)",
        r1a,
        "public.record_provider_operation_result",
      ],
      [
        "public.confirm_payment_account_onboarding(p_stripe_event_id text, p_livemode boolean, p_snapshot jsonb)",
        part1,
        "public.confirm_payment_account_onboarding",
      ],
    ] as const) {
      const body = migrationBody(file, name);
      const probed = body.replace(
        /\bBEGIN\b/,
        "BEGIN PERFORM public.r1b_probe();",
      );
      expect(probed).not.toBe(body);
      expect(
        codes(
          judge([
            wrapper(fn, probed, { service_role: true, language: "plpgsql" }),
          ]),
        ),
      ).toEqual([`WORKER_WRAPPER_WRITES ${fn}`]);
    }
  });

  it("E7 (guard): an unqualified built-in under the empty path, pg_catalog.lower under public, R1a's two wrappers and the onboarding wrapper as migrated (a cast in the predicate), a row lock after the WHERE and INTO STRICT all pass", () => {
    const r1a = "20261126020200_wp8a2_provider_operation_commands.sql";
    const part1 = "20261123030300_wp8a_task_guard_and_event_leases.sql";
    const result = judge([
      wrapper(
        "public.e7_empty_path(p_event_id uuid, p_attempt integer)",
        lowerBody("lower"),
        { service_role: true, language: "plpgsql" },
      ),
      wrapper(
        "public.e7_qualified(p_event_id uuid, p_attempt integer)",
        lowerBody("pg_catalog.lower"),
        { service_role: true, language: "plpgsql", search_path: "public" },
      ),
      wrapper(
        "public.claim_provider_operation(p_operation_id uuid, p_lease_seconds integer)",
        migrationBody(r1a, "public.claim_provider_operation"),
        { service_role: true, language: "plpgsql" },
      ),
      wrapper(
        "public.record_provider_operation_result(p_operation_id uuid, p_attempt integer, p_result jsonb)",
        migrationBody(r1a, "public.record_provider_operation_result"),
        { service_role: true, language: "plpgsql" },
      ),
      wrapper(
        "public.confirm_payment_account_onboarding(p_stripe_event_id text, p_livemode boolean, p_snapshot jsonb)",
        migrationBody(part1, "public.confirm_payment_account_onboarding"),
        { service_role: true, language: "plpgsql" },
      ),
      wrapper(
        "public.e7_lock(p_event_id uuid, p_attempt integer)",
        `DECLARE v_t uuid; BEGIN SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id FOR NO KEY UPDATE; ${forward} END;`,
        { service_role: true, language: "plpgsql" },
      ),
      wrapper(
        "public.e7_strict(p_event_id uuid, p_attempt integer)",
        `DECLARE v_t uuid; BEGIN SELECT e.tenant_id INTO STRICT v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id FOR UPDATE SKIP LOCKED; ${forward} END;`,
        { service_role: true, language: "plpgsql" },
      ),
      wrapper(
        "public.e7_own_name(p_event_id uuid, p_attempt integer)",
        `DECLARE v_t uuid; BEGIN SELECT stripe_connect_events.tenant_id INTO v_t FROM public.stripe_connect_events WHERE stripe_connect_events.id = p_event_id; ${forward} END;`,
        { service_role: true, language: "plpgsql" },
      ),
      wrapper(
        "public.e7_parenthesised(p_event_id uuid, p_attempt integer)",
        "SELECT tenant_guard.apply_account_event(((SELECT e.tenant_id FROM public.stripe_connect_events AS e WHERE (e.id = p_event_id))), p_event_id, p_attempt);",
        { service_role: true, language: "sql" },
      ),
    ]);
    expect(result.failures).toEqual([]);
  });

  it.each<[string, string, string, string]>([
    [
      "a column qualified by a row-typed parameter (p_row.tenant_id)",
      "public.f2_row(p_row public.stripe_connect_events, p_event_id uuid, p_attempt integer)",
      `DECLARE v_t uuid; BEGIN SELECT p_row.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; ${forward} END;`,
      "plpgsql",
    ],
    [
      "a declared local variable selected unqualified (SELECT v_copy INTO v_t)",
      "public.f2_copy(p_owner uuid, p_event_id uuid, p_attempt integer)",
      `DECLARE v_copy uuid := p_owner; v_t uuid; BEGIN SELECT v_copy INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; ${forward} END;`,
      "plpgsql",
    ],
    [
      "a column selected unqualified from an aliased relation",
      "public.f2_bare(p_event_id uuid, p_attempt integer)",
      `DECLARE v_t uuid; BEGIN SELECT tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; ${forward} END;`,
      "plpgsql",
    ],
    [
      "the relation's own name as qualifier when it has an alias",
      "public.f2_shadowed(p_event_id uuid, p_attempt integer)",
      `DECLARE v_t uuid; BEGIN SELECT stripe_connect_events.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; ${forward} END;`,
      "plpgsql",
    ],
    [
      "a qualifier that is another alias",
      "public.f2_other(p_event_id uuid, p_attempt integer)",
      `DECLARE v_t uuid; BEGIN SELECT x.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; ${forward} END;`,
      "plpgsql",
    ],
    [
      "a parameter named like the alias",
      "public.f2_param_alias(e public.stripe_connect_events, p_event_id uuid, p_attempt integer)",
      `DECLARE v_t uuid; BEGIN SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; ${forward} END;`,
      "plpgsql",
    ],
    [
      "a declared variable named like the alias",
      "public.f2_var_alias(p_owner uuid, p_event_id uuid, p_attempt integer)",
      `DECLARE e record; v_t uuid; BEGIN SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; ${forward} END;`,
      "plpgsql",
    ],
    [
      "a declared variable named like the relation it reads without an alias",
      "public.f2_var_rel(p_event_id uuid, p_attempt integer)",
      `DECLARE stripe_connect_events record; v_t uuid; BEGIN SELECT stripe_connect_events.tenant_id INTO v_t FROM public.stripe_connect_events WHERE stripe_connect_events.id = p_event_id; ${forward} END;`,
      "plpgsql",
    ],
    [
      "(SELECT …) || (p_owner) as the scalar argument",
      "public.f2_concat(p_owner uuid, p_event_id uuid, p_attempt integer)",
      "SELECT tenant_guard.apply_account_event((SELECT e.tenant_id FROM public.stripe_connect_events AS e WHERE e.id = p_event_id) || (p_owner), p_event_id, p_attempt);",
      "sql",
    ],
    [
      "an unbalanced predicate",
      "public.f2_unbalanced(p_owner uuid, p_event_id uuid, p_attempt integer)",
      `DECLARE v_t uuid; BEGIN SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE (e.id = p_event_id)) OR (true; ${forward} END;`,
      "plpgsql",
    ],
  ])(
    "F2 (review finding 2): fails WORKER_WRAPPER_TENANT_ARGUMENT unless the selected column is qualified by the read relation's alias, or its name when it has none, and that qualifier is neither a parameter nor a declared name, with balanced parentheses: %s",
    (_label, fn, body, language) => {
      const result = judge([
        wrapper(fn, body, { service_role: true, language }),
      ]);
      expect(codes(result)).toEqual([`WORKER_WRAPPER_TENANT_ARGUMENT ${fn}`]);
    },
  );

  it.each<[string, string, string]>([
    [
      'L1: two quoted names that are not plain identifiers, of equal length, as qualifier and alias ("e-1" a row-typed parameter)',
      'public.l1_equal(\"e-1\" public.stripe_connect_events, p_event_id uuid, p_attempt integer)',
      `DECLARE v_t uuid; BEGIN SELECT "e-1".tenant_id INTO v_t FROM public.stripe_connect_events AS "x-1" WHERE "x-1".id = p_event_id; ${forward} END;`,
    ],
    [
      "L1: a quoted function name as qualifier and a quoted parameter as column, behind a quoted alias of the same length",
      'public."my-fn"("p-owner" uuid, p_event_id uuid, p_attempt integer)',
      `DECLARE v_t uuid; BEGIN SELECT "my-fn"."p-owner" INTO v_t FROM public.stripe_connect_events AS "ab-cd" WHERE "ab-cd".id = p_event_id; ${forward} END;`,
    ],
    [
      'L2: #variable_conflict use_variable with a variable "begin" declared before a row variable named like the alias',
      "public.l2_begin(p_owner uuid, p_event_id uuid, p_attempt integer)",
      `#variable_conflict use_variable
       DECLARE "begin" integer; e public.stripe_connect_events; v_t uuid; BEGIN e.tenant_id := p_owner; SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; ${forward} END;`,
    ],
    [
      'L2: a quoted "begin" declared before a row variable named like the alias, without the pragma',
      "public.l2_quoted_begin(p_owner uuid, p_event_id uuid, p_attempt integer)",
      `DECLARE "begin" integer; e public.stripe_connect_events; v_t uuid; BEGIN SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; ${forward} END;`,
    ],
    [
      "L2: #variable_conflict in an otherwise compliant worker wrapper",
      "public.l2_pragma(p_event_id uuid, p_attempt integer)",
      `#variable_conflict use_column
       DECLARE v_t uuid; BEGIN SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; ${forward} END;`,
    ],
    [
      "L3: the variable initialised with a plain = in its declaration",
      "public.l3_equals(p_owner uuid, p_event_id uuid, p_attempt integer)",
      `DECLARE v_t uuid = p_owner; BEGIN IF p_attempt > 99 THEN SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; END IF; ${forward} END;`,
    ],
    [
      "L4: the function's own name as the column",
      "public.tenant_id(p_event_id uuid, p_attempt integer)",
      `DECLARE v_t uuid; BEGIN SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; ${forward} END;`,
    ],
    [
      "L4 (guard): a block label as the qualifier",
      "public.l4_label(p_event_id uuid, p_attempt integer)",
      `<<e>> DECLARE v_t uuid; BEGIN SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; ${forward} END e;`,
    ],
    [
      "L4 (guard): a FOR loop variable as the qualifier",
      "public.l4_loop(p_event_id uuid, p_attempt integer)",
      `DECLARE v_t uuid; BEGIN FOR e IN 1..2 LOOP SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; END LOOP; ${forward} END;`,
    ],
    [
      "L4 (guard): the function's own name as the qualifier",
      "public.ev(p_event_id uuid, p_attempt integer)",
      `DECLARE v_t uuid; BEGIN SELECT ev.tenant_id INTO v_t FROM public.stripe_connect_events AS ev WHERE ev.id = p_event_id; ${forward} END;`,
    ],
  ])(
    "the last step (L1 to L4): fails WORKER_WRAPPER_TENANT_ARGUMENT when %s",
    (_label, fn, body) => {
      const result = judge([
        wrapper(fn, body, { service_role: true, language: "plpgsql" }),
      ]);
      expect(codes(result)).toEqual([`WORKER_WRAPPER_TENANT_ARGUMENT ${fn}`]);
    },
  );

  it.each<[string, string]>([
    [
      "a quoted function name that is not a plain identifier",
      'public."do-write"',
    ],
    ["a quoted schema that is not a plain identifier", '"my schema".fn'],
    ["a quoted function name that is a keyword", 'public."select"'],
  ])(
    "the last step (guard): a call through %s still fails WORKER_WRAPPER_WRITES",
    (_label, callee) => {
      const fn = "public.quoted_call(p_event_id uuid, p_attempt integer)";
      const result = judge([
        wrapper(
          fn,
          `DECLARE v_t uuid; BEGIN SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; PERFORM ${callee}(p_event_id); ${forward} END;`,
          { service_role: true, language: "plpgsql" },
        ),
      ]);
      expect(codes(result)).toEqual([`WORKER_WRAPPER_WRITES ${fn}`]);
    },
  );

  it.each<[string, string]>([
    [
      "ALIAS FOR a parameter, read only under a condition",
      `DECLARE v_t ALIAS FOR p_owner; BEGIN IF p_attempt > 99 THEN SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; END IF; ${forward} END;`,
    ],
    [
      "ALIAS FOR a positional parameter, beside the anchor variable",
      `DECLARE v_owner ALIAS FOR $1; v_t uuid; BEGIN SELECT e.tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; ${forward} END;`,
    ],
  ])(
    "G1 (bot round): a worker wrapper whose DECLARE holds ALIAS fails WORKER_WRAPPER_TENANT_ARGUMENT: %s",
    (_label, body) => {
      const fn =
        "public.g1_alias(p_owner uuid, p_event_id uuid, p_attempt integer)";
      const result = judge([
        wrapper(fn, body, { service_role: true, language: "plpgsql" }),
      ]);
      expect(codes(result)).toEqual([`WORKER_WRAPPER_TENANT_ARGUMENT ${fn}`]);
    },
  );

  it("G3 (bot round): the tenant-argument failure names the form the rule requires: a qualified column whose qualifier is the read relation's alias, or its name when it has none", () => {
    const fn = "public.g3_message(p_event_id uuid, p_attempt integer)";
    const result = judge([
      wrapper(
        fn,
        `DECLARE v_t uuid; BEGIN SELECT tenant_id INTO v_t FROM public.stripe_connect_events AS e WHERE e.id = p_event_id; ${forward} END;`,
        { service_role: true, language: "plpgsql" },
      ),
    ]);
    const failure = (
      result.failures as { code: string; detail: string }[]
    ).find((f) => f.code === "WORKER_WRAPPER_TENANT_ARGUMENT");
    expect(failure?.detail).toContain(
      "SELECT <qualifier>.<column> INTO <variable> FROM <schema>.<relation> [[AS] <alias>] WHERE <predicate> [row lock]",
    );
    expect(failure?.detail).toContain(
      "the qualifier is the relation's alias, or its name when it has none",
    );
  });
});

describe("WP7 (AL-2680) PR 1: the own-ministry lane admits only reviewed commands opening with begin_human_command(<tenant>, NULL)", () => {
  const OWN_BODY = `
DECLARE
  v_ctx tenant_guard.command_context;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, NULL);
  IF v_ctx.role IS DISTINCT FROM 'missionary' THEN
    RAISE EXCEPTION 'own ministry only' USING ERRCODE = '42501';
  END IF;
  RETURN NULL;
END;
`;
  const name = "tenant_guard.submit_example(p_tenant_id uuid, p_title text)";
  const entry = { function: name, reason: "fixture: own ministry" };
  const reviewedFor = (body: string) => ({
    [name]: {
      reason: entry.reason,
      digest: createHash("sha256").update(body.trim()).digest("hex"),
    },
  });
  const run = (
    row: ReturnType<typeof human>,
    list?: { entries: (typeof entry)[]; reviewed: Record<string, unknown> },
  ) =>
    codes(
      evaluateTenantRlsCatalog(
        {
          tables: [],
          definers: [],
          commands: [row],
          wrappers: [],
          grants: [],
          policies: [],
          published: [],
        },
        listed(),
        allow(),
        { entries: [] },
        [],
        { entries: [] },
        [],
        list,
      ),
    );

  it("fails a planted unlisted command that opens with a NULL capability (a guard: refused today too)", () => {
    expect(run(human(name, { body: OWN_BODY }))).toContain(
      `COMMAND_CAPABILITY ${name}`,
    );
  });

  it("passes a listed one whose body is the reviewed body", () => {
    expect(
      run(human(name, { body: OWN_BODY }), {
        entries: [entry],
        reviewed: reviewedFor(OWN_BODY),
      }),
    ).toEqual([]);
  });

  it("fails a listed one whose body changed since its review", () => {
    const changed = OWN_BODY.replace("RETURN NULL;", "RETURN 1;");
    const result = run(human(name, { body: changed }), {
      entries: [entry],
      reviewed: reviewedFor(OWN_BODY),
    });
    expect(result).toContain(`COMMAND_EXCEPTION_UNREVIEWED ${name}`);
    expect(result).toContain(`COMMAND_CAPABILITY ${name}`);
  });

  it.each([
    [
      "a capability literal",
      OWN_BODY.replace(
        "begin_human_command(p_tenant_id, NULL)",
        "begin_human_command(p_tenant_id, 'people.manage_members')",
      ),
    ],
    [
      "one argument",
      OWN_BODY.replace(
        "begin_human_command(p_tenant_id, NULL)",
        "begin_human_command(p_tenant_id)",
      ),
    ],
    [
      "a declaration initialiser first",
      OWN_BODY.replace(
        "v_ctx tenant_guard.command_context;",
        "v_ctx tenant_guard.command_context;\n  v_x int := 1;",
      ),
    ],
  ])(
    "fails a listed one that opens with %s instead of begin_human_command(<tenant>, NULL)",
    (_label, body) => {
      expect(
        run(human(name, { body }), {
          entries: [entry],
          reviewed: reviewedFor(body),
        }),
      ).toContain(`COMMAND_EXCEPTION_UNREVIEWED ${name}`);
    },
  );

  it("fails a listed one that service_role may also execute", () => {
    expect(
      run(human(name, { body: OWN_BODY, service_role: true }), {
        entries: [entry],
        reviewed: reviewedFor(OWN_BODY),
      }),
    ).toContain(`COMMAND_EXCEPTION_UNREVIEWED ${name}`);
  });

  it("keeps every shipped entry reviewed: same names, reasons and one entry each", () => {
    expect(ownMinistryEntries.map((e) => e.function).sort()).toEqual(
      Object.keys(reviewedOwnMinistry).sort(),
    );
    for (const e of ownMinistryEntries)
      expect(reviewedOwnMinistry[e.function]?.reason).toBe(e.reason);
    const res = ownMinistryExceptions(
      [human(name, { body: OWN_BODY })],
      [entry],
      reviewedFor(OWN_BODY),
    );
    expect([...res.allowed]).toEqual([name]);
    expect(res.failures).toEqual([]);
  });
});

describe("W8-R41: one reviewed lookup may anchor a worker wrapper's tenant (AL-2681 PR 2a, ruling on the intake's organization)", () => {
  const lookup = "public.resolve_verified_host(p_host text)";
  const lookupDefiner = definer(lookup, "postgres", true, {
    volatility: "s",
    anon_execute: true,
  });
  const lanes = [command("tenant_guard.begin_line_gift(uuid, text, text)")];
  const judge = (wrappers: object[], anon: unknown = allow(lookup)) =>
    evaluate([], listed(), [lookupDefiner], lanes, anon, { wrappers });
  const sig = "public.begin_line_gift(p_host text, p_surface text)";
  const body = (from: string) =>
    `DECLARE v_tenant uuid; BEGIN SELECT h.tenant_id INTO v_tenant FROM ${from} AS h WHERE h.state = 'active'; IF v_tenant IS NULL THEN RAISE EXCEPTION 'host_not_admitted' USING ERRCODE = '42501'; END IF; RETURN tenant_guard.begin_line_gift(v_tenant, p_host, p_surface); END;`;
  const worker = (fn: string, text: string) =>
    wrapper(fn, text, { service_role: true, language: "plpgsql" });

  it("the list is frozen and names only the reviewed single-host lookup", () => {
    expect(WORKER_WRAPPER_ANCHOR_LOOKUPS).toEqual([
      "public.resolve_verified_host",
    ]);
    expect(Object.isFrozen(WORKER_WRAPPER_ANCHOR_LOOKUPS)).toBe(true);
  });

  it("admits the lookup called with one of the wrapper's own parameters, with or without an alias and a plain predicate", () => {
    expect(
      codes(judge([worker(sig, body("public.resolve_verified_host(p_host)"))])),
    ).toEqual([]);
    expect(
      codes(
        judge([
          worker(
            sig,
            "DECLARE v_tenant uuid; BEGIN SELECT resolve_verified_host.tenant_id INTO v_tenant FROM public.resolve_verified_host(p_host); RETURN tenant_guard.begin_line_gift(v_tenant, p_host, p_surface); END;",
          ),
        ]),
      ),
    ).toEqual([]);
  });

  it.each<[string, string]>([
    ["an unlisted function", "public.lookup_owner(p_host)"],
    [
      "an expression argument",
      "public.resolve_verified_host(pg_catalog.lower(p_host))",
    ],
    ["a literal argument", "public.resolve_verified_host('give.example.org')"],
    ["two arguments", "public.resolve_verified_host(p_host, p_surface)"],
    ["an unqualified call", "resolve_verified_host(p_host)"],
    [
      "a locked read of the lookup",
      "public.resolve_verified_host(p_host) FOR SHARE",
    ],
  ])("refuses %s as the anchor", (_label, from) => {
    expect(codes(judge([worker(sig, body(from))]))).toContain(
      `WORKER_WRAPPER_TENANT_ARGUMENT ${sig}`,
    );
  });

  it("refuses an organization parameter as the lookup's argument", () => {
    const fn = "public.begin_line_gift(p_tenant_host text, p_surface text)";
    const text = body("public.resolve_verified_host(p_tenant_host)").replace(
      "begin_line_gift(v_tenant, p_host,",
      "begin_line_gift(v_tenant, p_tenant_host,",
    );
    expect(codes(judge([worker(fn, text)]))).toContain(
      `WORKER_WRAPPER_TENANT_ARGUMENT ${fn}`,
    );
  });

  it("refuses the lookup while it is not on the anon-definer allowlist, where it is reviewed as a STABLE definer with an empty path", () => {
    expect(
      codes(
        judge(
          [worker(sig, body("public.resolve_verified_host(p_host)"))],
          allow(),
        ),
      ),
    ).toEqual(
      expect.arrayContaining([
        `WORKER_WRAPPER_ANCHOR_LOOKUP_UNREVIEWED ${sig}`,
      ]),
    );
  });

  it("F8: a quoted call of the lookup is the same call: it is refused while the lookup is not on the allowlist", () => {
    expect(
      codes(
        judge(
          [worker(sig, body('public."resolve_verified_host"(p_host)'))],
          allow(),
        ),
      ),
    ).toEqual(
      expect.arrayContaining([
        `WORKER_WRAPPER_ANCHOR_LOOKUP_UNREVIEWED ${sig}`,
      ]),
    );
  });

  it("an unlisted lookup is still a call the wrapper may not make", () => {
    expect(
      codes(judge([worker(sig, body("public.lookup_owner(p_host)"))])),
    ).toContain(`WORKER_WRAPPER_WRITES ${sig}`);
  });
});
