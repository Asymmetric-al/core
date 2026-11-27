import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  ownMinistryEntries,
  reviewedOwnMinistryHelpers,
} from "../../../scripts/verify/command-entry-boundaries.mjs";
import { evaluateTenantRlsCatalog } from "../../../scripts/verify/tenant-rls-catalog.mjs";
import {
  ownMinistryCommandRows,
  ownMinistryHelperRows,
} from "../../fixtures/own-ministry-commands";
import { preMembershipCommandRows } from "../../fixtures/pre-membership-commands";

const OWN_BODY = `
DECLARE
  v_ctx tenant_guard.command_context;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, NULL);
  RETURN NULL;
END;
`;
const NAME = "tenant_guard.submit_example(p_tenant_id uuid, p_title text)";
const REASON = "fixture: own ministry";
const HELPER =
  "tenant_guard.example_helper(p_ctx tenant_guard.command_context)";
const HELPER_BODY = `
BEGIN
  RETURN NULL;
END;
`;
const digest = (body: string) =>
  createHash("sha256").update(body.trim()).digest("hex");

const row = (over: Record<string, unknown> = {}) => ({
  function: NAME,
  schema: "tenant_guard",
  owner: "tenant_guard",
  definer: true,
  language: "plpgsql",
  body: OWN_BODY,
  authenticated: true,
  service_role: false,
  anon: false,
  public_execute: false,
  ...over,
});
const helperRow = (over: Record<string, unknown> = {}) => ({
  function: HELPER,
  schema: "tenant_guard",
  owner: "postgres",
  definer: false,
  language: "plpgsql",
  body: HELPER_BODY,
  authenticated: false,
  service_role: false,
  anon: false,
  public_execute: false,
  ...over,
});

const snapshot = (commands: object[]) => ({
  tables: [],
  definers: [],
  commands,
  wrappers: [],
  grants: [],
  policies: [],
  published: [],
});
const run = (
  commands: object[],
  list: {
    entries: { function: string; reason: string }[];
    reviewed: Record<string, { reason: string; digest: string }>;
    helpers?: Record<string, { reason: string; digest: string }>;
  },
) =>
  evaluateTenantRlsCatalog(
    snapshot(commands),
    { entries: [] },
    { entries: [] },
    { entries: [] },
    [],
    { entries: [] },
    [],
    list,
  ).failures.map(
    (f: { code: string; function?: string }) => `${f.code} ${f.function}`,
  );
const listFor = (
  body = OWN_BODY,
  entries = [{ function: NAME, reason: REASON }],
) => ({
  entries,
  reviewed: { [NAME]: { reason: REASON, digest: digest(body) } },
  helpers: {
    [HELPER]: { reason: "fixture: helper", digest: digest(HELPER_BODY) },
  },
});

describe("AL-2680 WP7 pull request 1, fix round C3: the own-ministry lane pins its helpers and refuses every unreviewed shape", () => {
  it("passes the reviewed command with its reviewed helper", () => {
    expect(run([row(), helperRow()], listFor())).toEqual([]);
  });

  it("fails COMMAND_EXCEPTION_UNREVIEWED when a pinned helper changed, is missing, became a definer or may be executed by a signed-in caller", () => {
    for (const helper of [
      [helperRow({ body: HELPER_BODY.replace("NULL", "1") })],
      [],
      [helperRow({ definer: true })],
      [helperRow({ authenticated: true })],
      [helperRow({ owner: "tenant_guard" })],
    ])
      expect(run([row(), ...helper], listFor())).toContain(
        `COMMAND_EXCEPTION_UNREVIEWED ${HELPER}`,
      );
  });

  it("fails a listed command whose reason is blank or differs from the reviewed one", () => {
    for (const reason of ["  ", "another reason"])
      expect(
        run([row(), helperRow()], {
          ...listFor(),
          entries: [{ function: NAME, reason }],
        }),
      ).toContain(`COMMAND_EXCEPTION_UNREVIEWED ${NAME}`);
  });

  it("fails a command listed twice", () => {
    const entry = { function: NAME, reason: REASON };
    expect(
      run([row(), helperRow()], listFor(OWN_BODY, [entry, entry])),
    ).toContain(`COMMAND_EXCEPTION_UNREVIEWED ${NAME}`);
  });

  it("fails a listed command that is not in the tenant_guard schema", () => {
    expect(run([row({ schema: "public" }), helperRow()], listFor())).toContain(
      `COMMAND_EXCEPTION_UNREVIEWED ${NAME}`,
    );
  });

  it("fails a listed command whose opening sits inside an outer EXCEPTION block", () => {
    const body = OWN_BODY.replace(
      "  RETURN NULL;\nEND;",
      "  RETURN NULL;\nEXCEPTION WHEN OTHERS THEN\n  RETURN NULL;\nEND;",
    );
    expect(run([row({ body }), helperRow()], listFor(body))).toContain(
      `COMMAND_EXCEPTION_UNREVIEWED ${NAME}`,
    );
  });

  it("fails a listed command whose body is not plpgsql", () => {
    expect(run([row({ language: "sql" }), helperRow()], listFor())).toContain(
      `COMMAND_EXCEPTION_UNREVIEWED ${NAME}`,
    );
  });

  it("pins the repository's two lane helpers by signature and body digest, and the shipped rows pass", () => {
    expect(Object.keys(reviewedOwnMinistryHelpers).sort()).toEqual([
      "tenant_guard.lock_live_assignment(p_ctx tenant_guard.command_context, p_capability text)",
      "tenant_guard.own_ministry(p_ctx tenant_guard.command_context)",
    ]);
    for (const pin of Object.values(reviewedOwnMinistryHelpers)) {
      expect(pin.reason.trim()).not.toBe("");
      expect(pin.digest).toMatch(/^[0-9a-f]{64}$/);
    }
    const shipped = evaluateTenantRlsCatalog(
      snapshot([
        ...preMembershipCommandRows(),
        ...ownMinistryCommandRows(),
        ...ownMinistryHelperRows(),
      ]),
      { entries: [] },
      undefined,
      undefined,
      undefined,
      undefined,
      [],
    ).failures;
    expect(shipped).toEqual([]);
    const withoutHelpers = evaluateTenantRlsCatalog(
      snapshot([...preMembershipCommandRows(), ...ownMinistryCommandRows()]),
      { entries: [] },
      undefined,
      undefined,
      undefined,
      undefined,
      [],
    ).failures.map(
      (f: { code: string; function?: string }) => `${f.code} ${f.function}`,
    );
    expect(withoutHelpers.sort()).toEqual(
      Object.keys(reviewedOwnMinistryHelpers)
        .map((fn) => `COMMAND_EXCEPTION_UNREVIEWED ${fn}`)
        .sort(),
    );
    expect(ownMinistryEntries).toHaveLength(2);
  });
});
